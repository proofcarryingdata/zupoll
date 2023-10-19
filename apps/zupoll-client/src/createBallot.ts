import {
  openGroupMembershipPopup,
  useZupassPopupMessages,
} from "@pcd/passport-interface";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { createBallot } from "./api";
import { BALLOT_CONFIGS } from "./ballotConfig";
import { BallotType, Poll, UserType } from "./prismaTypes";
import { BallotSignal, CreateBallotRequest, PollSignal } from "./requestTypes";
import { LoginState, PCDState, ZupollError } from "./types";
import { useHistoricSemaphoreUrl } from "./useHistoricSemaphoreUrl";
import { generateSnarkMessageHash } from "@pcd/util";

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
  loginState,
}: {
  ballotTitle: string;
  ballotDescription: string;
  ballotType: BallotType;
  expiry: Date;
  polls: Poll[];
  onError: (err: ZupollError) => void;
  setServerLoading: (loading: boolean) => void;
  loginState: LoginState;
}) {
  const router = useRouter();
  const pcdState = useRef<PCDState>(PCDState.DEFAULT);
  const [pcdStr, _passportPendingPCDStr] = useZupassPopupMessages();
  const ballotConfig = BALLOT_CONFIGS[ballotType];

  const {
    loading: loadingVoterGroupUrl,
    rootHash: voterGroupRootHash,
    groupUrl: voterGroupUrl,
  } = useHistoricSemaphoreUrl(
    ballotConfig.passportServerUrl,
    ballotConfig.voterGroupId,
    onError
  );

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
        pollsterSemaphoreGroupUrl: ballotConfig.creatorGroupUrl,
        voterSemaphoreGroupUrls: [voterGroupUrl],
        voterSemaphoreGroupRoots: [voterGroupRootHash],
        ballotType: ballotType,
      },
      polls: polls,
      proof: parsedPcd.pcd,
    };

    async function doRequest() {
      setServerLoading(true);
      const res = await createBallot(finalRequest, loginState.token);
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
    ballotConfig.creatorGroupUrl,
    loginState,
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
    const sigHashEnc = generateSnarkMessageHash(signalHash).toString();

    openGroupMembershipPopup(
      ballotConfig.passportAppUrl,
      window.location.origin + "/popup",
      ballotConfig.creatorGroupUrl,
      "zupoll",
      sigHashEnc,
      sigHashEnc
    );
  }, [
    voterGroupUrl,
    voterGroupRootHash,
    ballotTitle,
    ballotDescription,
    ballotType,
    expiry,
    polls,
    ballotConfig.passportAppUrl,
    ballotConfig.creatorGroupUrl,
    onError,
  ]);

  return { loadingVoterGroupUrl, createBallotPCD };
}
