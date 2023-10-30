import { Ballot, BallotType, Poll, Vote } from "@prisma/client";
import { Bot } from "grammy";

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

export const formatPollCreated = (ballot: Ballot, polls: Poll[]) => {
  const formatPolls = (polls: Poll[]) => {
    let pollStr = "";
    for (const poll of polls) {
      pollStr += `<i>${poll.body}</i>\n`;
    }
    return pollStr;
  };
  console.log(`polls`, polls);
  let ballotPost =
    ballot.ballotType === BallotType.STRAWPOLL
      ? "New straw poll posted!"
      : "New advisory vote posted!";
  ballotPost =
    ballotPost +
    `\n\nTitle: <b>${cleanString(ballot.ballotTitle)}</b>` +
    `\nDescription: <i>${cleanString(ballot.ballotDescription)}</i>` +
    `\nQuestions:\n${formatPolls(polls)}` +
    `\nExpiry: <i>${new Date(ballot.expiry).toLocaleString("en-US", {
      timeZone: "Asia/Istanbul",
    })}</i>` +
    `\n\n<a href="${SITE_URL}/ballot?id=${ballot.ballotURL}">Vote/View</a>`;
  console.log(`Post`, ballotPost);
  return ballotPost;
};

export type PollWithVotes =
  | (Poll & {
      votes: Vote[];
    })
  | null;

export function generatePollHTML(pollsWithVotes?: PollWithVotes[]) {
  let html = "";

  if (pollsWithVotes) {
    for (const pollWithVotes of pollsWithVotes) {
      if (pollWithVotes) {
        const question = pollWithVotes.body;
        const options = pollWithVotes.options.slice(0, -1);
        console.log(`poll options`, options);
        const votes = pollWithVotes.votes;
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

        console.log(`totalVotes`, totalVotes);
        console.log(`votes`, votes);
        console.log(`votes per question`, votesPerQuestion);

        html += `<b>${question}</b> - <i>${totalVotes} votes </i>\n\n`;

        for (let i = 0; i < options.length; i++) {
          const percentage = (votesPerQuestion[i] / totalVotes) * 100;
          const rounded = Math.round(percentage / 10);
          const numWhite = 10 - rounded;

          html += `<i>${options[i]}:</i>\n\n`;
          html += `${`🟦`.repeat(rounded) + `⬜️`.repeat(numWhite)}`;
          html += ` (${percentage.toFixed(2)}%)\n\n`;
        }
      }
      //
    }
  }
  return html;
}
