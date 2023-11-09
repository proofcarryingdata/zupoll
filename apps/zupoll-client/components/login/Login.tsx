import { useZupassPopupMessages } from "@pcd/passport-interface/src/PassportPopup";
import { useEffect, useState } from "react";
import { login } from "../../src/api";
import { LoginConfig, LoginState, ZupollError } from "../../src/types";
import {
  openGroupMembershipPopup,
  removeQueryParameters,
} from "../../src/util";
import { Button } from "../core/Button";
import stableStringify from "json-stable-stringify";

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
  config,
}: {
  onLogin: (loginState: LoginState) => void;
  onError: (error: ZupollError) => void;
  setServerLoading: (loading: boolean) => void;
  prompt: string;
  deemphasized?: boolean;
  config: LoginConfig;
}) {
  const [loggingIn, setLoggingIn] = useState(false);
  const [pcdStr] = useZupassPopupMessages();
  const [pcdFromUrl, setMyPcdStr] = useState("");
  const [configFromUrl, setMyConfig] = useState<LoginConfig>();

  useEffect(() => {
    const url = new URL(window.location.href);
    // Use URLSearchParams to get the proof query parameter
    const proofString = url.searchParams.get("proof");
    const configString = url.searchParams.get("config");

    if (proofString && configString) {
      // Decode the URL-encoded string
      const decodedProofString = decodeURIComponent(proofString);
      // Parse the decoded string into an object
      const proofObject = JSON.parse(decodedProofString);

      const decodedConfig = decodeURIComponent(configString);
      const configObject = JSON.parse(decodedConfig) as LoginConfig;
      console.log({ configObject });
      setMyConfig(configObject);

      setMyPcdStr(JSON.stringify(proofObject));
      setLoggingIn(true);
    }
  }, []);

  useEffect(() => {
    if (!loggingIn) return;
    if (!(pcdStr || pcdFromUrl)) return;
    if (configFromUrl) {
      if (configFromUrl.groupId !== config.groupId) return;
    }

    (async () => {
      try {
        setServerLoading(true);
        const token = await fetchLoginToken(config, pcdFromUrl || pcdStr);
        onLogin({
          token,
          config,
        });
      } catch (err: any) {
        const loginError: ZupollError = {
          title: "Login failed",
          message: err.message,
        };
        onError(loginError);
        removeQueryParameters();
      }
      setLoggingIn(false);
      setServerLoading(false);
    })();
  }, [
    pcdStr,
    pcdFromUrl,
    loggingIn,
    onLogin,
    onError,
    setServerLoading,
    config,
    configFromUrl,
  ]);

  return (
    <>
      <Button
        deemph={deemphasized}
        onClick={() => {
          setLoggingIn(true);
          openGroupMembershipPopup(
            config.passportAppUrl,
            window.location.origin + "/popup",
            config.groupUrl,
            "zupoll",
            undefined,
            undefined,
            window.location.origin +
              `?config=${encodeURIComponent(stableStringify(config))}`
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
