import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Center } from "../components/core";
import { CancelPollHeader } from "../components/core/Headers";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { CreateBallot } from "../components/main/CreateBallot";
import { ErrorOverlay } from "../components/main/ErrorOverlay";
import {
  PCDPASS_USERS_GROUP_URL,
  ZUZALU_ADMINS_GROUP_URL,
  ZUZALU_PARTICIPANTS_GROUP_URL,
} from "../src/env";
import { ZupollError } from "../src/types";
import { useSavedLoginState } from "../src/useLoginState";

export default function CreateBallotPage() {
  const router = useRouter();
  const [error, setError] = useState<ZupollError>();
  const { loginState } = useSavedLoginState(router);

  // Log them out if they're not in a valid group
  useEffect(() => {
    if (loginState?.config?.groupUrl !== undefined) {
      if (
        loginState.config.groupUrl !== ZUZALU_ADMINS_GROUP_URL &&
        loginState.config.groupUrl !== ZUZALU_PARTICIPANTS_GROUP_URL &&
        loginState.config.groupUrl !== PCDPASS_USERS_GROUP_URL
      ) {
        router.push("/");
      }
    }
  }, [loginState, router]);

  return (
    <>
      <Head>
        <title>Create Ballot</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      {!loginState ? (
        <RippleLoaderLightMargin />
      ) : (
        <Center>
          <CancelPollHeader />
          <CreateBallot loginState={loginState} onError={setError} />
          {error && (
            <ErrorOverlay error={error} onClose={() => setError(undefined)} />
          )}
        </Center>
      )}
    </>
  );
}
