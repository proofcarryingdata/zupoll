import { BallotType } from "@prisma/client";
import { CronJob } from "cron";
import { Bot } from "grammy";
import { startServer } from "./routing/server";
import { ServiceInitializer } from "./services/types";
import { ApplicationContext } from "./types";
import { SITE_URL } from "./util/auth";
import { cleanString, sendMessage } from "./util/bot";
import { prisma } from "./util/prisma";

const services: ServiceInitializer[] = [startServer];

export async function startApplication() {
  let context: ApplicationContext = {};

  // start up bot
  const botToken = process.env.BOT_TOKEN;
  if (botToken !== undefined) {
    context = {
      bot: new Bot(botToken),
    };
    context.bot?.start();
  }

  // start up cron jobs
  const cronJob = new CronJob(
    "0,15,30,45 * * * *", // every 15 minutes, check if any ballots are expiring soon
    async () => {
      const ballots = await prisma.ballot.findMany({
        select: {
          ballotTitle: true,
          ballotURL: true,
          expiry: true,
          expiryNotif: true,
        },
        orderBy: { expiry: "desc" },
        where: {
          NOT: {
            ballotType: {
              in: [BallotType.PCDPASSUSER, BallotType.ORGANIZERONLY],
            },
          },
        },
      });

      for (const ballot of ballots) {
        const minutes = Math.ceil(
          (new Date(ballot.expiry).getTime() - Date.now()) / 60000
        );
        const hours = Math.ceil(minutes / 60);
        const days = Math.ceil(minutes / (24 * 60));

        const pollUrl = `${SITE_URL}ballot?id=${ballot.ballotURL}`;

        if (days === 7 && ballot.expiryNotif === "NONE") {
          await prisma.ballot.update({
            where: {
              ballotURL: ballot.ballotURL,
            },
            data: {
              expiryNotif: "WEEK",
            },
          });

          const expiryMessage = `<b>${cleanString(
            ballot.ballotTitle
          )}</b> will expire in less than 1 week. Vote at ${pollUrl}`;
          await sendMessage(expiryMessage, context.bot);
        } else if (
          hours === 24 &&
          (ballot.expiryNotif === "WEEK" || ballot.expiryNotif === "NONE")
        ) {
          await prisma.ballot.update({
            where: {
              ballotURL: ballot.ballotURL,
            },
            data: {
              expiryNotif: "DAY",
            },
          });

          const expiryMessage = `<b>${cleanString(
            ballot.ballotTitle
          )}</b> will expire in less than 24 hours. Vote at ${pollUrl}`;
          await sendMessage(expiryMessage, context.bot);
        } else if (
          hours === 1 &&
          (ballot.expiryNotif === "DAY" || ballot.expiryNotif === "NONE")
        ) {
          await prisma.ballot.update({
            where: {
              ballotURL: ballot.ballotURL,
            },
            data: {
              expiryNotif: "HOUR",
            },
          });

          const expiryMessage = `<b>${cleanString(
            ballot.ballotTitle
          )}</b> will expire in less than 1 hour! Get your votes in at ${pollUrl}`;
          await sendMessage(expiryMessage, context.bot);
        }
      }
    }
  );

  cronJob.start();

  for (const service of services) {
    await service(context);
  }
}
