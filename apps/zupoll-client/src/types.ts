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
  RECEIVED_PCDSTR,
}

export enum UserType {
  ANON = "ANON",
  NONANON = "NONANON",
}

export type PollDefinition = {
  id: string;
  createdAt: string;
  pollsterType: UserType;
  pollsterNullifier: string;
  pollsterSemaphoreGroupUrl: string | null;
  pollsterName: string | null;
  pollsterUuid: string | null;
  pollsterCommitment: string | null;
  body: string;
  expiry: string;
  options: string[];
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots?: string[];
  votes: number[];
  proof: string;
};

export type CreatePollRequest = {
  pollsterType: UserType;
  pollsterSemaphoreGroupUrl?: string;
  pollsterCommitment?: string;
  pollsterUuid?: string;
  body: string;
  expiry: Date;
  options: string[];
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots?: string[];
  proof: string;
};

export type PollSignal = {
  body: string;
  expiry: Date;
  options: string[];
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots?: string[];
};

export type VoteRequest = {
  pollId: string;
  voterType: UserType;
  voterSemaphoreGroupUrl?: string;
  voterCommitment?: string;
  voterUuid?: string;
  voteIdx: number;
  proof: string;
};

export type VoteSignal = {
  pollId: string;
  voteIdx: number;
};
