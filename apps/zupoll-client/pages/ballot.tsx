import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { BallotScreen } from "../components/main/BallotScreen";

export default function Page() {
  const searchParams = useSearchParams();
  const [ballotURL, setBallotURL] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");

    if (id === null) {
      window.location.href = "/";
    } else {
      setBallotURL(id);
    }
  }, [searchParams]);

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
