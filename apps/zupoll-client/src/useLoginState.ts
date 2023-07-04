import { NextRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LoginConfig, LoginState, SavedLogin } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const CONFIGURATION_KEY = "configuration";

function loadLoginStateFromLocalStorage(): SavedLogin | undefined {
  const savedToken = localStorage[ACCESS_TOKEN_KEY];
  const savedLoginConfig = localStorage[CONFIGURATION_KEY];

  let parsedLoginConfig: LoginConfig | undefined;
  try {
    parsedLoginConfig = JSON.parse(savedLoginConfig);
  } catch (e) {
    //
  }

  if (!savedToken || !parsedLoginConfig) {
    return undefined;
  }

  return {
    token: savedToken,
    config: savedLoginConfig,
  };
}

function clearLoginStateFromLocalStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(CONFIGURATION_KEY);
}

function saveLoginStateToLocalStorage(
  token: string,
  loginConfig: LoginConfig
): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(CONFIGURATION_KEY, JSON.stringify(loginConfig));
}

export function useSavedLoginState(router: NextRouter): LoginState {
  const [savedLoginInfo, setSavedLoginInfo] = useState<SavedLogin>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const logout = useCallback(() => {
    clearLoginStateFromLocalStorage();
    router.push("/");
  }, [router]);

  useEffect(() => {
    const savedLoginState = loadLoginStateFromLocalStorage();

    if (!savedLoginState) {
      clearLoginStateFromLocalStorage();
    } else {
      setSavedLoginInfo(savedLoginInfo);
      setIsLoaded(true);
    }
  }, [router, savedLoginInfo]);

  return {
    isLoaded,
    logout,
    config: savedLoginInfo?.config,
    token: savedLoginInfo?.token,
  };
}
