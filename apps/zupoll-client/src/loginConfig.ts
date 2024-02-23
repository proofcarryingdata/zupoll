import {
  DEVCONNECT_ADMINS_GROUP_URL,
  DEVCONNECT_ATTENDEES_GROUP_URL,
  EDGE_CITY_ORGANIZERS_GROUP_ID,
  EDGE_CITY_ORGANIZERS_GROUP_URL,
  EDGE_CITY_RESIDENTS_GROUP_ID,
  EDGE_CITY_RESIDENTS_GROUP_URL,
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

export const EDGE_CITY_RESIDENT_CONFIG: LoginConfig = {
  groupId: EDGE_CITY_RESIDENTS_GROUP_ID,
  groupUrl: EDGE_CITY_RESIDENTS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.EDGE_CITY_RESIDENT,
  prompt: "Edge City Resident",
};

export const EDGE_CITY_ORGANIZER_CONFIG: LoginConfig = {
  groupId: EDGE_CITY_ORGANIZERS_GROUP_ID,
  groupUrl: EDGE_CITY_ORGANIZERS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.EDGE_CITY_ORGANIZER,
  prompt: "Edge City Organizer",
};

export const ZUZALU_ORGANIZER_LOGIN_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.ZuzaluOrganizers,
  groupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.ZUZALU_ORGANIZER,
  prompt: "Zuzalu Organizer",
};

export const ZUZALU_PARTICIPANT_LOGIN_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.ZuzaluParticipants,
  groupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.ZUZALU_PARTICIPANT,
  prompt: "ZuConnect Resident",
};

export const PCDPASS_USER_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.Everyone,
  groupUrl: PCDPASS_USERS_GROUP_URL,
  passportServerUrl: PCDPASS_SERVER_URL,
  passportAppUrl: PCDPASS_URL,
  name: LoginConfigurationName.PCDPASS_USER,
  prompt: "PCDPass User",
};

export const DEVCONNECT_USER_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.DevconnectAttendees,
  groupUrl: DEVCONNECT_ATTENDEES_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.DEVCONNECT_PARTICIPANT,
  prompt: "Devconnect Resident",
};

export const DEVCONNECT_ORGANIZER_CONFIG: LoginConfig = {
  groupId: SemaphoreGroups.DevconnectOrganizers,
  groupUrl: DEVCONNECT_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.DEVCONNECT_ORGANIZER,
  prompt: "Devconnect Organizer",
};
