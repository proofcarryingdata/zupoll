import { startServer } from "./routing/server";
import { ServiceInitializer } from "./services/types";
import { ApplicationContext } from "./types";
import { Bot } from "grammy";
import { CronJob } from "cron";
import { prisma } from "./util/prisma";
import { SITE_URL } from "./util/auth";
import { cleanString, sendMessage } from "./util/bot";

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
    "0,15,30,45 * * * *", // every 15 minutes
    async () => {
      const ballots = await prisma.ballot.findMany({
        select: {
          ballotTitle: true,
          ballotURL: true,
          expiry: true,
          expiryNotif: true,
        },
        orderBy: { expiry: "desc" },
      });

      for (const ballot of ballots) {
        const hours = Math.ceil(
          (new Date(ballot.expiry).getTime() - Date.now()) / (1000 * 60 * 60)
        );
        const days = Math.ceil(hours / 24);

        const sharedMessage = `\n\nVote at ${SITE_URL}ballot?id=${ballot.ballotURL}`;

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
          )}</b> will expire in <1 week.${sharedMessage}`;
          await sendMessage(expiryMessage, context.bot);

        } else if (
          days === 1 &&
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
          )}</b> will expire in <24 hours.${sharedMessage}`;
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
          )}</b> will expire in <1 hour!${sharedMessage}`;
          await sendMessage(expiryMessage, context.bot);
        }
      }
    },
  );
  
  cronJob.start();

  for (const service of services) {
    await service(context);
  }
}
