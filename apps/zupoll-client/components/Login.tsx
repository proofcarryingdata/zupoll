import {
  useSemaphorePassportProof,
  requestZuzaluMembershipUrl,
  usePassportResponse,
} from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { ConfessionsError, ErrorOverlay } from "./shared/ErrorOverlay";
import { PASSPORT_URL, SEMAPHORE_GROUP_URL, requestProofFromPassport } from "../src/util";
import { login } from "../src/api";

/**
 * Login for the user who belongs to the specified semaphore group.
 * Generate a semaphore proof, calls the /login endpoint on the server, and
 * gets a jwt. The jwt can be used to make other requests to the server.
 * @param onLoggedIn a callback function which will be called after the user logged in
 * with the jwt
 */
export function Login({
  onLoggedIn,
}: {
  onLoggedIn: (_: string) => void;
}) {
  const [error, setError] = useState<ConfessionsError>();
  const [loggingIn, setLoggingIn] = useState(false);

  const [pcdStr] = usePassportResponse();

  const { proof, valid, error: proofError } = useSemaphorePassportProof(
    SEMAPHORE_GROUP_URL!,
    pcdStr
  )

  useEffect(() =>  {
    if (valid === undefined) return; // verifying

    if (proofError) {
      console.error("error using semaphore passport proof: ", proofError);
      const err = {
        title: "Login failed",
        message: "There's an error in generating proof.",
      } as ConfessionsError;
      setError(err);
      setLoggingIn(false);
      return;
    }

    if (!valid) {
      const err = {
        title: "Login failed",
        message: "Proof is invalid.",
      } as ConfessionsError;
      setError(err);
      setLoggingIn(false);
      return;
    }

    (async () => {
      const res = await login(SEMAPHORE_GROUP_URL!, pcdStr);
      if (!res.ok) {
        const resErr = await res.text();
        console.error("error login to the server: ", resErr);
        const err = {
          title: "Login failed",
          message: "Fail to connect to the server, please try again later.",
        } as ConfessionsError;
        setError(err);
        setLoggingIn(false);
        return;
      }
      const token = await res.json();
      return token.accessToken;
    })().then((accessToken) => {
      setLoggingIn(false);
      onLoggedIn(accessToken);
    })
  }, [proof, valid, proofError, pcdStr, onLoggedIn]);

  return (
    <>
      <button
        onClick={
          () => {
            setLoggingIn(true);
            requestZuzaluMembershipProof(() => setLoggingIn(false));
          }
        }
        disabled={loggingIn}
      >
        Login
      </button>
      {error && <ErrorOverlay error={error} onClose={() => setError(undefined)}/> }
      <br />
      <br />
    </>
  );
}


// Show the Passport popup
// TODO: make the description in the "prove membership" screen
// more relevant to this login case
function requestZuzaluMembershipProof(onPopupClose: () => void) {
  const proofUrl = requestZuzaluMembershipUrl(
    PASSPORT_URL,
    window.location.origin + "/popup",
    SEMAPHORE_GROUP_URL!
  );

  requestProofFromPassport(proofUrl, onPopupClose);
}
