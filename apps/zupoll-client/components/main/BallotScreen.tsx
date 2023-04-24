import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Center } from "../core";
import { LoggedInHeader } from "../core/Headers";
import Head from "next/head";

export function BallotScreen({ 
  ballotURL 
}: { 
  ballotURL: string 
}) {
  const router = useRouter();

  const [token, setToken] = useState<string | undefined>("");
  const [loadingToken, setLoadingToken] = useState<boolean>(true);

  // Automatically go to login screen if there's no access token
  useEffect(() => {
    if (window.localStorage["access_token"] === undefined) {
      // Go back to login page if no token
      router.push("/");
    }

    setToken(window.localStorage["access_token"]);
    setLoadingToken(false);
  }, [setToken, router]);

  const logout = useCallback(() => {
    delete window.localStorage["access_token"];
    router.push("/");
  }, [router]);

  return (
    <>
      <Head>
        <title>Zupoll</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      <Center>
        <LoggedInHeader onLogout={logout} />
      </Center>
    </>
  );
}
