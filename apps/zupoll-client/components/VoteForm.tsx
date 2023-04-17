import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
  useSemaphoreGroupProof,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-signature-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { FormEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { doVote } from "../src/api";
import { UserType, VoteRequest, VoteSignal } from "../src/types";
import { PASSPORT_URL, SEMAPHORE_GROUP_URL } from "../src/util";
import { Poll } from "./Poll";
import { ZupollError } from "./shared/ErrorOverlay";

enum VoteState {
  DEFAULT,
  REQUESTING,
  RECEIVED
}

export function VoteForm({
  poll,
  onError,
  onVoted,
}: {
  poll: Poll;
  onError: (err: ZupollError) => void;
  onVoted: (id: string) => void;
}) {
  const [votingState, setVotingState] = useState<VoteState>(VoteState.DEFAULT);
  const [option, setOption] = useState<string>("-1");

  const [pcdStr, _passportPendingPCDStr] = usePassportPopupMessages();

  const onVerified = useCallback((valid: boolean) => {
    if (votingState == VoteState.REQUESTING) {
      if (valid) {
        setVotingState(VoteState.RECEIVED);
      }
    }
  }, [votingState]);

  const {
    proof,
    error: proofError,
  } = useSemaphoreGroupProof(
    pcdStr,
    SEMAPHORE_GROUP_URL,
    "zupoll",
    onVerified,
    generateMessageHash(poll.id).toString()
  );

  useEffect(() => {
    if (votingState != VoteState.RECEIVED) return;
    setVotingState(VoteState.DEFAULT);

    if (proofError) {
      console.error("error using semaphore passport proof: ", proofError);
      const err = {
        title: "Voting failed",
        message: "There's an error in generating proof.",
      } as ZupollError;
      onError(err);
      return;
    }

    const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));
    const request: VoteRequest = {
      pollId: poll.id,
      voterType: UserType.ANON,
      voterSemaphoreGroupUrl: SEMAPHORE_GROUP_URL,
      voteIdx: parseInt(option),
      proof: parsedPcd.pcd,
    };

    async function doRequest() {
      const res = await doVote(request);
      if (!res.ok) {
        const resErr = await res.text();
        console.error("error posting vote to the server: ", resErr);
        const err = {
          title: "Voting failed",
          message: `Server Error: ${resErr}`,
        } as ZupollError;
        onError(err);
        return;
      }
      const newVote = await res.json();

      const newVoted = getVoted();
      newVoted.push(poll.id);
      setVoted(newVoted);
      setOption("-1");
      onVoted(newVote["id"]);
    }

    doRequest();
  }, [pcdStr, onError, onVoted, poll, proofError, votingState, option]);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    const voteIdx = parseInt(option);
    if (!(voteIdx >= 0 && voteIdx < poll.options.length)) {
      const err = {
        title: "Voting failed",
        message: "Invalid option selected.",
      } as ZupollError;
      onError(err);
      return;
    }

    const signal: VoteSignal = {
      pollId: poll.id,
      voteIdx: voteIdx,
    };
    const signalHash = sha256(stableStringify(signal));
    const sigHashEnc = generateMessageHash(signalHash).toString();
    const externalNullifier = generateMessageHash(poll.id).toString();

    openZuzaluMembershipPopup(
      PASSPORT_URL,
      window.location.origin + "/popup",
      SEMAPHORE_GROUP_URL,
      "zupoll",
      sigHashEnc,
      externalNullifier
    );
    setVotingState(VoteState.REQUESTING);
  };

  if (getVoted().includes(poll.id)) return null;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="pollOptions">Vote Option:</label>&nbsp;&nbsp;
        <select
          value={option} // ...force the select's value to match the state variable...
          onChange={(e) => setOption(e.target.value)} // ... and update the state variable on any change!
          id="pollOptions"
        >
          <option key="-1" value="-1"></option>
          {poll.options.map((opt, idx) => (
            <option key={idx} value={idx}>
              {opt}
            </option>
          ))}
        </select>
        <br />
        <button type="submit">Vote</button>
      </form>
    </>
  );
}

function getVoted(): Array<string> {
  const voted: Array<string> = JSON.parse(
    window.localStorage.getItem("voted") || "[]"
  );
  return voted;
}

function setVoted(voted: Array<string>) {
  window.localStorage.setItem("voted", JSON.stringify(voted));
}
