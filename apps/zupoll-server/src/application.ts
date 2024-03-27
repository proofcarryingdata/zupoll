import { startBot } from "./bot";
import { startServer } from "./routing/server";
import { ApplicationContext } from "./types";

export interface ServiceInitializer {
  (context: ApplicationContext): void;
}

const services: ServiceInitializer[] = [startServer];

export async function startApplication() {
  const context: ApplicationContext = {
    bot: undefined
  };

  startBot(context).catch((e) => {
    console.log("failed to start bot", e);
  });

  for (const service of services) {
    await service(context);
  }
}
