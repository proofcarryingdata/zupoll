import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { listBallots } from "../../src/api";
import { Ballot, BallotType } from "../../src/prismaTypes";
import { BallotResponse } from "../../src/requestTypes";
import { ZupollError } from "../../src/types";
import { Center } from "../core";
import { BallotButton, Button } from "../core/Button";
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
        </TitleContainer>
        {loadingBallots || ballots === undefined ? (
          <RippleLoader />
        ) : (
          ballots
            .filter((ballot) => ballot.ballotType === BallotType.ADVISORYVOTE)
            .map((ballot) => (
              <Button onClick={() => router.push(`ballot/${ballot.ballotURL}`)}>
                {ballot.ballotTitle}
              </Button>
            ))
        )}
      </BallotListContainer>
      <br />
      <BallotListContainer>
        <TitleContainer>
          <H1>Straw Polls</H1>
        </TitleContainer>
        {loadingBallots || ballots === undefined ? (
          <RippleLoader />
        ) : (
          ballots
            .filter((ballot) => ballot.ballotType === BallotType.STRAWPOLL)
            .map((ballot) => (
              <Button onClick={() => router.push(`ballot/${ballot.ballotURL}`)}>
                {ballot.ballotTitle}
              </Button>
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
  margin: 0;
  font-size: 1.4rem;
  font-family: OpenSans;
  font-weight: 700;
  font-style: normal;
  /* ::first-letter {
    font-size: 1.6rem;
  } */
`;

const BallotListContainer = styled.div`
  display: flex;
  background: #eee;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  margin-top: 1rem;
  border-radius: 1rem;
  padding: 1.5rem 2rem 2rem 2rem;
  border: 1px solid #eee;
  gap: 1rem;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;
