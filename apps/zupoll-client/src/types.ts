export enum PollType {
  REFERENDUM = "REFERENDUM",
}

export enum UserType {
  ANON = "ANON",
  NONANON = "NONANON",
}

export type PollSignal = {
  // nullifier: string;
  pollType: PollType;
  body: string;
  expiry: Date;
  options: string[];
  voterSemaphoreGroupUrls: string[];
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

export type CreatePollRequest = {
  pollsterType: UserType;
  pollsterSemaphoreGroupUrl?: string;
  pollsterCommitment?: string;
  pollsterUuid?: string;
  pollType: PollType;
  body: string;
  expiry: Date;
  options: string[];
  voterSemaphoreGroupUrls: string[];
  proof: string;
};
