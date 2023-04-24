import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Center } from "../components/core";
import { LoggedInHeader } from "../components/core/Headers";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { CreateBallot } from "../components/main/CreateBallot";
import { ErrorOverlay } from "../components/main/ErrorOverlay";
import { useLogin } from "../src/login";
import { BallotType } from "../src/prismaTypes";
import { ZupollError } from "../src/types";
import { SEMAPHORE_ADMIN_GROUP_URL, SEMAPHORE_GROUP_URL } from "../src/util";

export default function Page() {
  const router = useRouter();
  const [error, setError] = useState<ZupollError>();
  const { token, group, loadingToken, logout } = useLogin(router);
  const [ballotType, setBallotType] = useState<BallotType | undefined>(
    undefined
  );
  
  // Set up the right ballot type based on the JWT from login
  useEffect(() => {
    if (group !== undefined) {
      if (group === SEMAPHORE_ADMIN_GROUP_URL) {
        setBallotType(BallotType.ADVISORYVOTE);
        return;
      } else if (group === SEMAPHORE_GROUP_URL) {
        setBallotType(BallotType.STRAWPOLL);
        return;
      } else {
        logout();
        return;
      }
    }
  }, [group, logout]);

  return (
    <>
      <Head>
        <title>Create Ballot</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      {loadingToken ? (
        <RippleLoaderLightMargin />
      ) : (
        <Center>
          <LoggedInHeader onLogout={logout} />

          <CreateBallot
            token={token}
            ballotType={ballotType}
            onError={setError}
          />

          {error && (
            <ErrorOverlay error={error} onClose={() => setError(undefined)} />
          )}
        </Center>
      )}
    </>
  );
}
