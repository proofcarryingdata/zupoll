import { useEffect, useState } from "react";
import styled from "styled-components";
import { CreatePoll } from "../components/CreatePoll";
import { Login } from "../components/Login";
import { Polls } from "../components/Polls";
import {
  ConfessionsError,
  ErrorOverlay,
} from "../components/shared/ErrorOverlay";
import { SEMAPHORE_ADMIN_GROUP_URL, SEMAPHORE_GROUP_URL } from "../src/util";

export default function Page() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [newPoll, setNewPoll] = useState<string | undefined>();
  const [error, setError] = useState<ConfessionsError>();

  function parseJwt (token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}

  useEffect(() => {
    if (accessToken) return;

    const token = window.localStorage.getItem("access_token");
    if (token !== null) {
      const group = parseJwt(token)['groupUrl'] || null;
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
      window.localStorage.setItem("access_token", token!);
    }
  };

  const onError = (err: ConfessionsError) => setError(err);

  return (
    <>
      <h1>Polls</h1>
      {accessToken ? (
        <>
          <button onClick={() => updateAccessToken(null, null)}>Logout</button>
          <br />
          <br />
          {group == SEMAPHORE_ADMIN_GROUP_URL && (
            <Container>
              <CreatePoll onCreated={setNewPoll} onError={onError} />
            </Container>
          )}
          <Container>
            <Polls
              accessToken={accessToken}
              newPoll={newPoll}
              onError={onError}
            />
          </Container>
          {error && (
            <ErrorOverlay error={error} onClose={() => setError(undefined)} />
          )}
        </>
      ) : (
        <>
          <Login
            onLoggedIn={updateAccessToken}
            requestedGroup={SEMAPHORE_GROUP_URL!}
            prompt="Login"
          />
          <Login
            onLoggedIn={updateAccessToken}
            requestedGroup={SEMAPHORE_ADMIN_GROUP_URL}
            prompt="Login as Admin"
          />
        </>
      )}
    </>
  );
}

const Container = styled.div`
  font-family: system-ui, sans-serif;
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 16px;
`;
