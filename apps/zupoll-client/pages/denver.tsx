import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import styled from "styled-components";
import { LoginScreen } from "../components/login/LoginScreen";
import { MainScreen } from "../components/main/MainScreen";
import { LoginConfigurationName, LoginState } from "../src/types";
import { useSavedLoginState } from "../src/useLoginState";
import { removeQueryParameters } from "../src/util";

export default function Denver() {
  const router = useRouter();

  useEffect(() => {
    // Check if the query parameter exists
    if (router.query.tgWebAppStartParam) {
      console.log(`got start param`, router.query.tgWebAppStartParam);
      router.push(`/ballot?id=${router.query.tgWebAppStartParam}`);
    }
  }, [router.query.tgWebAppStartParam, router]);

  const {
    loginState,
    replaceLoginState,
    isLoading,
    logout,
    definitelyNotLoggedIn,
  } = useSavedLoginState(router);

  useEffect(() => {
    if (definitelyNotLoggedIn) {
      replaceLoginState(undefined);
    }
  }, [definitelyNotLoggedIn, logout, replaceLoginState]);

  let content = <></>;

  if (!isLoading && !loginState) {
    content = (
      <LoginScreen
        title="Edge City Denver"
        loginConfigs={[LoginConfigurationName.EDGE_CITY_RESIDENT, LoginConfigurationName.EDGE_CITY_ORGANIZER]}
        onLogin={(state: LoginState) => {
          replaceLoginState(state);
          removeQueryParameters();
          const redirectUrl = localStorage.getItem("preLoginRoute") || "/";
          delete localStorage["preLoginRoute"];
          router.push(redirectUrl);
        }}
      />
    );
  } else if (loginState) {
    content = <MainScreen loginState={loginState} logout={logout} />;
  }

  return (
    <>
      <Head>
        <title>Zupoll</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      <Wrapper>{content}</Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;
