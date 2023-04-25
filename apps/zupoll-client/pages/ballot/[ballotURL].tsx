import { useRouter } from "next/router";
import { RippleLoaderLightMargin } from "../../components/core/RippleLoader";
import { BallotScreen } from "../../components/main/BallotScreen";

export default function Page() {
  const router = useRouter();
  const { ballotURL } = router.query;

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
    fallback: 'blocking'
  }
}

export async function getStaticProps({ _params } : any) {
  return {
    props: {}
  }
}
