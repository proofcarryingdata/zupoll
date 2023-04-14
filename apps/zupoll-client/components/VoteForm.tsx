import {
  requestZuzaluMembershipUrl,
  usePassportResponse,
  useSemaphorePassportProof,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-signature-pcd";
import { sha256 } from "js-sha256";
import { FormEventHandler, useEffect, useState } from "react";
import stableStringify from "json-stable-stringify";
import { doVote } from "../src/api";
import { UserType, VoteRequest, VoteSignal } from "../src/types";
import {
  PASSPORT_URL,
  requestProofFromPassport,
  SEMAPHORE_GROUP_URL,
} from "../src/util";
import { Poll } from "./Poll";
import { ConfessionsError } from "./shared/ErrorOverlay";

export function VoteForm({
  poll,
  onError,
  onVoted,
}: {
  poll: Poll;
  onError: (err: ConfessionsError) => void;
  onVoted: (id: string) => void;
}) {
  const [option, setOption] = useState<string>("-1");
  const [pollSubmit, setPollSubmit] = useState<boolean>(false);

  const [pcdStr] = usePassportResponse();
  const {
    proof,
    valid,
    error: proofError,
  } = useSemaphorePassportProof(SEMAPHORE_GROUP_URL, pcdStr);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setPollSubmit(true);

    const voteIdx = parseInt(option);
    if (!(voteIdx >= 0 && voteIdx < poll.options.length)) {
      const err = {
        title: "Voting failed",
        message: "Invalid option selected.",
      } as ConfessionsError;
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

    const proofUrl = requestZuzaluMembershipUrl(
      PASSPORT_URL,
      window.location.origin + "/popup",
      SEMAPHORE_GROUP_URL,
      externalNullifier,
      sigHashEnc,
      false
    );

    requestProofFromPassport(proofUrl, () => undefined);
  };

  useEffect(() => {
    if (!pollSubmit) return;
    if (valid === undefined) return; // verifying

    if (proofError) {
      console.error("error using semaphore passport proof: ", proofError);
      const err = {
        title: "Voting failed",
        message: "There's an error in generating proof.",
      } as ConfessionsError;
      onError(err);
      return;
    }

    if (!valid) {
      const err = {
        title: "Voting failed",
        message: "Proof is invalid.",
      } as ConfessionsError;
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
        } as ConfessionsError;
        onError(err);
        return;
      }
      const newVote = await res.json();

      const newVoted = getVoted();
      newVoted.push(poll.id);
      setVoted(newVoted);
      setOption("-1");
      setPollSubmit(false);
      onVoted(newVote['id']);
    }

    doRequest();
  }, [option, pcdStr, onError, valid, poll, proofError, pollSubmit, onVoted]);

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
            <option key={idx} value={idx}>{opt}</option>
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