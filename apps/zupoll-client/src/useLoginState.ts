import { NextRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoginConfig, LoginState } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const CONFIGURATION_KEY = "configuration";

export function loadLoginStateFromLocalStorage(): LoginState | undefined {
  const savedToken: string | undefined = localStorage[ACCESS_TOKEN_KEY];
  const savedLoginConfig: string | undefined = localStorage[CONFIGURATION_KEY];

  let parsedLoginConfig: LoginConfig | undefined;
  try {
    parsedLoginConfig = JSON.parse(savedLoginConfig as any);
  } catch (e) {
    //
  }

  if (!savedToken || !parsedLoginConfig) {
    return undefined;
  }

  return {
    token: savedToken,
    config: parsedLoginConfig
  };
}

export function clearLoginStateFromLocalStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(CONFIGURATION_KEY);
}

export function saveLoginStateToLocalStorage(
  state: LoginState | undefined
): void {
  if (!state) {
    clearLoginStateFromLocalStorage();
  } else {
    localStorage.setItem(ACCESS_TOKEN_KEY, state.token);
    localStorage.setItem(CONFIGURATION_KEY, JSON.stringify(state.config));
  }
}

export function useSavedLoginState(router: NextRouter): SavedLoginState {
  const [loginState, setLoginInfo] = useState<LoginState | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLoginState = loadLoginStateFromLocalStorage();

    if (!savedLoginState) {
      clearLoginStateFromLocalStorage();
    } else {
      setLoginInfo(savedLoginState);
    }

    setIsLoading(false);
  }, []);

  const replaceLoginState = useCallback((state: LoginState | undefined) => {
    setLoginInfo(state);
    saveLoginStateToLocalStorage(state);
  }, []);

  const logout = useCallback(() => {
    replaceLoginState(undefined);
    router.push("/");
    delete localStorage.preLoginRoute;
  }, [replaceLoginState, router]);

  const definitelyNotLoggedIn = useMemo(() => {
    return !loginState && !isLoading;
  }, [isLoading, loginState]);

  return {
    loginState,
    replaceLoginState,
    isLoading,
    logout,
    definitelyNotLoggedIn
  };
}

export interface SavedLoginState {
  loginState: LoginState | undefined;
  isLoading: boolean;
  definitelyNotLoggedIn: boolean;
  replaceLoginState: (state: LoginState | undefined) => void;
  logout: () => void;
}
