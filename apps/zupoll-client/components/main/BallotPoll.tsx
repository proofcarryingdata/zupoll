import { useMemo } from "react";
import styled, { css } from "styled-components";
import { votedOn } from "../../src/ballotVoting";
import { PollWithCounts } from "../../src/requestTypes";
import { ZupollError } from "../../src/types";

export function BallotPoll({
  ballotURL,
  poll,
  voteIdx,
  onVoted,
}: {
  ballotURL: string;
  poll: PollWithCounts;
  voteIdx: number | undefined;
  onVoted: (pollId: string, voteIdx: number) => void;
}) {
  const expired = new Date(poll.expiry) < new Date();
  const canVote = useMemo(() => {
    return !votedOn(ballotURL) && !expired;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
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
      <PollHeader>
        {poll.body}
      </PollHeader>

      <PollOptions>
        {poll.options.map((opt, idx) => (
          <PollOption
            key={idx}
            canVote={canVote}
            selected={voteIdx === idx}
            onClick={() => {
              if (canVote) {
                onVoted(poll.id, idx)
              }
            }}
          >
            <PollProgressBar
              percent={
                totalVotes === 0 || canVote ? 0 : poll.votes[idx] / totalVotes
              }
              isMax={maxVote === poll.votes[idx]}
            />
            {canVote ? (
              <PollPreResult />
            ) : (
              <PollResult>
                {getVoteDisplay(poll.votes[idx], totalVotes)}
              </PollResult>
            )}
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
  margin-bottom: 1rem;
  font-weight: 600;
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

const PollOption = styled.span<{ canVote: boolean, selected: boolean }>`
  ${({ canVote, selected }) => css`
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

    ${selected && css`
        border: 1px solid #888;
        background-color: #aaa;
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

const PollPreResult = styled.span`
  z-index: 500;
  width: 0.5rem;
`;

const PollResult = styled.span`
  z-index: 500;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  font-weight: bold;
  width: 4rem;
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
