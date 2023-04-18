import { useEffect, useState } from "react";
import styled from "styled-components";
import { Button } from "../components/core/Button";
import { CreatePoll } from "../components/CreatePoll";
import { Login } from "../components/Login";
import { Polls } from "../components/Polls";
import { ErrorOverlay, ZupollError } from "../components/shared/ErrorOverlay";
import { SEMAPHORE_ADMIN_GROUP_URL, SEMAPHORE_GROUP_URL } from "../src/util";

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
      window.localStorage.setItem("access_token", token!);
    }
  };

  const onError = (err: ZupollError) => setError(err);

  return (
    <Wrapper>
      <ReferendumSection>
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}
        >
          <img src="/zuzalulogo.png" alt="Zuzalu" width="174" />
        </div>

        <h1>Referendums</h1>
        {accessToken ? (
          <>
            {group == SEMAPHORE_ADMIN_GROUP_URL && (
              <CreatePoll onCreated={setNewPoll} onError={onError} />
            )}
            <Polls
              accessToken={accessToken}
              newPoll={newPoll}
              onError={onError}
            />
            <Button onClick={() => updateAccessToken(null, null)}>
              Logout
            </Button>
            {error && (
              <ErrorOverlay error={error} onClose={() => setError(undefined)} />
            )}
          </>
        ) : (
          <>
            <LoginContainer>
              <Login
                onLoggedIn={updateAccessToken}
                requestedGroup={SEMAPHORE_GROUP_URL}
                prompt="Anon Login"
              />
              <Login
                onLoggedIn={updateAccessToken}
                requestedGroup={SEMAPHORE_ADMIN_GROUP_URL}
                prompt="Admin Login"
              />
            </LoginContainer>
          </>
        )}
      </ReferendumSection>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
`;

const ReferendumSection = styled.div`
  width: 75ch;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1c2928;
  border-radius: 20px;
  padding: 20px;
  h1 {
    color: white;
    font-family: "Roboto", sans-serif;
    text-align: center;
    margin-top: 20px;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
`;
