export enum DEPLOYMENT_TYPE {
  LOCAL = "local",
  LOCAL_HTTPS = "localHttps",
  STAGING = "staging",
  PROD = "prod",
}

const zupassUrl: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://zupass.org/",
  [DEPLOYMENT_TYPE.STAGING]: "https://staging.zupass.org/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3000/",
  [DEPLOYMENT_TYPE.LOCAL_HTTPS]: "https://dev.local:3000/",
};

const zuzaluPassportServerURL: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://api.zupass.org/",
  [DEPLOYMENT_TYPE.STAGING]: "https://api-staging.zupass.org/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3002/",
  [DEPLOYMENT_TYPE.LOCAL_HTTPS]: "https://dev.local:3002/",
};

const pcdpassUrl: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://pcdpass.xyz/",
  [DEPLOYMENT_TYPE.STAGING]: "https://staging.pcdpass.xyz/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3000/",
  [DEPLOYMENT_TYPE.LOCAL_HTTPS]: "https://dev.local:3000/",
};

const pcdpassServerUrl: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://api.pcdpass.xyz/",
  [DEPLOYMENT_TYPE.STAGING]: "https://api-staging.pcdpass.xyz/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3002/",
  [DEPLOYMENT_TYPE.LOCAL_HTTPS]: "https://dev.local:3002/",
};

const zupollServerURL: Record<DEPLOYMENT_TYPE, string> = {
  [DEPLOYMENT_TYPE.PROD]: "https://api.zupoll.org/",
  [DEPLOYMENT_TYPE.STAGING]: "https://api-staging.zupoll.org/",
  [DEPLOYMENT_TYPE.LOCAL]: "http://localhost:3105/",
  [DEPLOYMENT_TYPE.LOCAL_HTTPS]: "https://dev.local:3105/",
};

export const DEPLOYMENT: DEPLOYMENT_TYPE =
  process.env.NEXT_PUBLIC_STAGING === "true"
    ? DEPLOYMENT_TYPE.STAGING
    : process.env.NEXT_PUBLIC_IS_LOCAL_HTTPS === "true"
    ? DEPLOYMENT_TYPE.LOCAL_HTTPS
    : process.env.NODE_ENV === "production"
    ? DEPLOYMENT_TYPE.PROD
    : DEPLOYMENT_TYPE.LOCAL;

console.log({ DEPLOYMENT }, process.env.NEXT_PUBLIC_IS_LOCAL_HTTPS);

export const enum SemaphoreGroups {
  ZuzaluParticipants = "1",
  ZuzaluResidents = "2",
  ZuzaluVisitors = "3",
  ZuzaluOrganizers = "4",
  Everyone = "5",
  DevconnectAttendees = "6",
  DevconnectOrganizers = "7",
}

export const ZUPASS_URL = zupassUrl[DEPLOYMENT];
export const PCDPASS_URL = pcdpassUrl[DEPLOYMENT];

export const ZUPASS_SERVER_URL = zuzaluPassportServerURL[DEPLOYMENT];
export const PCDPASS_SERVER_URL = pcdpassServerUrl[DEPLOYMENT];
export const ZUPOLL_SERVER_URL = zupollServerURL[DEPLOYMENT];

export const ZUZALU_PARTICIPANTS_GROUP_URL = `${ZUPASS_SERVER_URL}semaphore/${SemaphoreGroups.ZuzaluParticipants}`;
export const ZUZALU_ADMINS_GROUP_URL = `${ZUPASS_SERVER_URL}semaphore/${SemaphoreGroups.ZuzaluOrganizers}`;
export const DEVCONNECT_ADMINS_GROUP_URL = `${ZUPASS_SERVER_URL}semaphore/${SemaphoreGroups.DevconnectOrganizers}`;
export const DEVCONNECT_ATTENDEES_GROUP_URL = `${ZUPASS_SERVER_URL}semaphore/${SemaphoreGroups.DevconnectAttendees}`;
export const PCDPASS_USERS_GROUP_URL = `${PCDPASS_SERVER_URL}semaphore/${SemaphoreGroups.Everyone}`;
