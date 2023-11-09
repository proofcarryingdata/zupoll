import {
  DEVCONNECT_ADMINS_GROUP_URL,
  DEVCONNECT_ATTENDEES_GROUP_URL,
  PCDPASS_SERVER_URL,
  PCDPASS_URL,
  PCDPASS_USERS_GROUP_URL,
  SemaphoreGroups,
  ZUPASS_SERVER_URL,
  ZUPASS_URL,
  ZUZALU_ADMINS_GROUP_URL,
  ZUZALU_PARTICIPANTS_GROUP_URL,
} from "./env";
import { LoginConfig, LoginConfigurationName } from "./types";

console.log({ ZUPASS_URL });
export const ZUZALU_ORGANIZER_LOGIN_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.ZuzaluOrganizers,
  groupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.ZUZALU_ORGANIZER,
};

export const ZUZALU_PARTICIPANT_LOGIN_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.ZuzaluParticipants,
  groupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.ZUZALU_PARTICIPANT,
};

export const PCDPASS_USER_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.Everyone,
  groupUrl: PCDPASS_USERS_GROUP_URL,
  passportServerUrl: PCDPASS_SERVER_URL,
  passportAppUrl: PCDPASS_URL,
  name: LoginConfigurationName.PCDPASS_USER,
};

export const DEVCONNECT_USER_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.DevconnectAttendees,
  groupUrl: DEVCONNECT_ATTENDEES_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.DEVCONNECT_PARTICIPANT,
};

export const DEVCONNECT_ORGANIZER_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.DevconnectOrganizers,
  groupUrl: DEVCONNECT_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.DEVCONNECT_ORGANIZER,
};
