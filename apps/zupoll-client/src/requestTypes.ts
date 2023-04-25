import { Ballot, BallotType, Poll } from "./prismaTypes"

export type LoginRequest = {
  semaphoreGroupUrl: string;
  proof: string;
}

export type CreateBallotRequest = {
  ballot: Ballot;
  polls: Poll[];
  proof: string;
}

export type BallotSignal = {
  pollSignals: PollSignal[];
  ballotTitle: string;
  ballotDescription: string;
  ballotType: BallotType;
  expiry: Date;
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots: string[];
}

export type PollSignal = {
  body: string;
  options: string[];
};

export type BallotPollRequest = {
  ballotURL: number;
}

export type PollResponse = {
  polls: PollWithCounts[];
}

export type PollWithCounts = Poll & {
  votes: any[];
}