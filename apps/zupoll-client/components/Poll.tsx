import { PollType, UserType } from "../src/types";
import { ConfessionsError } from "./shared/ErrorOverlay";
import { VoteForm } from "./VoteForm";

export function Poll({
  poll,
  onError,
  onVoted,
}: {
  poll: Poll;
  onError: (err: ConfessionsError) => void;
  onVoted: (id: string) => void;
}) {
  const totalVotes = poll.votes.length;
  const statistics = new Array(poll.options.length).fill(0);
  for (const vote of poll.votes) {
    statistics[vote.voteIdx] += 1;
  }

  const getVoteDisplay = (a, b) => {
    const percentVal = (a/b * 100).toFixed(2);
    return `${a}/${b} - ${percentVal}%`
  };

  return (
    <>
      <h3>{poll.body}</h3>
      <ul>
        {poll.options.map((opt, idx) => (
          <li key={idx}>{opt} - {getVoteDisplay(statistics[idx], totalVotes)} </li>
        ))}
      </ul>
      Expires: {poll.expiry}
      <br />
      <br />
      <VoteForm poll={poll} onError={onError} onVoted={onVoted} />
    </>
  );
}

export type Poll = {
  id: string;
  createdAt: string;
  pollsterType: UserType;
  pollsterNullifier: string;
  pollsterSemaphoreGroupUrl: string | null;
  pollsterName: string | null;
  pollsterUuid: string | null;
  pollsterCommitment: string | null;
  pollType: PollType;
  body: string;
  expiry: string;
  options: string[];
  voterSemaphoreGroupUrls: string[];
  votes: Vote[];
  proof: string;
};

export type Vote = {
  id: string;
  pollId: string;
  voterType: UserType;
  voterNullifier: string;
  voterSemaphoreGroupUrl: string | null;
  voterName: string | null;
  voterUuid: string | null;
  voterCommitment: string | null;
  voteIdx: number;
  proof: string;
};
