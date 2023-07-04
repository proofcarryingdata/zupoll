import { useEffect, useState } from "react";
import { getHistoricGroupUrl, getLatestSemaphoreGroupHash } from "./api";
import {
  PCDPASS_SERVER_URL,
  PCDPASS_USERS_GROUP_ID,
  ZUPASS_SERVER_URL,
} from "./env";
import { ZupollError } from "./types";

export function useHistoricSemaphoreUrl(
  semaphoreGroupId: string,
  onError: (error: ZupollError) => void
) {
  const [loading, setLoading] = useState(true);
  const [rootHash, setRootHash] = useState<string | null>(null);

  let serverUrl = ZUPASS_SERVER_URL;
  if (semaphoreGroupId === PCDPASS_USERS_GROUP_ID) {
    serverUrl = PCDPASS_SERVER_URL;
  }

  useEffect(() => {
    getLatestSemaphoreGroupHash(semaphoreGroupId, serverUrl)
      .then((hash) => setRootHash(hash))
      .catch((e: Error) => {
        console.log(e);
        onError({
          message: "Failed to load historic Semaphore Group",
          title: "Loading Error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [onError, semaphoreGroupId, serverUrl]);

  return {
    loading,
    rootHash,
    groupUrl:
      rootHash && getHistoricGroupUrl(semaphoreGroupId, rootHash, serverUrl),
  };
}
