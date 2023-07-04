import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Center } from "../components/core";
import { ReturnHeader } from "../components/core/Headers";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { CreatePost } from "../components/main/CreatePost";
import { ErrorOverlay } from "../components/main/ErrorOverlay";
import {
  ZUZALU_ADMINS_GROUP_URL,
  ZUZALU_PARTICIPANTS_GROUP_URL,
} from "../src/env";
import { useLogin } from "../src/login";
import { ZupollError } from "../src/types";

export default function Page() {
  const [error, setError] = useState<ZupollError>();
  const router = useRouter();
  const { token, group, loadingToken, logout } = useLogin(router);
  const [loadingGroup, setLoadingGroup] = useState(true);

  // Log them out if they're not in a valid group
  useEffect(() => {
    if (group !== undefined) {
      if (
        group !== ZUZALU_ADMINS_GROUP_URL &&
        group !== ZUZALU_PARTICIPANTS_GROUP_URL
      ) {
        logout();
      }

      if (group !== ZUZALU_ADMINS_GROUP_URL) {
        router.push("/");
      } else {
        setLoadingGroup(false);
      }
    }
  }, [group, logout, router]);

  return (
    <>
      <Head>
        <title>Post from bot</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      {loadingGroup || loadingToken ? (
        <RippleLoaderLightMargin />
      ) : (
        <Center>
          <ReturnHeader />

          <CreatePost onError={setError} token={token} />

          {error && (
            <ErrorOverlay error={error} onClose={() => setError(undefined)} />
          )}
        </Center>
      )}
    </>
  );
}
