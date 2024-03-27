import { startBot } from "./bot";
import { startServer } from "./routing/server";
import { ApplicationContext } from "./types";

export async function startApplication() {
  const context: ApplicationContext = {
    bot: undefined
  };

  startBot(context).catch((e) => {
    console.log("failed to start bot", e);
  });

  await startServer(context);
}
