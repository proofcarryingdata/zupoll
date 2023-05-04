import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Center } from "../components/core";
import { ExitHeader } from "../components/core/Headers";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { CreatePost } from "../components/main/CreatePost";
import { ErrorOverlay } from "../components/main/ErrorOverlay";
import { useLogin } from "../src/login";
import { ZupollError } from "../src/types";
import { SEMAPHORE_ADMIN_GROUP_URL, SEMAPHORE_GROUP_URL } from "../src/util";

export default function Page() {
  const [error, setError] = useState<ZupollError>();
  const router = useRouter();
  const { token: _token, group, loadingToken, logout } = useLogin(router);

  // Log them out if they're not in a valid group
  useEffect(() => {
    if (group !== undefined) {
      if (
        group !== SEMAPHORE_ADMIN_GROUP_URL &&
        group !== SEMAPHORE_GROUP_URL
      ) {
        logout();
      }
    }
  }, [group, logout]);

  return (
    <>
      <Head>
        <title>Post from bot</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      {loadingToken ? (
        <RippleLoaderLightMargin />
      ) : (
        <Center>
          <ExitHeader />

          <CreatePost onError={setError} />

          {error && (
            <ErrorOverlay error={error} onClose={() => setError(undefined)} />
          )}
        </Center>
      )}
    </>
  );
}
