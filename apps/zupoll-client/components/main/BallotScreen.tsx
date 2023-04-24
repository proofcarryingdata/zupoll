import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { listBallotPolls } from "../../src/api";
import { PollResponse, PollWithCounts } from "../../src/requestTypes";
import { ZupollError } from "../../src/types";
import { Center } from "../core";
import { LoggedInHeader } from "../core/Headers";
import { RippleLoaderLight } from "../core/RippleLoader";
import { ErrorOverlay } from "./ErrorOverlay";

export function BallotScreen({ ballotURL }: { ballotURL: string }) {
  const router = useRouter();
  const [error, setError] = useState<ZupollError>();

  /**
   * LOGIN LOGIC
   */
  const [token, setToken] = useState<string>("");
  const [loadingToken, setLoadingToken] = useState<boolean>(true);

  const logout = useCallback(() => {
    delete window.localStorage["access_token"];
    router.push("/");
  }, [router]);

  // Automatically go to login screen if there's no access token
  useEffect(() => {
    if (window.localStorage["access_token"] === undefined) {
      // Go back to login page if no token
      router.push("/");
    }

    setToken(window.localStorage["access_token"]);
    setLoadingToken(false);
  }, [setToken, router]);

  /**
   * POLL & VOTING LOGIC
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

  return (
    <>
      <Head>
        <title>Zupoll</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      <Center>
        <LoggedInHeader onLogout={logout} />
        {loadingToken || loadingPolls ? <RippleLoaderLight /> : <></>}
        {error && (
          <ErrorOverlay error={error} onClose={() => setError(undefined)} />
        )}
      </Center>
    </>
  );
}
