export const IS_PROD = process.env.NODE_ENV === "production";

export const PASSPORT_URL = IS_PROD
  ? "https://zupass.org/"
  : "http://localhost:3000/";

export const PASSPORT_SERVER_URL = IS_PROD
  ? "https://api.pcd-passport.com/"
  : "http://localhost:3002/";

export const ZUPOLL_SERVER_URL = IS_PROD
  ? "https://zupoll-server.onrender.com/"
  : "http://localhost:3005/";

export const PARTICIPANTS_GROUP_ID = "1";
export const ADMIN_GROUP_ID = "4";

export const SEMAPHORE_GROUP_URL = IS_PROD
  ? `https://api.pcd-passport.com/semaphore/${PARTICIPANTS_GROUP_ID}`
  : `http://localhost:3002/semaphore/${PARTICIPANTS_GROUP_ID}`;

export const SEMAPHORE_ADMIN_GROUP_URL = IS_PROD
  ? `https://api.pcd-passport.com/semaphore/${ADMIN_GROUP_ID}`
  : `http://localhost:3002/semaphore/${ADMIN_GROUP_ID}`;
