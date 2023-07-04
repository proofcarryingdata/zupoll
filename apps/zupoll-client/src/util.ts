import {
  PCDPASS_SERVER_URL,
  PCDPASS_URL,
  PCDPASS_USERS_GROUP_ID,
  PCDPASS_USERS_GROUP_URL,
  ZUPASS_SERVER_URL,
  ZUPASS_URL,
  ZUZALU_ADMINS_GROUP_ID,
  ZUZALU_ADMINS_GROUP_URL,
  ZUZALU_PARTICIPANTS_GROUP_ID,
  ZUZALU_PARTICIPANTS_GROUP_URL,
} from "./env";
import { LoginConfiguration, LoginConfigurationName } from "./types";

export const zuzaluOrganizerConfiguration: LoginConfiguration = {
  groupId: ZUZALU_ADMINS_GROUP_ID,
  groupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.ZUZALU_ORGANIZER,
};

export const zuzaluParticipantConfiguration: LoginConfiguration = {
  groupId: ZUZALU_PARTICIPANTS_GROUP_ID,
  groupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: LoginConfigurationName.ZUZALU_PARTICIPANT,
};

export const pcdpassUserConfiguration: LoginConfiguration = {
  groupId: PCDPASS_USERS_GROUP_ID,
  groupUrl: PCDPASS_USERS_GROUP_URL,
  passportServerUrl: PCDPASS_SERVER_URL,
  passportAppUrl: PCDPASS_URL,
  name: LoginConfigurationName.PCDPASS_USER,
};
