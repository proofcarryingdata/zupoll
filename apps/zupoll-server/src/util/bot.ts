import { Ballot, BallotType, Poll, Vote } from "@prisma/client";
import { Bot } from "grammy";
import { BallotTypeNames } from "./types";
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from "grammy/types";
import { prisma } from "./prisma";

export const SITE_URL = process.env.SITE_URL ?? "https://zupoll.org/";

// Removing characters that mess up the HTML parsing of Telegram, as per
// https://core.telegram.org/bots/api#html-style
export function cleanString(str: string) {
  return str.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;");
}

export async function sendMessage(message: string, bot?: Bot) {
  console.log(message);

  if (bot !== undefined) {
    const supergroup_id = process.env.BOT_SUPERGROUP_ID;
    const channel_id = process.env.BOT_CHANNEL_ID;

    if (supergroup_id !== undefined && channel_id !== undefined) {
      const message_thread_id = parseInt(channel_id);
      const chat_id = parseInt(supergroup_id);
      if (!isNaN(message_thread_id) && !isNaN(chat_id)) {
        return await bot.api.sendMessage(chat_id, message, {
          message_thread_id,
          parse_mode: "HTML",
        });
      }
    }
  }
}

export async function sendMessageV2(
  message: string,
  ballotType: BallotType,
  bot?: Bot,
  opts?: {
    reply_markup?: ReplyKeyboardMarkup | InlineKeyboardMarkup;
    userId?: number;
  },
) {
  console.log(`[MESSAGE]`, message);
  if (!bot) throw new Error(`Bot not found`);
  if (!ballotType) throw new Error(`No ballot type found`);
  if (opts?.userId) {
    return [
      await bot.api.sendMessage(opts.userId, message, {
        parse_mode: "HTML",
        ...opts,
      }),
    ];
  }
  // Look up recipients based on ballot

  async function findPollReceiversByBallotType(ballotType: BallotType) {
    const pollReceivers = await prisma.pollReceiver.findMany();
    return pollReceivers.filter((receiver) =>
      receiver.ballotTypes.includes(ballotType),
    );
  }

  const recipients = await findPollReceiversByBallotType(ballotType);
  const res = recipients.map((r) => {
    const [chatId, topicId] = r.tgTopicId.split("_");
    return bot.api.sendMessage(chatId, message, {
      message_thread_id: parseInt(topicId) || undefined,
      parse_mode: "HTML",
    });
  });

  const finished = await Promise.all(res);
  console.log(`Sent poll created msg to ${res.length} chats`);
  return finished;
}

export const formatPollCreated = (ballot: Ballot, polls: Poll[]) => {
  if (!polls) throw new Error(`No polls found`);
  const formatPolls = (polls: Poll[]) => {
    let pollStr = "";
    for (const poll of polls) {
      pollStr += `<i>${poll.body}</i>\n`;
    }
    return pollStr;
  };
  let ballotPost = `A ${BallotTypeNames[ballot.ballotType]} was created!`;
  ballotPost =
    ballotPost +
    `\n\nTitle: <b>${cleanString(ballot.ballotTitle)}</b>` +
    `\nDescription: <i>${cleanString(ballot.ballotDescription)}</i>` +
    `\nQuestions:\n${formatPolls(polls)}` +
    `\nExpiry: <i>${new Date(ballot.expiry).toLocaleString("en-US", {
      timeZone: "America/Denver",
    })}</i>`;

  if (process.env.BOT_ZUPOLL_LINK) {
    ballotPost += `\n\n<a href="${process.env.BOT_ZUPOLL_LINK}?startapp=${ballot.ballotURL}">Vote</a>`;
  }

  ballotPost += `\n\n<a href="${SITE_URL}ballot?id=${ballot.ballotURL}">(Vote via browser)</a>`;

  return ballotPost;
};

export type PollWithVotes =
  | (Poll & {
      votes: Vote[];
    })
  | null;

export function generatePollHTML(
  ballot: Ballot,
  pollsWithVotes?: PollWithVotes[],
) {
  let html = `🦉 <b>${ballot.ballotTitle}</b>\n\n`;

  if (pollsWithVotes) {
    const pollsLite = pollsWithVotes.slice(0, 2);
    pollsLite.map((poll, idx) => {
      if (poll) {
        const question = poll.body;
        const options = poll.options.slice(0, -1);
        const votes = poll.votes;
        const votesPerQuestion: number[] = [];
        for (const v of votes) {
          const currVotes = votesPerQuestion[v.voteIdx];
          if (currVotes) {
            votesPerQuestion[v.voteIdx] = currVotes + 1;
          } else {
            votesPerQuestion[v.voteIdx] = 1;
          }
        }
        const totalVotes = votesPerQuestion.reduce((a, b) => a + b, 0);

        html += `❔ ${question} - <i>${totalVotes} votes </i>\n\n`;

        if (idx < 1) {
          for (let i = 0; i < options.length; i++) {
            const percentage = votesPerQuestion?.[i]
              ? (votesPerQuestion[i] / totalVotes) * 100
              : 0;
            const rounded = Math.round(percentage / 10);
            const numWhite = 10 - rounded;

            html += `<i>${options[i]}:</i>\n\n`;
            html += `${`🟦`.repeat(rounded) + `⬜️`.repeat(numWhite)}`;
            html += ` (${percentage.toFixed(2)}%)\n\n`;
          }
        } else if (idx == 1) html += `⬇`;
      }
    });
  }
  return html;
}
