import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { BallotScreen } from "../components/main/BallotScreen";

export default function BallotPage() {
  const router = useRouter();
  const [ballotURL, setBallotURL] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      const id = router.query.id;
      if (id === undefined) {
        window.location.href = "/";
      } else {
        setBallotURL(id.toString());
      }
    }
  }, [router.isReady, router.query.id]);

  return (
    <>
      {ballotURL === null ? (
        <RippleLoaderLightMargin />
      ) : (
        <BallotScreen ballotURL={ballotURL.toString()} />
      )}
    </>
  );
}
