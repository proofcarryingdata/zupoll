import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { listBallots } from "../../src/api";
import { Ballot, BallotType } from "../../src/prismaTypes";
import { BallotResponse } from "../../src/requestTypes";
import { ZupollError } from "../../src/types";
import { Center } from "../core";
import { BallotButton } from "../core/Button";
import { LoggedInHeader } from "../core/Headers";
import { RippleLoader } from "../core/RippleLoader";
import { ErrorOverlay } from "./ErrorOverlay";

export function MainScreen({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const router = useRouter();

  const [loadingBallots, setLoadingBallots] = useState<boolean>(true);
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [error, setError] = useState<ZupollError>();

  function getTimeBeforeExpiry(expiry: Date) {
    const hours = Math.floor(
      (new Date(expiry).getTime() - Date.now()) / 3600000
    );
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return "Expires in <" + days + " days";
    } else {
      return "Expires in <" + hours + " hours";
    }
  }

  useEffect(() => {
    if (!token) {
      setBallots([]);
    }

    async function getBallots() {
      const res = await listBallots(token);

      if (res === undefined) {
        const serverDownError: ZupollError = {
          title: "Retrieving polls failed",
          message: "Server is down. Contact passport@0xparc.org.",
        };
        setError(serverDownError);
        return;
      }

      if (res.status === 403) {
        onLogout();
        return;
      }

      if (!res.ok) {
        const resErr = await res.text();
        console.error("error posting vote to the server: ", resErr);
        const err: ZupollError = {
          title: "Voting failed",
          message: `Server Error: ${resErr}`,
        };
        setError(err);
        return;
      }

      const ballotResponse: BallotResponse = await res.json();
      setBallots(ballotResponse.ballots);
      console.log(ballotResponse.ballots);
      setLoadingBallots(false);
    }

    getBallots();
  }, [token, onLogout]);

  return (
    <Center>
      <LoggedInHeader onLogout={onLogout} />

      <BallotButton onClick={() => router.push("/create-ballot")}>
        <h3>Create a new ballot</h3>
      </BallotButton>

      <BallotListContainer>
        <TitleContainer>
          <H1>Advisory Votes</H1>
          <p>Official advisory ballots from the Zuzalu organizers</p>
        </TitleContainer>

        {loadingBallots || ballots === undefined ? (
          <RippleLoader />
        ) : (
          ballots
            .filter((ballot) => ballot.ballotType === BallotType.ADVISORYVOTE)
            .map((ballot) => (
              <BallotListButton
                onClick={() => router.push(`ballot/${ballot.ballotURL}`)}
              >
                <div style={{ fontWeight: 600 }}>{ballot.ballotTitle}</div>
                <div style={{ fontStyle: "italic" }}>
                  {new Date(ballot.expiry) < new Date()
                    ? "Expired"
                    : getTimeBeforeExpiry(ballot.expiry)}
                </div>
              </BallotListButton>
            ))
        )}
      </BallotListContainer>
      <br />
      <BallotListContainer>
        <TitleContainer>
          <H1>Straw Polls</H1>
          <p>Unofficial ballots from all Zuzalu residents</p>
        </TitleContainer>

        {loadingBallots || ballots === undefined ? (
          <RippleLoader />
        ) : (
          ballots
            .filter((ballot) => ballot.ballotType === BallotType.STRAWPOLL)
            .map((ballot) => (
              <BallotListButton
                onClick={() => router.push(`ballot/${ballot.ballotURL}`)}
              >
                <div style={{ fontWeight: 600 }}>{ballot.ballotTitle}</div>
                <div style={{ fontStyle: "italic" }}>
                  {new Date(ballot.expiry) < new Date()
                    ? "Expired"
                    : getTimeBeforeExpiry(ballot.expiry)}
                </div>
              </BallotListButton>
            ))
        )}
      </BallotListContainer>

      {error && (
        <ErrorOverlay
          error={error}
          onClose={() => {
            setError(undefined);
            router.push("/");
          }}
        />
      )}
    </Center>
  );
}

const H1 = styled.h1`
  color: black;
  margin-bottom: -0.5rem;
  font-size: 1.4rem;
  font-family: OpenSans;
  font-weight: 700;
  font-style: normal;
`;

const BallotListContainer = styled.div`
  display: flex;
  background: #eee;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  margin-top: 1rem;
  border-radius: 1rem;
  padding: 1rem 2rem 1rem 2rem;
  border: 1px solid #eee;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
`;

const BallotListButton = styled.div<{ deemph?: boolean }>`
  display: flex;
  justify-content: space-between;

  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #888;
  opacity: 1;
  margin-bottom: 1rem;

  font-family: OpenSans;
  font-weight: 400;
  background-color: ${({ deemph }) => (deemph ? "#eee" : "#fff")};

  cursor: pointer;
  &:hover {
    background-color: ${({ deemph }) => (deemph ? "#e8e8e8" : "#f8f8f8")};
  }
  &:active {
    background-color: ${({ deemph }) => (deemph ? "#e3e3e3" : "#f3f3f3")};
  }
`;
