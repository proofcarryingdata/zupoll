import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-group-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { createBallot } from "./api";
import { BallotType, Poll, UserType } from "./prismaTypes";
import { BallotSignal, CreateBallotRequest, PollSignal } from "./requestTypes";
import { PCDState, ZupollError } from "./types";
import { useHistoricSemaphoreUrl } from "./useHistoricSemaphoreUrl";
import {
  PARTICIPANTS_GROUP_ID,
  PASSPORT_URL,
  SEMAPHORE_ADMIN_GROUP_URL,
  SEMAPHORE_GROUP_URL,
} from "./util";

/**
 * Hook that handles requesting a PCD for creating a ballot.
 *
 * @param ballotTitle title of ballot
 * @param ballotDescription description of ballot
 * @param ballotType type of ballot
 * @param expiry expiry date of ballot
 * @param polls polls in this ballot
 * @param onError Error handler to display in ErrorOverlay
 * @param setServerLoading Passing server loading status to frontend
 */
export function useCreateBallot({
  ballotTitle,
  ballotDescription,
  ballotType,
  expiry,
  polls,
  onError,
  setServerLoading,
}: {
  ballotTitle: string;
  ballotDescription: string;
  ballotType: BallotType;
  expiry: Date;
  polls: Poll[];
  onError: (err: ZupollError) => void;
  setServerLoading: (loading: boolean) => void;
}) {
  const router = useRouter();
  const pcdState = useRef<PCDState>(PCDState.DEFAULT);
  const [pcdStr, _passportPendingPCDStr] = usePassportPopupMessages();
  const {
    loading: loadingVoterGroupUrl,
    rootHash: voterGroupRootHash,
    groupUrl: voterGroupUrl,
  } = useHistoricSemaphoreUrl(PARTICIPANTS_GROUP_ID, onError);

  // only accept pcdStr if we were expecting one
  useEffect(() => {
    if (pcdState.current === PCDState.AWAITING_PCDSTR) {
      pcdState.current = PCDState.RECEIVED_PCDSTR;
    }
  }, [pcdStr]);

  // process pcdStr
  useEffect(() => {
    if (pcdState.current !== PCDState.RECEIVED_PCDSTR) return;
    if (voterGroupUrl == null || voterGroupRootHash == null) return;

    pcdState.current = PCDState.DEFAULT;

    const groupUrl =
      ballotType === BallotType.STRAWPOLL
        ? SEMAPHORE_GROUP_URL
        : SEMAPHORE_ADMIN_GROUP_URL;

    const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));
    const finalRequest: CreateBallotRequest = {
      ballot: {
        ballotId: "",
        ballotURL: 0,
        ballotTitle: ballotTitle,
        ballotDescription: ballotDescription,
        createdAt: new Date(),
        expiry: expiry,
        proof: parsedPcd.pcd,
        pollsterType: UserType.ANON,
        pollsterNullifier: "",
        pollsterName: null,
        pollsterUuid: null,
        pollsterCommitment: null,
        expiryNotif: null,
        pollsterSemaphoreGroupUrl: groupUrl,
        voterSemaphoreGroupUrls: [voterGroupUrl],
        voterSemaphoreGroupRoots: [voterGroupRootHash],
        ballotType: ballotType,
      },
      polls: polls,
      proof: parsedPcd.pcd,
    };

    async function doRequest() {
      setServerLoading(true);
      const res = await createBallot(finalRequest);
      setServerLoading(false);

      if (res === undefined) {
        const serverDownError: ZupollError = {
          title: "Voting failed",
          message: "Server is down. Contact passport@0xparc.org.",
        };
        onError(serverDownError);
        return;
      }

      if (!res.ok) {
        const resErr = await res.text();
        console.error("error posting vote to the server: ", resErr);
        const err: ZupollError = {
          title: "Voting failed",
          message: `Server Error: ${resErr}`,
        };
        onError(err);
        return;
      }

      router.push("/");
    }

    doRequest();
  }, [
    ballotDescription,
    ballotTitle,
    ballotType,
    expiry,
    onError,
    pcdStr,
    polls,
    router,
    setServerLoading,
    voterGroupRootHash,
    voterGroupUrl,
  ]);

  // ran after ballot is submitted by user
  const createBallotPCD = useCallback(async () => {
    if (voterGroupUrl == null || voterGroupRootHash == null) {
      return onError({
        title: "Error Creating Poll",
        message: "Voter group not loaded yet.",
      });
    }

    pcdState.current = PCDState.AWAITING_PCDSTR;

    const ballotSignal: BallotSignal = {
      pollSignals: [],
      ballotTitle: ballotTitle,
      ballotDescription: ballotDescription,
      ballotType: ballotType,
      expiry: expiry,
      voterSemaphoreGroupUrls: [voterGroupUrl],
      voterSemaphoreGroupRoots: [voterGroupRootHash],
    };
    polls.forEach((poll: Poll) => {
      const pollSignal: PollSignal = {
        body: poll.body,
        options: poll.options,
      };
      ballotSignal.pollSignals.push(pollSignal);
    });
    const signalHash = sha256(stableStringify(ballotSignal));
    console.log(stableStringify(ballotSignal));
    console.log(signalHash);
    const sigHashEnc = generateMessageHash(signalHash).toString();

    const groupUrl =
      ballotType === BallotType.STRAWPOLL
        ? SEMAPHORE_GROUP_URL
        : SEMAPHORE_ADMIN_GROUP_URL;

    openZuzaluMembershipPopup(
      PASSPORT_URL,
      window.location.origin + "/popup",
      groupUrl,
      "zupoll",
      sigHashEnc,
      sigHashEnc
    );
  }, [
    ballotDescription,
    ballotTitle,
    ballotType,
    expiry,
    polls,
    onError,
    voterGroupUrl,
    voterGroupRootHash,
  ]);

  return { loadingVoterGroupUrl, createBallotPCD };
}
