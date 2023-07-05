import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Center } from "../components/core";
import { ReturnHeader } from "../components/core/Headers";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { CreatePost } from "../components/main/CreatePost";
import { ErrorOverlay } from "../components/main/ErrorOverlay";
import { ZUZALU_ADMINS_GROUP_URL } from "../src/env";
import { ZupollError } from "../src/types";
import { useSavedLoginState } from "../src/useLoginState";

export default function CreateBotPostPage() {
  const [error, setError] = useState<ZupollError>();
  const router = useRouter();
  const { loginState } = useSavedLoginState();

  // Log them out if they're not in a valid group
  useEffect(() => {
    if (loginState?.config?.groupUrl !== undefined) {
      if (loginState.config.groupUrl !== ZUZALU_ADMINS_GROUP_URL) {
        router.push("/");
      }
    }
  }, [loginState, router]);

  return (
    <>
      <Head>
        <title>Post from bot</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      {!loginState ? (
        <RippleLoaderLightMargin />
      ) : (
        <Center>
          <ReturnHeader />
          <CreatePost onError={setError} loginState={loginState} />
          {error && (
            <ErrorOverlay error={error} onClose={() => setError(undefined)} />
          )}
        </Center>
      )}
    </>
  );
}
