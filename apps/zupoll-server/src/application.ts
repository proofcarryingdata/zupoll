import { startBot } from "./bot";
import { startServer } from "./routing/server";
import { ServiceInitializer } from "./services/types";
import { ApplicationContext } from "./types";

const services: ServiceInitializer[] = [startServer];

export async function startApplication() {
  const context: ApplicationContext = {
    bot: undefined,
  };

  startBot(context);

  for (const service of services) {
    await service(context);
  }
}
