import { useCallback } from "react";
import { LoginConfig, LoginState, ZupollError } from "./types";
import { login } from "./api";

export async function fetchLoginToken(
  configuration: LoginConfig,
  pcdStr: string
) {
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

// Define the custom hook
function useLoginProcess(
  config: LoginConfig,
  onLogin: (loginState: LoginState) => void,
  onError: (loginState: ZupollError) => void,
  setServerLoading: (loading: boolean) => void,
  setLoggingIn: (loading: boolean) => void,
  loggingIn: boolean,
  myPcdStr?: string,
  pcdStr?: string
) {
  // Define the login function
  const login = useCallback(async () => {
    console.log(`[LOGIN]`, loggingIn, pcdStr, myPcdStr);
    if (!loggingIn) return;
    if (!pcdStr || !myPcdStr) return;

    try {
      setServerLoading(true);
      console.log(`Fethcing login token`);
      const token = await fetchLoginToken(config, myPcdStr || pcdStr);
      onLogin({
        token,
        config,
      });
    } catch (err: any) {
      const loginError = {
        title: "Login failed",
        message: err.message,
      };
      onError(loginError);
    } finally {
      setLoggingIn(false);
      setServerLoading(false);
    }
  }, [
    pcdStr,
    myPcdStr,
    loggingIn,
    onLogin,
    onError,
    config,
    setLoggingIn,
    setServerLoading,
  ]);

  return { login, loggingIn };
}

export default useLoginProcess;
