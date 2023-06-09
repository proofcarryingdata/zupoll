export enum DEPLOYMENT_TYPE {
  LOCAL = "local",
  STAGING = "staging",
  PROD = "prod",
}

const zupassUrl: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://zupass.org/",
  [DEPLOYMENT_TYPE.STAGING]: "https://staging.zupass.org/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3000/",
};

const zuzaluPassportServerURL: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://api.zupass.org/",
  [DEPLOYMENT_TYPE.STAGING]: "https://api-staging.zupass.org/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3002/",
};

const pcdpassUrl: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://pcdpass.xyz/",
  [DEPLOYMENT_TYPE.STAGING]: "https://staging.pcdpass.xyz/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3000/",
};

const pcdpassServerUrl: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://api.pcdpass.xyz/",
  [DEPLOYMENT_TYPE.STAGING]: "https://api-staging.pcdpass.xyz/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3002/",
};

const zupollServerURL: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://api.zupoll.org/",
  [DEPLOYMENT_TYPE.STAGING]: "https://api-staging.zupoll.org/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3005/",
};

export const DEPLOYMENT: DEPLOYMENT_TYPE =
  process.env.NEXT_PUBLIC_STAGING === "true"
    ? DEPLOYMENT_TYPE.STAGING
    : process.env.NODE_ENV === "production"
    ? DEPLOYMENT_TYPE.PROD
    : DEPLOYMENT_TYPE.LOCAL;

export const ZUPASS_URL = zupassUrl[DEPLOYMENT];
export const PCDPASS_URL = pcdpassUrl[DEPLOYMENT];

export const ZUPASS_SERVER_URL = zuzaluPassportServerURL[DEPLOYMENT];
export const PCDPASS_SERVER_URL = pcdpassServerUrl[DEPLOYMENT];
export const ZUPOLL_SERVER_URL = zupollServerURL[DEPLOYMENT];

export const ZUZALU_PARTICIPANTS_GROUP_ID = "1";
export const ZUZALU_ADMINS_GROUP_ID = "4";
export const PCDPASS_USERS_GROUP_ID = "5";

export const ZUZALU_PARTICIPANTS_GROUP_URL = `${ZUPASS_SERVER_URL}semaphore/${ZUZALU_PARTICIPANTS_GROUP_ID}`;
export const ZUZALU_ADMINS_GROUP_URL = `${ZUPASS_SERVER_URL}semaphore/${ZUZALU_ADMINS_GROUP_ID}`;
export const PCDPASS_USERS_GROUP_URL = `${PCDPASS_SERVER_URL}semaphore/${PCDPASS_USERS_GROUP_ID}`;
