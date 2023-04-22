import { useEffect, useState } from "react";
import { getHistoricGroupUrl, getLatestSemaphoreGroupHash } from "./api";
import { ZupollError } from "./types";

export function useHistoricSemaphoreUrl(
  semaphoreGroupId: string,
  onError: (error: ZupollError) => void
) {
  const [loading, setLoading] = useState(true);
  const [rootHash, setRootHash] = useState<string | null>(null);

  useEffect(() => {
    if (rootHash === null) return;
    console.log(`using voter url: ${rootHash}`)
  }, [rootHash])

  useEffect(() => {
    getLatestSemaphoreGroupHash(semaphoreGroupId)
      .then(url => setRootHash(url))
      .catch((e: Error) => {
        console.log(e);
        onError({
          message: "Failed to load historic Semaphore Group", 
          title: "Loading Error"
        });
      })
      .finally(() => {
        setLoading(false)
      });
  }, [onError, semaphoreGroupId])

  return {
    loading,
    rootHash,
    groupUrl: rootHash && getHistoricGroupUrl(semaphoreGroupId, rootHash)
  }
}
