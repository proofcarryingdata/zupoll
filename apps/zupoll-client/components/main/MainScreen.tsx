import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { listBallots } from "../../src/api";
import { Ballot, BallotType } from "../../src/prismaTypes";
import { BallotResponse } from "../../src/requestTypes";
import { ZupollError } from "../../src/types";
import { Center } from "../core";
import { MainScreenHeader } from "../core/Headers";
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
    const minutes = Math.ceil(
      (new Date(expiry).getTime() - Date.now()) / 60000
    );
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
      <MainScreenHeader
        onLogout={onLogout}
        createBallot={() => router.push("/create-ballot")}
      />
      <GuarenteeContainer>
        <Guarentee>🕵️‍♂️🛡️ The server never learns your identity.</Guarentee>
        <Guarentee>🗳️👤 One vote per Zuzalu participant.</Guarentee>
        <Guarentee>🚫🔗 Unlinkable votes across ballots/devices. </Guarentee>
      </GuarenteeContainer>

      <BallotListContainer>
        <TitleContainer>
          <H1>Organizer-only ballots</H1>
          <p>Ballots visible and voteable only by Zuzalu organizers.</p>
        </TitleContainer>

        {loadingBallots || ballots === undefined ? (
          <RippleLoader />
        ) : (
          ballots
            .filter((ballot) => ballot.ballotType === BallotType.ORGANIZERONLY)
            .map((ballot) => (
              <BallotListButton
                key={ballot.ballotId}
                onClick={() => router.push(`ballot?id=${ballot.ballotURL}`)}
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
                key={ballot.ballotId}
                onClick={() => router.push(`ballot?id=${ballot.ballotURL}`)}
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
                key={ballot.ballotId}
                onClick={() => router.push(`ballot?id=${ballot.ballotURL}`)}
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
      <BallotListContainer>
        <TitleContainer>
          <H1>PCDPass Polls</H1>
          <p>
            Ballots created by users of PCDPass. These are not visible to Zuzalu
            participants.
          </p>
        </TitleContainer>

        {loadingBallots || ballots === undefined ? (
          <RippleLoader />
        ) : (
          ballots
            .filter((ballot) => ballot.ballotType === BallotType.PCDPASSUSER)
            .map((ballot) => (
              <BallotListButton
                key={ballot.ballotId}
                onClick={() => router.push(`ballot?id=${ballot.ballotURL}`)}
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

const GuarenteeContainer = styled.div`
  background: #eee;
  width: 100%;
  margin-bottom: 2rem;
  border-radius: 1rem;
  padding: 2rem 2rem 1.5rem 2rem;
  border: 1px solid #eee;
`;

const Guarentee = styled.div`
  margin-bottom: 0.5rem;
`;

const BallotListContainer = styled.div`
  display: flex;
  background: #eee;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 2rem;
  border-radius: 1rem;
  padding: 1rem 2rem 1rem 2rem;
  border: 1px solid #eee;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
`;

const BallotListButton = styled.div`
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
