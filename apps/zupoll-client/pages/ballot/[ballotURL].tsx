import { useRouter } from "next/router";
import { RippleLoaderLightMargin } from "../../components/core/RippleLoader";
import { BallotScreen } from "../../components/main/BallotScreen";

export default function Page({ ballotURL }: any) {
  return (
    <>
      {ballotURL === undefined ? (
        <RippleLoaderLightMargin />
      ) : (
        <BallotScreen ballotURL={ballotURL.toString()} />
      )}
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  }
}

export async function getStaticProps({ params } : any) {
  return {
    props: {
      ballotURL: params.ballotURL
    }
  }
}
