import { useMemo } from "react";
import styled, { css } from "styled-components";
import { PollType, UserType } from "../../src/types";
import { ZupollError } from "./ErrorOverlay";
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
  const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
  const expired = new Date(poll.expiry) < new Date();

  const canVote = useMemo(() => {
    return !votedOn(poll.id) && !expired;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired, poll.id, poll]);

  const maxVote = Math.max(...poll.votes);

  const getVoteDisplay = (a: number, b: number) => {
    if (b === 0) {
      return "0%";
    }

    const percentVal = ((a / b) * 100).toFixed(1);
    return `${percentVal}%`;
  };

  return (
    <PollWrapper>
      <PollHeader>{poll.body}</PollHeader>

      <PollOptions>
        {poll.options.map((opt, idx) => (
          <PollOption
            canVote={canVote}
            key={idx}
            onClick={() => {
              if (voter && canVote) {
                if (
                  confirm(`Are you sure you want to vote for option ${opt}?`)
                ) {
                  voter(idx);
                }
              }
            }}
          >
            <PollProgressBar
              percent={totalVotes === 0 ? 0 : poll.votes[idx] / totalVotes}
              isMax={maxVote === poll.votes[idx]}
            />
            <PollResult>
              {getVoteDisplay(poll.votes[idx], totalVotes)}
            </PollResult>
            <OptionString>{opt}</OptionString>
          </PollOption>
        ))}
      </PollOptions>

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
  votes: number[];
  proof: string;
};

const PollWrapper = styled.div`
  box-sizing: border-box;
  border: 1px solid #bbb;
  border-bottom: none;
  background-color: #fcfcfc;
  width: 100%;
  padding: 1rem;
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
  margin-bottom: 0.75rem;
  font-weight: 600;
  /* font-size: 1.1em; */
`;

const PollOptions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  list-style-type: none;
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
`;

const PollOption = styled.span<{ canVote: boolean }>`
  ${({ canVote }) => css`
    overflow: hidden;
    position: relative;
    padding: 0.5rem 0.5rem;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 0.5rem;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    gap: 0.5rem;
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
    background-color: ${isMax ? "#90ccf1" : "#cce5f3"};
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
  margin-top: 0.75rem;
  color: #666;
  font-size: 0.9em;
`;
