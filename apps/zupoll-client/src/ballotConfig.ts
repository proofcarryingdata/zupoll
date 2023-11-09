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
import { BallotType } from "./prismaTypes";
import { BallotConfig } from "./types";

export const STRAWPOLL_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: SemaphoreGroups.ZuzaluParticipants,
  voterGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  creatorGroupId: SemaphoreGroups.ZuzaluParticipants,
  creatorGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  ballotType: BallotType.STRAWPOLL,
};

export const ADVISORY_VOTE_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: SemaphoreGroups.ZuzaluParticipants,
  voterGroupUrl: ZUZALU_PARTICIPANTS_GROUP_URL,
  creatorGroupId: SemaphoreGroups.ZuzaluOrganizers,
  creatorGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  ballotType: BallotType.ADVISORYVOTE,
};

export const ORGANIZER_ONLY_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: SemaphoreGroups.ZuzaluOrganizers,
  voterGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  creatorGroupId: SemaphoreGroups.ZuzaluOrganizers,
  creatorGroupUrl: ZUZALU_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  ballotType: BallotType.ORGANIZERONLY,
};

export const PCDPASS_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: SemaphoreGroups.Everyone,
  voterGroupUrl: PCDPASS_USERS_GROUP_URL,
  creatorGroupId: SemaphoreGroups.Everyone,
  creatorGroupUrl: PCDPASS_USERS_GROUP_URL,
  passportServerUrl: PCDPASS_SERVER_URL,
  passportAppUrl: PCDPASS_URL,
  ballotType: BallotType.PCDPASSUSER,
};

export const DEVCONNECT_ATTENDEE_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: SemaphoreGroups.DevconnectAttendees,
  voterGroupUrl: DEVCONNECT_ATTENDEES_GROUP_URL,
  creatorGroupId: SemaphoreGroups.DevconnectAttendees,
  creatorGroupUrl: DEVCONNECT_ATTENDEES_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  ballotType: BallotType.DEVCONNECT_STRAW,
};

export const DEVCONNECT_ORGANIZER_BALLOT_CONFIG: BallotConfig = {
  voterGroupId: SemaphoreGroups.DevconnectAttendees,
  voterGroupUrl: DEVCONNECT_ATTENDEES_GROUP_URL,
  creatorGroupId: SemaphoreGroups.DevconnectOrganizers,
  creatorGroupUrl: DEVCONNECT_ADMINS_GROUP_URL,
  passportServerUrl: ZUPASS_SERVER_URL,
  passportAppUrl: ZUPASS_URL,
  ballotType: BallotType.DEVCONNECT_ORGANIZER,
};

export const BALLOT_CONFIGS = {
  [BallotType.ADVISORYVOTE]: ADVISORY_VOTE_BALLOT_CONFIG,
  [BallotType.ORGANIZERONLY]: ORGANIZER_ONLY_BALLOT_CONFIG,
  [BallotType.PCDPASSUSER]: PCDPASS_BALLOT_CONFIG,
  [BallotType.STRAWPOLL]: STRAWPOLL_BALLOT_CONFIG,
  [BallotType.DEVCONNECT_STRAW]: DEVCONNECT_ATTENDEE_BALLOT_CONFIG,
  [BallotType.DEVCONNECT_ORGANIZER]: DEVCONNECT_ORGANIZER_BALLOT_CONFIG,
};
