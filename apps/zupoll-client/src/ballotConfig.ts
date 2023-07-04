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
import { BallotType } from "./prismaTypes";
import { BallotConfig } from "./types";

export const strawpollConfiguration: BallotConfig = {
  voterGroupId: ZUZALU_PARTICIPANTS_GROUP_ID,
  voterGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  creatorGroupId: ZUZALU_PARTICIPANTS_GROUP_ID,
  creatorGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: BallotType.STRAWPOLL,
};

export const advisoryVoteConfiguration: BallotConfig = {
  voterGroupId: ZUZALU_PARTICIPANTS_GROUP_ID,
  voterGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  creatorGroupId: ZUZALU_ADMINS_GROUP_ID,
  creatorGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: BallotType.ADVISORYVOTE,
};

export const organizerOnlyConfiguration: BallotConfig = {
  voterGroupId: ZUZALU_ADMINS_GROUP_ID,
  voterGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  creatorGroupId: ZUZALU_ADMINS_GROUP_ID,
  creatorGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: BallotType.ORGANIZERONLY,
};

export const pcdpassUserConfiguration: BallotConfig = {
  voterGroupId: PCDPASS_USERS_GROUP_ID,
  voterGroupUrl: PCDPASS_USERS_GROUP_URL,
  creatorGroupId: PCDPASS_USERS_GROUP_ID,
  creatorGroupUrl: PCDPASS_USERS_GROUP_URL,
  passportServerUrl: PCDPASS_SERVER_URL,
  passportAppUrl: PCDPASS_URL,
  name: BallotType.PCDPASSUSER,
};

export const ballotConfigs = {
  [BallotType.ADVISORYVOTE]: advisoryVoteConfiguration,
  [BallotType.ORGANIZERONLY]: organizerOnlyConfiguration,
  [BallotType.PCDPASSUSER]: pcdpassUserConfiguration,
  [BallotType.STRAWPOLL]: strawpollConfiguration,
};
