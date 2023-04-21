import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { LoginScreen } from "../components/login/LoginScreen";
import { MainScreen } from "../components/main/MainScreen";

export default function Page() {
  const [token, setToken] = useState<string>();

  useEffect(() => {
    setToken(window.localStorage["access_token"]);
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
    <Wrapper>
      {token ? (
        <MainScreen token={token} onLogout={logout} />
      ) : (
        <LoginScreen onLogin={saveToken} />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;
