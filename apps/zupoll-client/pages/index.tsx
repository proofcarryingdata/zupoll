import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Button } from "../components/core/Button";
import { CreatePoll } from "../components/CreatePoll";
import { LoginScreen } from "../components/LoginScreen";
import { Polls } from "../components/Polls";
import { ErrorOverlay, ZupollError } from "../components/shared/ErrorOverlay";
import { SEMAPHORE_ADMIN_GROUP_URL } from "../src/util";

export default function Page() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [newPoll, setNewPoll] = useState<string | undefined>();
  const [error, setError] = useState<ZupollError>();

  function parseJwt(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  }

  useEffect(() => {
    if (accessToken) return;

    const token = window.localStorage.getItem("access_token");
    if (token !== null) {
      const group = parseJwt(token)["groupUrl"] || null;
      setGroup(group);
    }
    setAccessToken(token);
  }, [accessToken]);

  const updateAccessToken = (token: string | null, group: string | null) => {
    setAccessToken(token);
    setGroup(group);
    if (!token) {
      window.localStorage.removeItem("access_token");
    } else {
      window.localStorage.setItem("access_token", token);
    }
  };

  const logout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      updateAccessToken(null, null);
    }
  };

  const onError = useCallback((err: ZupollError) => setError(err), []);

  const Wrap = accessToken ? Wrapper : WrapDark;

  return (
    <Wrap>
      <ReferendumSection>
        {accessToken ? (
          <>
            <LoggedInHeader>
              Zuzalu Polls
              <Button onClick={logout}>Logout</Button>
            </LoggedInHeader>
            {group == SEMAPHORE_ADMIN_GROUP_URL && (
              <CreatePoll onCreated={setNewPoll} onError={onError} />
            )}

            <Polls
              accessToken={accessToken}
              newPoll={newPoll}
              onError={onError}
            />

            {error && (
              <ErrorOverlay error={error} onClose={() => setError(undefined)} />
            )}
          </>
        ) : (
          <LoginScreen updateAccessToken={updateAccessToken} />
        )}
      </ReferendumSection>
    </Wrap>
  );
}

const LoggedInHeader = styled.div`
  width: 100%;
  font-size: 2em;
  margin-bottom: 32px;
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: flex-start;
  align-items: center;
`;

const WrapDark = styled(Wrapper)`
  background: rgb(28, 41, 40);
`;

const ReferendumSection = styled.div`
  width: 75ch;
  max-width: 80vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 20px;
  padding: 20px;
`;
