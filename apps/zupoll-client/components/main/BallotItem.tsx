import { useRouter } from "next/router";
import styled from "styled-components";
import { Ballot } from "../../src/prismaTypes";

export function BallotItem({ ballot }: { ballot: Ballot }) {
  const isExpired = new Date(ballot.expiry) < new Date();

  const router = useRouter();
  return (
    <BallotListButton
      onClick={() => router.push(`ballot?id=${ballot.ballotURL}`)}
    >
      <div style={{ fontWeight: 600 }}>{ballot.ballotTitle}</div>
      <div style={{ fontStyle: isExpired ? "italic " : "initial" }}>
        {isExpired ? "Expired" : getTimeBeforeExpiry(ballot.expiry)}
      </div>
    </BallotListButton>
  );
}

export function getTimeBeforeExpiry(expiry: Date) {
  const minutes = Math.ceil((new Date(expiry).getTime() - Date.now()) / 60000);
  const hours = Math.ceil(minutes / 60);
  const days = Math.ceil(minutes / (24 * 60));

  if (days > 1) {
    return "Expires in <" + days + " days";
  } else if (hours > 1) {
    return "Expires in <" + hours + " hours";
  } else if (minutes > 1) {
    return "Expires in <" + minutes + " minutes";
  } else {
    return "Expires in <1 minute";
  }
}

export const BallotListButton = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #888;
  opacity: 1;
  margin-bottom: 1rem;
  gap: 0.5rem;

  font-family: OpenSans;
  font-weight: 400;
  background-color: #fff;

  cursor: pointer;
  &:hover {
    background-color: #d8d8d8;
  }
  &:active {
    background-color: #c3c3c3;
  }
`;
