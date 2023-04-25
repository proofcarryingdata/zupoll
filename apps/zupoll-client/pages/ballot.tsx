import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { BallotScreen } from "../components/main/BallotScreen";

export default function Page() {
  const searchParams = useSearchParams();
  const ballotURL = searchParams.get("id");

  useEffect(() => {
    if (ballotURL === null) {
      window.location.href = "/";
    }
  }, [ballotURL]);

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
