import { NextRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useLogin(router: NextRouter): {
  token: string;
  group: string | undefined;
  loadingToken: boolean;
  logout: () => void;
} {
  const [token, setToken] = useState<string>("");
  const [loadingToken, setLoadingToken] = useState<boolean>(true);

  const logout = useCallback(() => {
    setLoadingToken(true);
    delete window.localStorage["access_token"];
    router.push("/");
  }, [router]);

  // Automatically go to login screen if there's no access token
  useEffect(() => {
    if (window.localStorage["access_token"] === undefined) {
      // Go back to login page if no token
      router.push("/");
    } else {
      setToken(window.localStorage["access_token"]);
      setLoadingToken(false);
    }
  }, [setToken, router]);

  // Retrieve group from JWT
  const group = useMemo(() => {
    if (token !== undefined && token !== "") {
      const groupUrl = parseJwt(token)["groupUrl"] || undefined;
      return groupUrl;
    } else {
      return undefined;
    }
  }, [token]);

  return { token, group, loadingToken, logout };
}

function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(base64));
}
