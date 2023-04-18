import { useState } from "react";
import styled from "styled-components";
import { PollType, UserType } from "../src/types";
import { ZupollError } from "./shared/ErrorOverlay";
import { VoteForm } from "./VoteForm";

export function Poll({
  poll,
  onError,
  onVoted,
}: {
  poll: Poll;
  onError: (err: ZupollError) => void;
  onVoted: (id: string) => void;
}) {
  const totalVotes = poll.votes.length;
  const statistics = new Array(poll.options.length).fill(0);
  for (const vote of poll.votes) {
    statistics[vote.voteIdx] += 1;
  }

  const getVoteDisplay = (a: number, b: number) => {
    const percentVal = ((a / b) * 100).toFixed(2);
    return `${a}/${b} - ${percentVal}%`;
  };

  const expired = new Date(poll.expiry) < new Date();

  // Add state to track whether to show poll results or not
  const [showResults, setShowResults] = useState(true);

  return (
    <PollWrapper>
      <PollHeader>
        {poll.body}{" "}
        <ArrowWrapper onClick={() => setShowResults(!showResults)}>
          {showResults ? "⏫" : "⏬"}
        </ArrowWrapper>
      </PollHeader>
      {/* Show poll results if showResults is true */}
      {showResults && (
        <PollOptions>
          {poll.options.map((opt, idx) => (
            <PollOption key={idx}>
              <b>{opt}</b>
              <PollResult>
                {getVoteDisplay(statistics[idx], totalVotes)}
              </PollResult>
            </PollOption>
          ))}
        </PollOptions>
      )}
      {!expired && <VoteForm poll={poll} onError={onError} onVoted={onVoted} />}
    </PollWrapper>
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

const PollWrapper = styled.div`
  background-color: white;
  border-radius: 10px;
  width: calc(100% - 40px);
  margin: 10px;
  padding: 20px;
  position: relative;
  font-family: system-ui, sans-serif;
`;

const PollHeader = styled.h2`
  padding: 0px;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PollOptions = styled.ul`
  list-style-type: none;
  padding: 0px;
  margin: 0;
`;

const PollOption = styled.li`
  margin: 20px 0 20px 0;
`;

const PollResult = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ArrowWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;
