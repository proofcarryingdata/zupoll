import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
} from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { login } from "../src/api";
import { PASSPORT_URL } from "../src/util";
import { Button } from "./core/Button";
import { ErrorOverlay, ZupollError } from "./shared/ErrorOverlay";

/**
 * Login for the user who belongs to the specified semaphore group.
 * Generate a semaphore proof, calls the /login endpoint on the server, and
 * gets a JWT. The JWT can be used to make other requests to the server.
 * @param onLoggedIn a callback function which will be called after the user
 * logged in with the JWT.
 */
export function Login({
  onLoggedIn,
  requestedGroup,
  prompt,
}: {
  onLoggedIn: (token: string, group: string) => void;
  requestedGroup: string;
  prompt: string;
}) {
  const [error, setError] = useState<ZupollError>();
  const [loggingIn, setLoggingIn] = useState(false);

  const [pcdStr, _passportPendingPCDStr] = usePassportPopupMessages();

  useEffect(() => {
    if (!loggingIn) return;

    if (!pcdStr) return;

    const sendLogin = async () => {
      const res = await login(requestedGroup, pcdStr);
      if (!res.ok) {
        const resErr = await res.text();
        console.error("error login to the server: ", resErr);
        const err = {
          title: "Login failed",
          message: "Fail to connect to the server, please try again later.",
        } as ZupollError;
        setError(err);
        setLoggingIn(false);
        return;
      }
      const token = await res.json();
      return token.accessToken;
    };

    sendLogin().then((accessToken) => {
      setLoggingIn(false);
      onLoggedIn(accessToken, requestedGroup);
    });
  }, [pcdStr, loggingIn, requestedGroup, onLoggedIn]);

  return (
    <>
      <Button
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
