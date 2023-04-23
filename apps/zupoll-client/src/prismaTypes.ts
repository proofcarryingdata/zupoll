/**
 * Model Ballot
 * 
 */
 export type Ballot = {
  ballotId: string
  ballotURL: string
  ballotTitle: string
  ballotDescription: string
  createdAt: Date
  expiry: Date
  proof: string
  pollsterType: UserType
  pollsterNullifier: string
  pollsterSemaphoreGroupUrl: string | null
  pollsterName: string | null
  pollsterUuid: string | null
  pollsterCommitment: string | null
  voterSemaphoreGroupUrls: string[]
  voterSemaphoreGroupRoots: string[]
  ballotType: BallotType
}

/**
 * Model Poll
 * 
 */
export type Poll = {
  id: string
  createdAt: Date
  body: string
  options: string[]
  expiry: Date
  ballotURL: string | null
}

/**
 * Model Vote
 * 
 */
export type Vote = {
  id: string
  pollId: string
  voterType: UserType
  voterNullifier: string
  voterSemaphoreGroupUrl: string | null
  voterName: string | null
  voterUuid: string | null
  voterCommitment: string | null
  voteIdx: number
  proof: string
}


/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const BallotType = {
  ADVISORYVOTE: 'ADVISORYVOTE',
  STRAWPOLL: 'STRAWPOLL'
};

export type BallotType = (typeof BallotType)[keyof typeof BallotType]


export const UserType = {
  ANON: 'ANON',
  NONANON: 'NONANON'
};

export type UserType = (typeof UserType)[keyof typeof UserType]