import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { listBallotPolls } from "../../src/api";
import { useBallotVoting, votedOn } from "../../src/ballotVoting";
import { useLogin } from "../../src/login";
import { Ballot } from "../../src/prismaTypes";
import { BallotPollResponse, PollWithCounts } from "../../src/requestTypes";
import { ZupollError } from "../../src/types";
import { Center } from "../core";
import { BallotButton } from "../core/Button";
import { ReturnHeader } from "../core/Headers";
import {
  RippleLoaderLight,
  RippleLoaderLightMargin,
} from "../core/RippleLoader";
import { BallotPoll } from "./BallotPoll";
import { ErrorOverlay } from "./ErrorOverlay";

export function BallotScreen({ ballotURL }: { ballotURL: string }) {
  const router = useRouter();
  const [error, setError] = useState<ZupollError>();
  const [serverLoading, setServerLoading] = useState<boolean>(false);
  const { token, group: _group, loadingToken, logout } = useLogin(router);

  /**
   * BALLOT/POLL LOGIC
   */
  const [loadingPolls, setLoadingPolls] = useState<boolean>(false);
  const [polls, setPolls] = useState<Array<PollWithCounts>>([]);
  const [ballot, setBallot] = useState<Ballot>();
  const [ballotId, setBallotId] = useState<string>("");
  const [ballotVoterSemaphoreGroupUrl, setBallotVoterSemaphoreGroupUrl] =
    useState<string>("");
  const [expired, setExpired] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<string>("");

  // Retrieve polls under this ballot, refresh after user votes
  useEffect(() => {
    if (!token) {
      setPolls([]);
      return;
    }

    async function getBallotPolls() {
      setLoadingPolls(true);
      const res = await listBallotPolls(token, ballotURL);
      setLoadingPolls(false);

      if (res === undefined) {
        const serverDownError: ZupollError = {
          title: "Retrieving polls failed",
          message: "Server is down. Contact passport@0xparc.org.",
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
          message: `Server Error: ${resErr}`,
        };
        setError(err);
        return;
      }

      const ballotPollResponse: BallotPollResponse = await res.json();
      console.log(ballotPollResponse);
      setPolls(ballotPollResponse.polls);
      setBallot(ballotPollResponse.ballot);
      setBallotId(ballotPollResponse.ballot.ballotId);
      setBallotVoterSemaphoreGroupUrl(
        ballotPollResponse.ballot.voterSemaphoreGroupUrls[0]
      );
      setExpired(new Date(ballotPollResponse.ballot.expiry) < new Date());
    }

    getBallotPolls();
  }, [token, ballotURL, logout, refresh]);

  /**
   * VOTING LOGIC
   */
  const [canVote, setCanVote] = useState<boolean>(true);
  const [pollToVote, setPollToVote] = useState(
    new Map<string, number | undefined>()
  );

  // check voting status
  useEffect(() => {
    setCanVote(!votedOn(ballotId) && !expired);
  }, [expired, ballotId, refresh]);

  // update votes for polls
  const onVoted = (pollId: string, voteIdx: number) => {
    const currentVote = pollToVote.get(pollId);
    if (currentVote !== undefined) {
      if (currentVote === voteIdx) {
        setPollToVote(new Map(pollToVote.set(pollId, undefined)));
        return;
      }
    }
    setPollToVote(new Map(pollToVote.set(pollId, voteIdx)));
  };

  const createBallotVotePCD = useBallotVoting({
    ballotId,
    ballotURL,
    ballotVoterSemaphoreGroupUrl,
    polls,
    pollToVote,
    onError: (err: ZupollError) => {
      setError(err);
      setServerLoading(false);
    },
    setServerLoading,
    refresh: (id: string) => {
      setRefresh(id), setPollToVote(new Map());
    },
  });

  return (
    <>
      <Head>
        <title>{ballot === undefined ? "Zupoll" : ballot.ballotTitle}</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      <Center>
        <ReturnHeader />
        {loadingToken ||
        loadingPolls ||
        ballot === undefined ||
        polls === undefined ? (
          <RippleLoaderLight />
        ) : (
          <>
            <Container>
              <h2>{ballot.ballotTitle}</h2>
              <p>{ballot.ballotDescription}</p>
              {ballot.expiry &&
                (new Date(ballot.expiry) < new Date() ? (
                  <p style={{ color: "red" }}>This ballot has expired.</p>
                ) : (
                  <p>
                    {"Expires at " + new Date(ballot.expiry).toLocaleString()}.
                  </p>
                ))}
            </Container>
            {polls.map((poll) => (
              <BallotPoll
                key={poll.id}
                canVote={canVote}
                poll={poll}
                voteIdx={pollToVote.get(poll.id)}
                onVoted={onVoted}
              />
            ))}
          </>
        )}

        {canVote &&
          (serverLoading || ballot === undefined ? (
            <RippleLoaderLightMargin />
          ) : (
            <BallotButton onClick={createBallotVotePCD}>
              <h3>Submit ballot</h3>
            </BallotButton>
          ))}

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
    </>
  );
}

export const Container = styled.div`
  box-sizing: border-box;
  font-family: OpenSans;
  border: 1px solid #bbb;
  background-color: #eee;
  width: 100%;
  border-radius: 1rem;
  padding: 1rem 2rem 2rem 2rem;
  margin-bottom: 1rem;
`;
