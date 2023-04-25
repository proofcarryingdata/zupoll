import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-group-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { useCallback, useEffect, useRef } from "react";
import { voteBallot } from "./api";
import { UserType, Vote } from "./prismaTypes";
import {
  MultiVoteRequest,
  MultiVoteSignal,
  PollWithCounts,
  VoteSignal,
} from "./requestTypes";
import { PCDState, ZupollError } from "./types";
import { PASSPORT_URL } from "./util";

/**
 * Hook that handles requesting a PCD for voting on a set of polls on a ballot.
 *
 * @param ballot Ballot that is being voted on
 * @param polls Polls in this ballot
 * @param pollToVote Map of pollId to voteIdx
 * @param onError Error handler to display in ErrorOverlay
 * @param setServerLoading Passing server loading status to frontend
 * @param refresh Refresh ballot page after voting
 */
export function useBallotVoting({
  ballotId,
  ballotURL,
  ballotVoterSemaphoreGroupUrl,
  polls,
  pollToVote,
  onError,
  setServerLoading,
  refresh,
}: {
  ballotId: string;
  ballotURL: string;
  ballotVoterSemaphoreGroupUrl: string;
  polls: PollWithCounts[];
  pollToVote: Map<string, number | undefined>;
  onError: (err: ZupollError) => void;
  setServerLoading: (loading: boolean) => void;
  refresh: (id: string) => void;
}) {
  const pcdState = useRef<PCDState>(PCDState.DEFAULT);
  const [pcdStr, _passportPendingPCDStr] = usePassportPopupMessages();

  // only accept pcdStr if we were expecting one
  useEffect(() => {
    if (pcdState.current === PCDState.AWAITING_PCDSTR) {
      pcdState.current = PCDState.RECEIVED_PCDSTR;
    }
  }, [pcdStr]);

  // process pcdStr and send request
  useEffect(() => {
    if (pcdState.current !== PCDState.RECEIVED_PCDSTR) return;
    pcdState.current = PCDState.DEFAULT;

    // Format MultiVoteRequest properly
    const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));
    const request: MultiVoteRequest = {
      votes: [],
      ballotURL: ballotURL,
      voterSemaphoreGroupUrl: ballotVoterSemaphoreGroupUrl,
      proof: parsedPcd.pcd,
    };
    polls.forEach((poll: PollWithCounts) => {
      const voteIdx = pollToVote.get(poll.id);
      if (voteIdx !== undefined) {
        const vote: Vote = {
          id: "",
          pollId: poll.id,
          voterType: UserType.ANON,
          voterNullifier: "",
          voterSemaphoreGroupUrl: ballotVoterSemaphoreGroupUrl,
          voterName: null,
          voterUuid: null,
          voterCommitment: null,
          voteIdx: voteIdx,
          proof: parsedPcd.pcd,
        };
        request.votes.push(vote);
      }
    });

    async function doRequest() {
      setServerLoading(true);
      const res = await voteBallot(request);
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

      await res.json();
      const newVoted = getVoted();
      newVoted.push(ballotId);
      setVoted(newVoted);
      refresh(ballotId);
    }

    doRequest();
  }, [
    pcdStr,
    ballotId,
    ballotURL,
    ballotVoterSemaphoreGroupUrl,
    onError,
    pollToVote,
    polls,
    setServerLoading,
    refresh,
  ]);

  const createBallotVotePCD = useCallback(async () => {
    pcdState.current = PCDState.AWAITING_PCDSTR;

    const multiVoteSignal: MultiVoteSignal = {
      voteSignals: [],
    };

    polls.forEach((poll: PollWithCounts) => {
      const voteIdx = pollToVote.get(poll.id);
      if (voteIdx !== undefined) {
        const voteSignal: VoteSignal = {
          pollId: poll.id,
          voteIdx: voteIdx,
        };
        multiVoteSignal.voteSignals.push(voteSignal);
      }
    });
    const signalHash = sha256(stableStringify(multiVoteSignal));
    const sigHashEnc = generateMessageHash(signalHash).toString();
    const externalNullifier = generateMessageHash(ballotId).toString();

    openZuzaluMembershipPopup(
      PASSPORT_URL,
      window.location.origin + "/popup",
      ballotVoterSemaphoreGroupUrl,
      "zupoll",
      sigHashEnc,
      externalNullifier
    );
  }, [ballotId, ballotVoterSemaphoreGroupUrl, polls, pollToVote]);

  return createBallotVotePCD;
}

export function votedOn(ballotId: string): boolean {
  return getVoted().includes(ballotId);
}

export function getVoted(): Array<string> {
  const voted: Array<string> = JSON.parse(
    window.localStorage.getItem("voted") || "[]"
  );
  return voted;
}

export function setVoted(voted: Array<string>) {
  window.localStorage.setItem("voted", JSON.stringify(voted));
}
