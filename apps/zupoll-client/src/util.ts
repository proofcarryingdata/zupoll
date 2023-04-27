export enum DEPLOYMENT_TYPE {
  LOCAL = "local",
  STAGING = "staging",
  PROD = "prod",
}

const passportURL: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://zupass.org/",
  [DEPLOYMENT_TYPE.STAGING]: "https://zupass.org/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3000/",
};

const passportServerURL: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://api.pcd-passport.com/",
  [DEPLOYMENT_TYPE.STAGING]: "https://api.pcd-passport.com/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3002/",
}

const zupollServerURL: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://zupoll-server.onrender.com/",
  [DEPLOYMENT_TYPE.STAGING]: "https://zupoll-server-staging.onrender.com",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3005/",
};

export const DEPLOYMENT: DEPLOYMENT_TYPE =
  process.env.NEXT_PUBLIC_STAGING === "true"
    ? DEPLOYMENT_TYPE.STAGING
    : process.env.NODE_ENV === "production"
    ? DEPLOYMENT_TYPE.PROD
    : DEPLOYMENT_TYPE.LOCAL;

export const PASSPORT_URL = passportURL[DEPLOYMENT];
export const PASSPORT_SERVER_URL = passportServerURL[DEPLOYMENT];
export const ZUPOLL_SERVER_URL = zupollServerURL[DEPLOYMENT];

export const PARTICIPANTS_GROUP_ID = "1";
export const ADMIN_GROUP_ID = "4";
export const SEMAPHORE_GROUP_URL = `${PASSPORT_SERVER_URL}semaphore/${PARTICIPANTS_GROUP_ID}`;
export const SEMAPHORE_ADMIN_GROUP_URL = `${PASSPORT_SERVER_URL}semaphore/${ADMIN_GROUP_ID}`;
