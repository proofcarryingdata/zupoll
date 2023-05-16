import { Bot } from "grammy";

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
      const chat_id = parseInt(supergroup_id)
      if (!isNaN(message_thread_id) && !isNaN(chat_id)) {
        await bot.api.sendMessage(chat_id, message, {
          message_thread_id,
          parse_mode: "HTML",
        });
      }
    }
  }
}
