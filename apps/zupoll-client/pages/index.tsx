import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import styled from "styled-components";
import { LoginScreen } from "../components/login/LoginScreen";
import { MainScreen } from "../components/main/MainScreen";
import { useSavedLoginState } from "../src/useLoginState";

export default function Index() {
  const router = useRouter();
  const { loginState, replaceLoginState, isLoading } = useSavedLoginState();

  const onLogout = useCallback(() => {
    replaceLoginState(undefined);
    router.push("/");
  }, [replaceLoginState, router]);

  useEffect(() => {
    if (!isLoading && !loginState) {
      replaceLoginState(undefined);
    }
  }, [isLoading, loginState, onLogout, replaceLoginState]);

  let content = <></>;

  if (!isLoading && !loginState) {
    content = (
      <LoginScreen
        onLogin={(token, config) => {
          replaceLoginState({
            config,
            token,
          });
        }}
      />
    );
  } else if (!isLoading && loginState) {
    content = <MainScreen loginState={loginState} onLogout={onLogout} />;
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
