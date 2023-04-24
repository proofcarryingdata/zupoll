import { useCallback, useMemo, useState } from "react";
import { ZupollError } from "../../src/types";
import { SEMAPHORE_ADMIN_GROUP_URL } from "../../src/util";
import { Button } from "../core/Button";
import { CreatePoll } from "./CreatePoll";
import { ErrorOverlay } from "./ErrorOverlay";
import { Polls } from "./Polls";
import { LoggedInHeader } from "../core/Headers";
import { Center } from "../core";

export function MainScreen({
  token,
  resetToken,
  onLogout,
}: {
  token: string;
  resetToken: () => void;
  onLogout: () => void;
}) {
  const [newPoll, setNewPoll] = useState<string>();
  const [error, setError] = useState<ZupollError>();
  const group = useMemo(() => parseJwt(token)["groupUrl"] || null, [token]);

  const onError = useCallback((err: ZupollError) => setError(err), []);

  return (
    <Center>
      <LoggedInHeader onLogout={onLogout} />
      
      {group == SEMAPHORE_ADMIN_GROUP_URL && (
        <CreatePoll onCreated={setNewPoll} onError={onError} />
      )}

      <Polls
        accessToken={token}
        newPoll={newPoll}
        resetToken={resetToken}
        onError={onError}
      />

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
