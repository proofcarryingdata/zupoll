import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-signature-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import { doVote } from "../src/api";
import { UserType, VoteRequest, VoteSignal } from "../src/types";
import { PASSPORT_URL, SEMAPHORE_GROUP_URL } from "../src/util";
import { Poll } from "./Poll";
import { ZupollError } from "./shared/ErrorOverlay";

enum VoteFormState {
  DEFAULT,
  AWAITING_PCDSTR,
  RECEIVED_PCDSTR,
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
  const votingState = useRef<VoteFormState>(VoteFormState.DEFAULT);
  const [option, setOption] = useState<string>("-1");
  const [pcdStr, _passportPendingPCDStr] = usePassportPopupMessages();

  useEffect(() => {
    if (votingState.current === VoteFormState.AWAITING_PCDSTR) {
      votingState.current = VoteFormState.RECEIVED_PCDSTR;
    }
  }, [pcdStr]);

  useEffect(() => {
    if (votingState.current !== VoteFormState.RECEIVED_PCDSTR) return;
    if (option === "-1" || getVoted().includes(poll.id)) return;

    votingState.current = VoteFormState.DEFAULT;

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
  }, [pcdStr, onError, onVoted, poll, option]);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    votingState.current = VoteFormState.AWAITING_PCDSTR;

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
