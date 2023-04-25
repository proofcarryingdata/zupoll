import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { listBallotPolls } from "../../src/api";
import { useLogin } from "../../src/login";
import { PollResponse, PollWithCounts } from "../../src/requestTypes";
import { ZupollError } from "../../src/types";
import { Center } from "../core";
import { LoggedInHeader } from "../core/Headers";
import { RippleLoaderLight } from "../core/RippleLoader";
import { BallotPoll } from "./BallotPoll";
import { ErrorOverlay } from "./ErrorOverlay";

export function BallotScreen({ ballotURL }: { ballotURL: string }) {
  const router = useRouter();
  const [error, setError] = useState<ZupollError>();
  const {token, group: _group, loadingToken, logout} = useLogin(router);

  /**
   * POLL LOGIC
   */
  const [loadingPolls, setLoadingPolls] = useState<boolean>(false);
  const [polls, setPolls] = useState<Array<PollWithCounts>>([]);

  // Retrieve polls under this ballot
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

      const pollResponse: PollResponse = await res.json();
      setPolls(pollResponse.polls);
    }

    getBallotPolls();
  }, [token, ballotURL, logout]);

  /**
   * VOTING LOGIC
   */
  const [pollToVote, setPollToVote] = useState(
    new Map<string, number | undefined>()
  );

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

  return (
    <>
      <Head>
        <title>Zupoll</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      <Center>
        <LoggedInHeader onLogout={logout} />
        {loadingToken || loadingPolls ? (
          <RippleLoaderLight />
        ) : (
          <>
            {polls.map((poll) => (
              <BallotPoll
                key={poll.id}
                ballotURL={ballotURL}
                poll={poll}
                voteIdx={pollToVote.get(poll.id)}
                onVoted={onVoted}
              />
            ))}
          </>
        )}
        {error && (
          <ErrorOverlay error={error} onClose={() => setError(undefined)} />
        )}
      </Center>
    </>
  );
}
