import { Ballot, BallotType, Poll, Vote } from "./prismaTypes";

export type LoginRequest = {
  semaphoreGroupUrl: string;
  proof: string;
};

export type CreateBallotRequest = {
  ballot: Ballot;
  polls: Poll[];
  proof: string;
};

export type BallotSignal = {
  pollSignals: PollSignal[];
  ballotTitle: string;
  ballotDescription: string;
  ballotType: BallotType;
  expiry: Date;
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots: string[];
};

export type PollSignal = {
  body: string;
  options: string[];
};

export type BallotPollRequest = {
  ballotURL: number;
};

export type BallotPollResponse = {
  ballot: Ballot;
  polls: PollWithCounts[];
};

export type BallotResponse = {
  ballots: Ballot[];
}

export type PollWithCounts = Poll & {
  votes: any[];
};

export type MultiVoteRequest = {
  votes: Vote[];
  ballotURL: string;
  voterSemaphoreGroupUrl: string;
  proof: string;
};

export type MultiVoteSignal = {
  voteSignals: VoteSignal[];
};

export type VoteSignal = {
  pollId: string;
  voteIdx: number;
};
