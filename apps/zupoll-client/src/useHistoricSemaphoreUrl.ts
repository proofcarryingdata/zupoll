import { useEffect, useState } from "react";
import { getHistoricGroupUrl, getLatestSemaphoreGroupHash } from "./api";
import { BallotConfig, ZupollError } from "./types";

export function useHistoricSemaphoreUrl(
  ballotConfig: BallotConfig,
  onError: (error: ZupollError) => void
) {
  const [loading, setLoading] = useState(true);
  const [rootHash, setRootHash] = useState<string | null>(null);
  const semaphoreGroupId = ballotConfig.voterGroupId;
  const semaphoreGroupServer = ballotConfig.passportServerUrl;
  useEffect(() => {
    if (!ballotConfig.passportServerUrl || !ballotConfig.voterGroupId) {
      setLoading(true);
      return;
    }
    const semaphoreGroupId = ballotConfig.voterGroupId;
    const semaphoreGroupServer = ballotConfig.passportServerUrl;
    const groupHashUrl = ballotConfig.latestGroupHashUrl
      ? ballotConfig.latestGroupHashUrl
      : `${semaphoreGroupServer}semaphore/latest-root/${encodeURIComponent(
          semaphoreGroupId
        )}`;
    getLatestSemaphoreGroupHash(groupHashUrl)
      .then((hash) => setRootHash(hash))
      .catch((e: Error) => {
        console.log(e);
        onError({
          message: "Failed to load historic Semaphore Group",
          title: "Loading Error"
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [onError, ballotConfig]);
  return {
    loading,
    rootHash,
    groupUrl:
      ballotConfig.passportServerUrl && ballotConfig.voterGroupId
        ? rootHash &&
          (ballotConfig.makeHistoricalGroupUrl
            ? ballotConfig.makeHistoricalGroupUrl(rootHash)
            : getHistoricGroupUrl(
                semaphoreGroupId,
                rootHash,
                semaphoreGroupServer
              ))
        : undefined
  };
}
