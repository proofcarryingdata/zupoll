import { useEffect, useState } from "react";
import styled from "styled-components";
import { Polls } from "../components/Polls";
import { Login } from "../components/Login";
import { CreatePoll } from "../components/CreatePoll";
import { ConfessionsError, ErrorOverlay } from "../components/shared/ErrorOverlay";

export default function Page() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [newPoll, setNewPoll] = useState<string | undefined>();
  const [error, setError] = useState<ConfessionsError>();

  useEffect(() => {
    if (accessToken) return;

    const token = window.localStorage.getItem("access_token");
    setAccessToken(token);
  }, [accessToken]);

  const updateAccessToken = (token: string | null) => {
    setAccessToken(token);
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
          <button onClick={() => updateAccessToken(null)}>Logout</button>
          <br />
          <br />
          <Container>
            <CreatePoll onCreated={setNewPoll} onError={onError}/>
          </Container>
          <Container>
            <Polls accessToken={accessToken} newPoll={newPoll} onError={onError} />
          </Container>
          {error && (
            <ErrorOverlay error={error} onClose={() => setError(undefined)} />
          )}
        </>
      ) : (
        <Login onLoggedIn={updateAccessToken} />
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
