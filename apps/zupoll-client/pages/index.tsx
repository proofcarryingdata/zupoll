import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { RippleLoaderLightMargin } from "../components/core/RippleLoader";
import { LoginScreen } from "../components/login/LoginScreen";
import { MainScreen } from "../components/main/MainScreen";
import { LoginConfiguration } from "../src/types";

export default function Page() {
  const [token, setToken] = useState<string>();
  const [config, setConfig] = useState<LoginConfiguration>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedConfig = window.localStorage["configuration"];
    let parsedConfig: LoginConfiguration | undefined;

    try {
      parsedConfig = JSON.parse(savedConfig);
    } catch (e) {
      console.log(e);
    }

    if (!parsedConfig) {
      setToken(undefined);
      return;
    }

    setToken(window.localStorage["access_token"]);
    setConfig(parsedConfig);
    setLoading(false);
  }, [setToken]);

  const saveLoginDetails = useCallback(
    (token: string | undefined, config: LoginConfiguration | undefined) => {
      setToken(token);
      setConfig(config);

      if (token) {
        window.localStorage["access_token"] = token;
      } else {
        delete window.localStorage["access_token"];
      }

      if (config) {
        window.localStorage["configuration"] = JSON.stringify(config);
      } else {
        delete window.localStorage["configuration"];
      }
    },
    [setToken]
  );

  const logout = useCallback(
    () => saveLoginDetails(undefined, undefined),
    [saveLoginDetails]
  );

  return (
    <>
      <Head>
        <title>Zupoll</title>
        <link rel="Zupoll icon" href="/zupoll-icon.ico" />
      </Head>
      <Wrapper>
        {loading ? (
          <RippleLoaderLightMargin />
        ) : token && config ? (
          <MainScreen config={config} token={token} onLogout={logout} />
        ) : (
          <LoginScreen onLogin={saveLoginDetails} />
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
