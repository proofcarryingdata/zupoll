import { useEffect, useState } from "react";
import { getHistoricGroupUrl, getLatestSemaphoreGroupHash } from "./api";
import { ZupollError } from "./types";

export function useHistoricSemaphoreUrl(
  semaphoreGroupServer: string,
  semaphoreGroupId: string,
  onError: (error: ZupollError) => void
) {
  const [loading, setLoading] = useState(true);
  const [rootHash, setRootHash] = useState<string | null>(null);

  useEffect(() => {
    getLatestSemaphoreGroupHash(semaphoreGroupId, semaphoreGroupServer)
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
  }, [onError, semaphoreGroupId, semaphoreGroupServer]);

  return {
    loading,
    rootHash,
    groupUrl:
      rootHash &&
      getHistoricGroupUrl(semaphoreGroupId, rootHash, semaphoreGroupServer),
  };
}
