import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { SEMAPHORE_ADMIN_GROUP_URL } from "../../src/util";
import { Button } from "../core/Button";
import { CreatePoll } from "./CreatePoll";
import { ErrorOverlay, ZupollError } from "./ErrorOverlay";
import { Polls } from "./Polls";

export function MainScreen({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [newPoll, setNewPoll] = useState<string>();
  const [error, setError] = useState<ZupollError>();
  const group = useMemo(() => parseJwt(token)["groupUrl"] || null, [token]);

  const confirmLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    }
  }, [onLogout]);

  const onError = useCallback((err: ZupollError) => setError(err), []);

  return (
    <Center>
      <LoggedInHeader>
        Zuzalu Polls
        <Button onClick={confirmLogout}>Logout</Button>
      </LoggedInHeader>
      {group == SEMAPHORE_ADMIN_GROUP_URL && (
        <CreatePoll onCreated={setNewPoll} onError={onError} />
      )}

      <Polls accessToken={token} newPoll={newPoll} onError={onError} />

      {error && (
        <ErrorOverlay error={error} onClose={() => setError(undefined)} />
      )}
    </Center>
  );
}

function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(base64));
}

const Center = styled.div`
  width: 100%;
  max-width: 512px;
  padding: 0 1rem;
  margin: 0 auto;
`;

const LoggedInHeader = styled.div`
  width: 100%;
  font-size: 2em;
  margin-bottom: 32px;
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #fff;
`;
