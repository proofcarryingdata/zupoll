import { useZupassPopupMessages } from "@pcd/passport-interface/src/PassportPopup";
import { useEffect, useState } from "react";
import { LoginConfig, LoginState, ZupollError } from "../../src/types";
import { openGroupMembershipPopup } from "../../src/util";
import { Button } from "../core/Button";
import useLoginProcess from "../../src/useLogin";

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
  const [myPcdStr, setMyPcdStr] = useState("");
  console.log({ pcdStr });
  console.log({ myPcdStr });
  console.log({ loggingIn });
  console.log({ config });

  useEffect(() => {
    const url = new URL(window.location.href);
    // Use URLSearchParams to get the proof query parameter
    const proofString = url.searchParams.get("proof");
    if (proofString) {
      // Decode the URL-encoded string
      const decodedProofString = decodeURIComponent(proofString);
      // Parse the decoded string into an object
      const proofObject = JSON.parse(decodedProofString);
      console.log(`proof object`, proofObject);
      setMyPcdStr(JSON.stringify(proofObject));
      setLoggingIn(true);
    }
  }, []);

  const { login } = useLoginProcess(
    config,
    onLogin,
    onError,
    setServerLoading,
    setLoggingIn,
    loggingIn,
    myPcdStr,
    pcdStr
  );

  // Use the login function in an effect
  useEffect(() => {
    console.log(`Calling login`);
    login();
  }, [login]);

  // useEffect(() => {
  //   if (!loggingIn) return;
  //   if (!(pcdStr || myPcdStr)) return;

  //   (async () => {
  //     try {
  //       setServerLoading(true);
  //       const token = await fetchLoginToken(config, myPcdStr || pcdStr);
  //       onLogin({
  //         token,
  //         config,
  //       });
  //     } catch (err: any) {
  //       const loginError: ZupollError = {
  //         title: "Login failed",
  //         message: err.message,
  //       };
  //       onError(loginError);
  //     }
  //     setLoggingIn(false);
  //     setServerLoading(false);
  //   })();
  // }, [pcdStr, myPcdStr, loggingIn, onLogin, onError, setServerLoading, config]);

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
            window.location.origin + `?config=${JSON.stringify(config)}`
          );
        }}
        disabled={loggingIn}
      >
        {prompt}
      </Button>
    </>
  );
}
