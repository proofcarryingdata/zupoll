import { Poll } from "./prismaTypes"

export type LoginRequest = {
  semaphoreGroupUrl: string;
  proof: string;
}

export type BallotPollRequest = {
  ballotURL: string;
}

export type PollResponse = {
  polls: PollWithCounts[];
}

export type PollWithCounts = Poll & {
  votes: any[];
}