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

export const STRAWPOLL_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: ZUZALU_PARTICIPANTS_GROUP_ID,
  voterGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  creatorGroupId: ZUZALU_PARTICIPANTS_GROUP_ID,
  creatorGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: BallotType.STRAWPOLL,
};

export const ADVISORY_VOTE_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: ZUZALU_PARTICIPANTS_GROUP_ID,
  voterGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  creatorGroupId: ZUZALU_ADMINS_GROUP_ID,
  creatorGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: BallotType.ADVISORYVOTE,
};

export const ORGANIZER_ONLY_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: ZUZALU_ADMINS_GROUP_ID,
  voterGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  creatorGroupId: ZUZALU_ADMINS_GROUP_ID,
  creatorGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  name: BallotType.ORGANIZERONLY,
};

export const PCDPASS_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: PCDPASS_USERS_GROUP_ID,
  voterGroupUrl: PCDPASS_USERS_GROUP_URL,
  creatorGroupId: PCDPASS_USERS_GROUP_ID,
  creatorGroupUrl: PCDPASS_USERS_GROUP_URL,
  passportServerUrl: PCDPASS_SERVER_URL,
  passportAppUrl: PCDPASS_URL,
  name: BallotType.PCDPASSUSER,
};

export const BALLOT_CONFIGS = {
  [BallotType.ADVISORYVOTE]: ADVISORY_VOTE_BALLOT_CONFIG,
  [BallotType.ORGANIZERONLY]: ORGANIZER_ONLY_BALLOT_CONFIG,
  [BallotType.PCDPASSUSER]: PCDPASS_BALLOT_CONFIG,
  [BallotType.STRAWPOLL]: STRAWPOLL_BALLOT_CONFIG,
};
