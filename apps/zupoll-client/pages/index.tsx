import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { LoginScreen } from "../components/login/LoginScreen";
import { MainScreen } from "../components/main/MainScreen";

export default function Page() {
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setToken(window.localStorage["access_token"]);
    setLoading(false);
  }, [setToken]);

  const saveToken = useCallback(
    (token: string | undefined) => {
      setToken(token);
      if (token) window.localStorage["access_token"] = token;
      else delete window.localStorage["access_token"];
    },
    [setToken]
  );

  const logout = useCallback(() => saveToken(undefined), [saveToken]);

  return (
    <>
    <Head>
      <title>Zupoll</title>
      <link rel="Zupoll icon" href="/zupoll-icon.ico" />
    </Head>
    <Wrapper>
      {loading ? (
        <RippleLoaderLightMargin />
      ) : token ? (
        <MainScreen
          onLogout={logout}
        />
      ) : (
        <LoginScreen onLogin={saveToken} />
      )}
    </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;
