// Input: list of ballots and filters

import { Ballot, BallotType } from "../../src/prismaTypes";
import { BallotItem } from "./BallotItem";

export function BallotList({
  ballots,
  filter,
}: {
  ballots: Ballot[];
  filter: BallotType;
}) {
  return ballots
    .filter((ballot) => ballot.ballotType === filter)
    .map((ballot) => {
      return { ...ballot, isExpired: new Date(ballot.expiry) < new Date() };
    })
    .sort((a, b) => {
      // Check if either a or b is expired
      if (a.isExpired !== b.isExpired) {
        return +a.isExpired - +b.isExpired;
      }

      // If both have the same expired status, sort by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map((ballot) => <BallotItem key={ballot.ballotURL} ballot={ballot} />);
}
