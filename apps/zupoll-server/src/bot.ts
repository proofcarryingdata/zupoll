import { BallotType } from "@prisma/client";
import { Api, Bot, Context, InlineKeyboard, RawApi } from "grammy";
import { ApplicationContext } from "./types";
import {
  SITE_URL,
  cleanString,
  formatPollCreated,
  sendMessageV2,
} from "./util/bot";
import { sleep } from "@pcd/util";
import { prisma } from "./util/prisma";
import { CronJob } from "cron";

const findBallots = async (bot: Bot<Context, Api<RawApi>>) => {
  console.log(`Running find ballots: ${Date.now()}`);
  const ballots = await prisma.ballot.findMany({
    select: {
      ballotTitle: true,
      ballotURL: true,
      expiry: true,
      expiryNotif: true,
      ballotType: true,
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
      )}</b> will expire in less than 1 week.\n\nVote <a href="${tgPollUrl}">here</a> or in <a href="${pollUrl}">browser</a>`;
      await sendMessageV2(expiryMessage, ballot.ballotType, bot);
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
      )}</b> will expire in less than 24 hours.\n\nVote <a href="${tgPollUrl}">here</a> or in <a href="${pollUrl}">browser</a>`;
      await sendMessageV2(expiryMessage, ballot.ballotType, bot);
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
      )}</b> will expire in less than 1 hour!\n\nVote <a href="${tgPollUrl}">here</a> or in <a href="${pollUrl}">browser</a>`;
      await sendMessageV2(expiryMessage, ballot.ballotType, bot);
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

  context.bot.command("latest", async (ctx) => {
    try {
      const ballots = await prisma.ballot.findMany({
        select: {
          ballotTitle: true,
          ballotURL: true,
          expiry: true,
          expiryNotif: true,
          ballotDescription: true,
          polls: true,
          ballotType: true,
        },
      });
      for (const ballot of ballots) {
        // @ts-expect-error prisma
        const post = formatPollCreated(ballot, ballot.polls);
        await sendMessageV2(post, ballot.ballotType, context.bot, {
          userId: ctx.from?.id,
        });
      }
    } catch (error) {
      //
    }
  });

  context.bot.command("listen", async (ctx) => {
    const message_thread_id = ctx.message?.message_thread_id;
    const chatId = ctx.chat.id;
    const topicId = ctx.update.message?.message_thread_id || 0;
    const tgTopicId = `${chatId}_${topicId}`;
    try {
      if (!ctx.match) throw new Error(`No polls to listen to found`);
      const ballotTypes = ctx.match.split(",") as BallotType[];
      ballotTypes.forEach((p) => {
        if (!Object.values(BallotType).includes(p))
          throw new Error(`POLL TYPE INVALID`);
      });
      const topicExists = await prisma.tGTopic.findFirst({
        where: { id: tgTopicId },
      });
      if (!topicExists)
        throw new Error(`Topic not found in DB. Edit it and try again`);
      // Upsert in DB
      await prisma.pollReceiver.upsert({
        where: {
          tgTopicId,
        },
        update: {
          ballotTypes,
        },
        create: {
          tgTopicId,
          ballotTypes,
        },
      });
      ctx.reply(`Listening to ${ballotTypes}`, {
        message_thread_id,
      });
    } catch (error) {
      ctx.reply(`${error}`, {
        message_thread_id,
      });
    }
  });

  context.bot.command("stoplisten", async (ctx) => {
    const message_thread_id = ctx.message?.message_thread_id;
    const chatId = ctx.chat.id;
    const topicId = ctx.update.message?.message_thread_id || 0;
    const tgTopicId = `${chatId}_${topicId}`;
    try {
      await prisma.pollReceiver.delete({ where: { tgTopicId } });

      ctx.reply(`No longer listening to polls`, { message_thread_id });
    } catch (error) {
      ctx.reply(`${error}`, {
        message_thread_id,
      });
    }
  });

  context.bot.on(":forum_topic_edited", async (ctx) => {
    try {
      const topicName = ctx.update?.message?.forum_topic_edited.name;
      const chatId = ctx.chat.id;
      const topicId = ctx.update.message?.message_thread_id || 0;
      if (!topicName) throw new Error(`No topic name found`);
      console.log(`EDITED`, topicName);
      const id = `${chatId}_${topicId}`;
      await prisma.tGTopic.upsert({
        where: {
          id,
        },
        update: {
          topicName,
        },
        create: {
          id,
          topicId,
          chatId,
          topicName,
        },
      });
    } catch (error) {
      console.log(`[TOPIC EDITED ERROR]`, error);
    }
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
    // "* * * * *",
    "0,15,30,45 * * * *", // every 15 minutes, check if any ballots are expiring soon
    async () => {
      if (context.bot) {
        await findBallots(context.bot);
      }
    }
  );

  cronJob.start();

  console.log("started bot");
}
