import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
} from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { login } from "../../src/api";
import { PASSPORT_URL } from "../../src/util";
import { Button } from "../core/Button";
import { ErrorOverlay, ZupollError } from "../main/ErrorOverlay";

/**
 * Login for the user who belongs to the specified semaphore group.
 * Generate a semaphore proof, calls the /login endpoint on the server, and
 * gets a JWT. The JWT can be used to make other requests to the server.
 * @param onLoggedIn a callback function which will be called after the user
 * logged in with the JWT.
 */
export function Login({
  onLogin,
  onServerLoading,
  requestedGroup,
  prompt,
  deemphasized,
}: {
  onLogin: (token: string) => void;
  onServerLoading: () => void;
  requestedGroup: string;
  prompt: string;
  deemphasized?: boolean;
}) {
  const [error, setError] = useState<ZupollError>();
  const [loggingIn, setLoggingIn] = useState(false);

  const [pcdStr] = usePassportPopupMessages();

  useEffect(() => {
    if (!loggingIn) return;
    if (!pcdStr) return;

    (async () => {
      try {
        onServerLoading();
        const token = await fetchLoginToken(requestedGroup, pcdStr);
        onLogin(token);
      } catch (err: any) {
        setError({ title: "Login failed", message: err.message });
      } finally {
        setLoggingIn(false);
      }
    })();
  }, [pcdStr, loggingIn, requestedGroup, onLogin, onServerLoading]);

  return (
    <>
      <Button
        deemph={deemphasized}
        onClick={() => {
          setLoggingIn(true);
          openZuzaluMembershipPopup(
            PASSPORT_URL,
            window.location.origin + "/popup",
            requestedGroup,
            "zupoll"
          );
        }}
        disabled={loggingIn}
      >
        {prompt}
      </Button>
      {error && (
        <ErrorOverlay error={error} onClose={() => setError(undefined)} />
      )}
    </>
  );
}

async function fetchLoginToken(requestedGroup: string, pcdStr: string) {
  const res = await login(requestedGroup, pcdStr);
  if (!res.ok) {
    const resErr = await res.text();
    console.error("Login error", resErr);
    throw new Error("Login failed. " + resErr);
  }
  const token = await res.json();
  return token.accessToken;
}
