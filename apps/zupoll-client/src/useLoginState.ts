import { useCallback, useEffect, useState } from "react";
import { LoginConfig, SavedLogin } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const CONFIGURATION_KEY = "configuration";

export function loadLoginStateFromLocalStorage(): SavedLogin | undefined {
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

export function clearLoginStateFromLocalStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(CONFIGURATION_KEY);
}

export function saveLoginStateToLocalStorage(
  state: SavedLogin | undefined
): void {
  if (!state) {
    clearLoginStateFromLocalStorage();
  } else {
    localStorage.setItem(ACCESS_TOKEN_KEY, state.token);
    localStorage.setItem(CONFIGURATION_KEY, JSON.stringify(state.config));
  }
}

export function useSavedLoginState(): {
  state: SavedLogin | undefined;
  replaceState: (state: SavedLogin | undefined) => void;
} {
  const [loginInfo, setLoginInfo] = useState<SavedLogin | undefined>();

  useEffect(() => {
    const savedLoginState = loadLoginStateFromLocalStorage();

    if (!savedLoginState) {
      clearLoginStateFromLocalStorage();
    } else {
      setLoginInfo(savedLoginState);
    }
  }, []);

  const replaceState = useCallback((state: SavedLogin | undefined) => {
    setLoginInfo(state);
    saveLoginStateToLocalStorage(state);
  }, []);

  return { state: loginInfo, replaceState };
}
