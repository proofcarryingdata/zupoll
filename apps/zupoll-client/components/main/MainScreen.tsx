import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { listBallots } from "../../src/api";
import { Ballot, BallotType } from "../../src/prismaTypes";
import { BallotResponse } from "../../src/requestTypes";
import {
  LoginConfigurationName,
  LoginState,
  ZupollError
} from "../../src/types";
import { Center } from "../core";
import { MainScreenHeader } from "../core/Headers";
import { RippleLoader } from "../core/RippleLoader";
import { BallotList } from "./BallotList";
import { ErrorOverlay } from "./ErrorOverlay";

export function MainScreen({
  loginState,
  logout
}: {
  loginState: LoginState;
  logout: () => void;
}) {
  const router = useRouter();

  const [loadingBallots, setLoadingBallots] = useState<boolean>(true);
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [error, setError] = useState<ZupollError>();

  useEffect(() => {
    async function getBallots() {
      const res = await listBallots(loginState.token);

      if (res === undefined) {
        const serverDownError: ZupollError = {
          title: "Retrieving polls failed",
          message: "Server is down. Contact passport@0xparc.org."
        };
        setError(serverDownError);
        return;
      }

      if (res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        const resErr = await res.text();
        console.error("error posting vote to the server: ", resErr);
        const err: ZupollError = {
          title: "Voting failed",
          message: `Server Error: ${resErr}`
        };
        setError(err);
        return;
      }

      const ballotResponse: BallotResponse = await res.json();
      setBallots(ballotResponse.ballots);
      console.log("loaded ballots:", ballotResponse.ballots);
      setLoadingBallots(false);
    }

    getBallots();
  }, [loginState.token, logout]);

  return (
    <Center>
      <MainScreenHeader
        logout={logout}
        createBallot={() => router.push("/create-ballot")}
      />
      <GuarenteeContainer>
        <Guarentee>✅ Login Status: {loginState.config.name}</Guarentee>
        <Guarentee>️‍️🛡️ The server never learns your identity.</Guarentee>
        <Guarentee>🗳️ One vote per participant.</Guarentee>
        <Guarentee>❌ Unlinkable votes across ballots/devices. </Guarentee>
      </GuarenteeContainer>

      {loginState.config.name === LoginConfigurationName.ZUZALU_ORGANIZER && (
        <BallotListContainer>
          <TitleContainer>
            <H1>Organizer-only ballots</H1>
            <p>Ballots visible and voteable only by Zuzalu organizers.</p>
          </TitleContainer>

          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <BallotList ballots={ballots} filter={BallotType.ORGANIZERONLY} />
          )}
        </BallotListContainer>
      )}

      {(loginState.config.name === LoginConfigurationName.ZUZALU_ORGANIZER ||
        loginState.config.name ===
          LoginConfigurationName.ZUZALU_PARTICIPANT) && (
        <BallotListContainer>
          <TitleContainer>
            <H1>Organizer Polls</H1>
            <p>Official ballots from Zuconnect organizers</p>
          </TitleContainer>

          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <BallotList ballots={ballots} filter={BallotType.ADVISORYVOTE} />
          )}
        </BallotListContainer>
      )}
      {(loginState.config.name === LoginConfigurationName.ZUZALU_ORGANIZER ||
        loginState.config.name ===
          LoginConfigurationName.ZUZALU_PARTICIPANT) && (
        <BallotListContainer>
          <TitleContainer>
            <H1>Straw Polls</H1>
            <p>Unofficial ballots from event participants</p>
          </TitleContainer>

          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <BallotList ballots={ballots} filter={BallotType.STRAWPOLL} />
          )}
        </BallotListContainer>
      )}

      {loginState.config.name === LoginConfigurationName.PCDPASS_USER && (
        <BallotListContainer>
          <TitleContainer>
            <H1>PCDPass Polls</H1>
            <p>
              Ballots created by users of PCDPass. These are not visible to
              Zuzalu participants.
            </p>
          </TitleContainer>

          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <BallotList ballots={ballots} filter={BallotType.PCDPASSUSER} />
          )}
        </BallotListContainer>
      )}

      {(loginState.config.name ===
        LoginConfigurationName.DEVCONNECT_PARTICIPANT ||
        loginState.config.name ===
          LoginConfigurationName.DEVCONNECT_ORGANIZER) && (
        <BallotListContainer>
          <TitleContainer>
            <H1>Organizer Polls</H1>
            <p>Ballots created by Devconnect organizers.</p>
          </TitleContainer>

          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <BallotList
              ballots={ballots}
              filter={BallotType.DEVCONNECT_ORGANIZER}
            />
          )}
        </BallotListContainer>
      )}

      {(loginState.config.name ===
        LoginConfigurationName.DEVCONNECT_PARTICIPANT ||
        loginState.config.name ===
          LoginConfigurationName.DEVCONNECT_ORGANIZER) && (
        <BallotListContainer>
          <TitleContainer>
            <H1>Community Polls</H1>
            <p>Ballots created by Devconnect attendees.</p>
          </TitleContainer>

          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <BallotList
              ballots={ballots}
              filter={BallotType.DEVCONNECT_STRAW}
            />
          )}
        </BallotListContainer>
      )}

      {(loginState.config.name === LoginConfigurationName.EDGE_CITY_ORGANIZER ||
        loginState.config.name ===
          LoginConfigurationName.EDGE_CITY_RESIDENT) && (
        <BallotListContainer>
          <TitleContainer>
            <H1>Community Polls</H1>
            <p>Ballots created by Edge City attendees.</p>
          </TitleContainer>

          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <BallotList
              ballots={ballots}
              filter={BallotType.EDGE_CITY_RESIDENT}
            />
          )}
        </BallotListContainer>
      )}

      {(loginState.config.name === LoginConfigurationName.EDGE_CITY_ORGANIZER ||
        loginState.config.name ===
          LoginConfigurationName.EDGE_CITY_RESIDENT) && (
        <>
          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <>
              {ballots.filter(
                (ballot) => ballot.ballotType === BallotType.EDGE_CITY_ORGANIZER
              ).length > 0 && (
                <BallotListContainer>
                  <TitleContainer>
                    <H1>Organizer Feedback</H1>
                    <p>Ballots created by Edge City organizers.</p>
                  </TitleContainer>
                  <BallotList
                    ballots={ballots}
                    filter={BallotType.EDGE_CITY_ORGANIZER}
                  />
                </BallotListContainer>
              )}
            </>
          )}
        </>
      )}

      {(loginState.config.name === LoginConfigurationName.ETH_LATAM_ORGANIZER ||
        loginState.config.name ===
          LoginConfigurationName.ETH_LATAM_ATTENDEE) && (
        <BallotListContainer>
          <TitleContainer>
            <H1>Community Polls</H1>
            <p>Ballots created by ETH LatAm attendees.</p>
          </TitleContainer>

          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <BallotList
              ballots={ballots}
              filter={BallotType.ETH_LATAM_STRAWPOLL}
            />
          )}
        </BallotListContainer>
      )}

      {(loginState.config.name === LoginConfigurationName.ETH_LATAM_ORGANIZER ||
        loginState.config.name ===
          LoginConfigurationName.ETH_LATAM_ATTENDEE) && (
        <>
          {loadingBallots || ballots === undefined ? (
            <RippleLoader />
          ) : (
            <>
              {ballots.filter(
                (ballot) => ballot.ballotType === BallotType.ETH_LATAM_FEEDBACK
              ).length > 0 && (
                <BallotListContainer>
                  <TitleContainer>
                    <H1>Organizer Feedback</H1>
                    <p>Ballots created by ETH LatAm organizers.</p>
                  </TitleContainer>
                  <BallotList
                    ballots={ballots}
                    filter={BallotType.ETH_LATAM_FEEDBACK}
                  />
                </BallotListContainer>
              )}
            </>
          )}
        </>
      )}

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
