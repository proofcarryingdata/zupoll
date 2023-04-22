import { useEffect, useState } from "react";
import { getLatestSemaphoreGroupUrl } from "./api";
import { ZupollError } from "./types";

export function useVoterUrl(
  semaphoreGroupId: string,
  onError: (error: ZupollError) => void
) {
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url === null) return;
    console.log(`using voter url: ${url}`)
  }, [url])

  useEffect(() => {
    getLatestSemaphoreGroupUrl(semaphoreGroupId)
      .then(url => setUrl(url))
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

  return { loading, url }
}
