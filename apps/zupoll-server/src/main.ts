// prettier-ignore
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { IS_PROD } from "./util/isProd";

const dotEnvPath = IS_PROD
  ? `/etc/secrets/.env`
  : path.join(process.cwd(), ".env");

console.log(`[INIT] Loading environment variables from: ${dotEnvPath} `);
dotenv.config({ path: dotEnvPath });
console.log("SEMAPHORE_GROUP_URL=", process.env.SEMAPHORE_GROUP_URL);
console.log("SEMAPHORE_ADMIN_GROUP_URL=", process.env.SEMAPHORE_ADMIN_GROUP_URL);

console.log("[INIT] Starting application");

import { startApplication } from "./application";
startApplication();
