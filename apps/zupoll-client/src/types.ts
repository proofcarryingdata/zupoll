import { BallotType } from "./prismaTypes";

export type ZupollError = {
  /** Big title, should be under 40 chars */
  title: string;
  /** Useful explanation, avoid "Something went wrong." */
  message: string | React.ReactNode;
  /** Optional stacktrace. */
  stack?: string;
};

export enum PCDState {
  DEFAULT,
  AWAITING_PCDSTR,
  RECEIVED_PCDSTR
}

export enum LoginConfigurationName {
  ZUZALU_PARTICIPANT = "ZUZALU_PARTICIPANT",
  ZUZALU_ORGANIZER = "ZUZALU_ORGANIZER",
  PCDPASS_USER = "PCDPASS_USER",
  DEVCONNECT_PARTICIPANT = "DEVCONNECT_PARTICIPANT",
  DEVCONNECT_ORGANIZER = "DEVCONNECT_ORGANIZER",
  EDGE_CITY_RESIDENT = "EDGE_CITY_RESIDENT",
  EDGE_CITY_ORGANIZER = "EDGE_CITY_ORGANIZER"
}

export interface BallotConfig {
  voterGroupId: string;
  voterGroupUrl: string;
  creatorGroupId: string;
  creatorGroupUrl: string;
  passportServerUrl: string;
  passportAppUrl: string;
  ballotType: BallotType;
  latestGroupHashUrl?: string;
  makeHistoricalGroupUrl?: (hash: string) => string;
}

export interface LoginConfig {
  groupId: string;
  groupUrl: string;
  passportServerUrl: string;
  passportAppUrl: string;
  name: LoginConfigurationName;
  prompt: string;
}

export interface LoginState {
  token: string;
  config: LoginConfig;
}
