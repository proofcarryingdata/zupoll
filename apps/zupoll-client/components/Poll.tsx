import { useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { PollType, UserType } from "../src/types";
import { ZupollError } from "./shared/ErrorOverlay";
import { usePollVote, votedOn } from "./VoteForm";

export function Poll({
  poll,
  onError,
  onVoted,
}: {
  poll: Poll;
  onError: (err: ZupollError) => void;
  onVoted: (id: string) => void;
}) {
  const voter = usePollVote(poll, onError, onVoted);
  const totalVotes = poll.votes.length;
  const statistics = new Array(poll.options.length).fill(0);
  const expired = new Date(poll.expiry) < new Date();

  const canVote = useMemo(() => {
    return !votedOn(poll.id) && !expired;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired, poll.id, poll]);

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
            <PollOption
              canVote={canVote}
              key={idx}
              onClick={() => {
                if (voter) {
                  if (
                    confirm(`are you sure you want to vote for option ${idx}?`)
                  ) {
                    voter(idx);
                  }
                }
              }}
            >
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

      <TotalVotesContainer>
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        {" · "}
        {expired
          ? "Expired"
          : "Expires " + new Date(poll.expiry).toLocaleString()}
        {canVote ? " · Can Vote" : ""}
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
  box-sizing: border-box;
  border: 1px solid #bbb;
  border-bottom: none;
  background-color: #fcfcfc;
  width: 100%;
  padding: 16px;
  position: relative;
  font-family: system-ui, sans-serif;
  transition: 200ms;

  &:first-child {
    border-radius: 4px 4px 0px 0px;
  }

  &:hover {
    background-color: #f8f8f8;
  }

  &:last-child {
    border-bottom: 1px solid #bbb;
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

const PollOption = styled.span<{ canVote: boolean }>`
  ${({ canVote }) => css`
    overflow: hidden;
    position: relative;
    padding: 6px 8px;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    gap: 8px;
    border: 1px solid transparent;

    ${canVote &&
    css`
      &:hover {
        cursor: pointer;
        border: 1px solid #888;
        background-color: #ddd;
      }

      &:hover:active {
        background-color: #ccc;
      }
    `}
  `}
`;

const PollProgressBar = styled.span<{ percent: number; isMax: boolean }>`
  ${({ percent, isMax }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: ${100 * percent}%;
    height: 100%;
    background-color: ${isMax ? "#a1f1e4" : "grey"};
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
  font-size: 0.9em;
`;
