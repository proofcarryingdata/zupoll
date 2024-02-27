import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { BallotScreen } from "../components/main/BallotScreen";
import { useSavedLoginState } from "../src/useLoginState";

export default function BallotPage() {
  const router = useRouter();
  const [ballotURL, setBallotURL] = useState<string | null>(null);
  const { loginState, logout, definitelyNotLoggedIn } =
    useSavedLoginState(router);

  useEffect(() => {
    if (definitelyNotLoggedIn) {
      logout();
    }
  }, [definitelyNotLoggedIn, logout]);

  useEffect(() => {
    if (router.isReady) {
      const id = router.query.id;
      if (id === undefined) {
        window.location.href = "/";
      } else {
        if (!loginState || definitelyNotLoggedIn) {
          console.log(`[STORING BALLOT URL]`, router.asPath);
          localStorage.setItem("preLoginRoute", router.asPath);
        }
        setBallotURL(id.toString());
      }
    }
  }, [
    router.isReady,
    router.query.id,
    router.asPath,
    loginState,
    definitelyNotLoggedIn
  ]);

  return (
    <>
      {ballotURL === null || !loginState ? (
        <RippleLoaderLightMargin />
      ) : (
        <BallotScreen
          logout={logout}
          loginState={loginState}
          ballotURL={ballotURL.toString()}
        />
      )}
    </>
  );
}
