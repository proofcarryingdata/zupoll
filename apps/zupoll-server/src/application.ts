import { startServer } from "./routing/server";
import { ServiceInitializer } from "./services/types";
import { ApplicationContext } from "./types";
import { Bot } from "grammy";

const services: ServiceInitializer[] = [startServer];

export async function startApplication() {
  let context: ApplicationContext = {};
  const botToken = process.env.BOT_TOKEN;
  if (botToken !== undefined) {
    context = {
      bot: new Bot(botToken),
    };
    context.bot?.start();
  }
  for (const service of services) {
    await service(context);
  }
}
