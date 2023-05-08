import { Bot } from "grammy";

export async function sendMessage(message: string, bot?: Bot) {
  if (bot !== undefined) {
    const supergroup_id = process.env.BOT_SUPERGROUP_ID;
    const channel_id = process.env.BOT_CHANNEL_ID;

    if (supergroup_id !== undefined && channel_id !== undefined) {
      const message_thread_id = parseInt(channel_id);
      const chat_id = parseInt(supergroup_id)
      console.log("sending message to", chat_id, message_thread_id);
      if (!isNaN(message_thread_id) && !isNaN(chat_id)) {
        await bot.api.sendMessage(chat_id, message, {
          message_thread_id,
          parse_mode: "MarkdownV2",
        });
      }
    }
  }
}
