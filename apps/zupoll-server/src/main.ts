// prettier-ignore
import * as dotenv from "dotenv";
import * as path from "path";
import { IS_DEPLOYED } from "./util/deployment";

const dotEnvPath = IS_DEPLOYED
  ? `/etc/secrets/.env`
  : path.join(process.cwd(), ".env");

console.log(`[INIT] Loading environment variables from: ${dotEnvPath} `);
dotenv.config({ path: dotEnvPath });

console.log(
  "ZUZALU_PARTICIPANTS_GROUP_URL=",
  process.env.ZUZALU_PARTICIPANTS_GROUP_URL
);
console.log(
  "ZUZALU_ORGANIZERS_GROUP_URL=",
  process.env.ZUZALU_ORGANIZERS_GROUP_URL
);

console.log("[INIT] Starting application");

import { startApplication } from "./application";
startApplication();
