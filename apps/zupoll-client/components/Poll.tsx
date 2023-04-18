import { useState } from "react";
import styled, { css } from "styled-components";
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
  const maxVote = Math.max(...statistics);

  const getVoteDisplay = (a: number, b: number) => {
    if (b === 0) {
      return "0%";
    }

    const percentVal = ((a / b) * 100).toFixed(1);
    return `${percentVal}%`;
  };

  const expired = new Date(poll.expiry) < new Date();

  // Add state to track whether to show poll results or not
  const [showResults, setShowResults] = useState(true);

  return (
    <PollWrapper>
      <PollHeader>
        {poll.body}
        {/* <ArrowWrapper onClick={() => setShowResults(!showResults)}>
          {showResults ? "⏫" : "⏬"}
        </ArrowWrapper> */}
      </PollHeader>
      {/* Show poll results if showResults is true */}
      {showResults && (
        <PollOptions>
          {poll.options.map((opt, idx) => (
            <PollOption key={idx}>
              <PollProgressBar
                percent={totalVotes === 0 ? 0 : statistics[idx] / totalVotes}
                isMax={maxVote === statistics[idx]}
              />
              <PollResult>
                {getVoteDisplay(statistics[idx], totalVotes)}
              </PollResult>
              <OptionString>{opt}</OptionString>
            </PollOption>
          ))}
        </PollOptions>
      )}
      {!expired && <VoteForm poll={poll} onError={onError} onVoted={onVoted} />}

      <TotalVotesContainer>
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
      </TotalVotesContainer>
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
  border: 1px solid grey;
  border-bottom: none;
  background-color: white;
  width: 100%;
  padding: 16px;
  position: relative;
  font-family: system-ui, sans-serif;

  &:first-child {
    border-radius: 4px 4px 0px 0px;
  }

  &:last-child {
    border-bottom: 1px solid grey;
    border-radius: 0px 0px 4px 4px;
  }
`;

const PollHeader = styled.div`
  padding: 0px;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  /* font-size: 1.1em; */
`;

const PollOptions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  list-style-type: none;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
`;

const PollOption = styled.span`
  overflow: hidden;
  position: relative;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  gap: 8px;
`;

const PollProgressBar = styled.span<{ percent: number; isMax: boolean }>`
  ${({ percent, isMax }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: ${100 * percent}%;
    height: 100%;
    background-color: ${isMax ? "#a1f1a2" : "grey"};
  `}
`;

const PollResult = styled.span`
  z-index: 500;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  font-weight: bold;
  width: 5em;
  font-size: 0.9em;
`;

const OptionString = styled.span`
  z-index: 500;
`;

const TotalVotesContainer = styled.div`
  margin-top: 12px;
  color: #666;
`;
