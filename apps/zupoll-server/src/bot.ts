import { BallotType } from "@prisma/client";
import { Api, Bot, Context, InlineKeyboard, RawApi } from "grammy";
import { ApplicationContext } from "./types";
import {
  SITE_URL,
  cleanString,
  formatPollCreated,
  sendMessage,
} from "./util/bot";
import { sleep } from "@pcd/util";
import { CronJob } from "cron";

const findBallots = async (bot: Bot<Context, Api<RawApi>>) => {
  console.log(`Running find ballots: ${Date.now()}`);
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

    const pollUrl = `${SITE_URL}/ballot?id=${ballot.ballotURL}`;
    const tgPollUrl = process.env.BOT_ZUPOLL_LINK
      ? `${process.env.BOT_ZUPOLL_LINK}/?startapp=${ballot.ballotURL}`
      : undefined;

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
      )}</b> will expire in less than 1 week. Vote at ${
        tgPollUrl + " or " || ""
      }${pollUrl}`;
      await sendMessage(expiryMessage, bot);
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
      )}</b> will expire in less than 24 hours. Vote at ${
        tgPollUrl + " or " || ""
      }${pollUrl}`;
      await sendMessage(expiryMessage, bot);
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
      )}</b> will expire in less than 1 hour! Get your votes in at ${
        tgPollUrl + " or " || ""
      }${pollUrl}`;
      await sendMessage(expiryMessage, bot);
    }
  }
};

export async function startBot(context: ApplicationContext): Promise<void> {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    console.log(`missing botToken, not starting bot`);
    return;
  }

  // there can only be one bot active at a time - give the old service
  // some time to stop before starting the bot
  // await sleep(30 * 1000);
  context.bot = new Bot(botToken);

  context.bot.command("start", async (ctx) => {
    ctx.reply(`Zupoll`, {
      reply_markup: new InlineKeyboard().webApp(`Zupoll`, `https://zupoll.org`),
    });
  });

  context.bot.command("latest", async () => {
    const ballots = await prisma.ballot.findMany({
      select: {
        ballotTitle: true,
        ballotURL: true,
        expiry: true,
        expiryNotif: true,
        ballotDescription: true,
        polls: true,
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
    console.log(`[BALLOTS]`, ballots);
    for (const ballot of ballots.slice(0, 1)) {
      // @ts-expect-error prisma
      const post = formatPollCreated(ballot, ballot.polls);
      await sendMessage(post, context.bot);
    }
    // await ctx.reply(`Check console for ballots`, {
    //   message_thread_id: ctx.message?.message_thread_id,
    // });
    // List most recent ballots
  });

  await sleep(5000);

  context.bot.start({
    allowed_updates: ["message"],
    onStart(info) {
      console.log(`[TELEGRAM] Started bot '${info.username}' successfully!`);
    },
  });

  context.bot.catch((error) => console.log(`[TELEGRAM] Bot error`, error));

  // start up cron jobs
  const cronJob = new CronJob(
    "* * * * *", // Every minute
    // "0,15,30,45 * * * *", // every 15 minutes, check if any ballots are expiring soon
    async () => {
      if (context.bot) {
        await findBallots(context.bot);
      }
    }
  );

  cronJob.start();

  console.log("started bot");
}
