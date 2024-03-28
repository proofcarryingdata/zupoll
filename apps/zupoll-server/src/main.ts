// prettier-ignore
import * as dotenv from "dotenv";
import * as path from "path";
import { IS_DEPLOYED } from "./util/deployment";
import { logger } from "./util/log";

const dotEnvPath = IS_DEPLOYED
  ? `/etc/secrets/.env`
  : path.join(process.cwd(), ".env");

logger.info(`[INIT] Loading environment variables from: ${dotEnvPath} `);
dotenv.config({ path: dotEnvPath });
logger.info("[INIT] Starting application");

import { startApplication } from "./application";
startApplication();
