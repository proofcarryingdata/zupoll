import { startBot } from "./bot";
import { startServer } from "./routing/server";
import { ApplicationContext } from "./types";
import { logger } from "./util/log";

export async function startApplication() {
  const context: ApplicationContext = {
    bot: undefined
  };

  startBot(context).catch((e) => {
    logger.error("failed to start bot", e);
  });

  await startServer(context);
}
