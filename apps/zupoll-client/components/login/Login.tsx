import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
} from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { login } from "../../src/api";
import { LoginConfig, ZupollError } from "../../src/types";
import { Button } from "../core/Button";

/**
 * Login for the user who belongs to the specified semaphore group.
 * Generate a semaphore proof, calls the /login endpoint on the server, and
 * gets a JWT. The JWT can be used to make other requests to the server.
 * @param onLoggedIn a callback function which will be called after the user
 * logged in with the JWT.
 */
export function Login({
  onLogin,
  onError,
  setServerLoading,
  prompt,
  deemphasized,
  configuration,
}: {
  onLogin: (token: string, configuration: LoginConfig) => void;
  onError: (error: ZupollError) => void;
  setServerLoading: (loading: boolean) => void;
  prompt: string;
  deemphasized?: boolean;
  configuration: LoginConfig;
}) {
  const [loggingIn, setLoggingIn] = useState(false);

  const [pcdStr] = usePassportPopupMessages();

  useEffect(() => {
    if (!loggingIn) return;
    if (!pcdStr) return;

    (async () => {
      try {
        setServerLoading(true);
        const token = await fetchLoginToken(configuration, pcdStr);
        onLogin(token, configuration);
      } catch (err: any) {
        const loginError: ZupollError = {
          title: "Login failed",
          message: err.message,
        };
        onError(loginError);
      }
      setLoggingIn(false);
      setServerLoading(false);
    })();
  }, [pcdStr, loggingIn, onLogin, onError, setServerLoading, configuration]);

  return (
    <>
      <Button
        deemph={deemphasized}
        onClick={() => {
          setLoggingIn(true);
          openZuzaluMembershipPopup(
            configuration.passportAppUrl,
            window.location.origin + "/popup",
            configuration.groupUrl,
            "zupoll"
          );
        }}
        disabled={loggingIn}
      >
        {prompt}
      </Button>
    </>
  );
}

async function fetchLoginToken(configuration: LoginConfig, pcdStr: string) {
  const res = await login(configuration, pcdStr);
  if (res === undefined) {
    throw new Error("Server is down. Contact passport@0xparc.org.");
  }
  if (!res.ok) {
    const resErr = await res.text();
    console.error("Login error", resErr);
    throw new Error("Login failed. " + resErr);
  }
  const token = await res.json();
  return token.accessToken;
}
