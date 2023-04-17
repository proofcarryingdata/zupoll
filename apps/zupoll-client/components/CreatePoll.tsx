import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
  useSemaphoreGroupProof,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-signature-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { FormEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { createPoll } from "../src/api";
import {
  CreatePollRequest,
  PollSignal,
  PollType,
  UserType,
} from "../src/types";
import {
  PASSPORT_URL,
  SEMAPHORE_ADMIN_GROUP_URL,
  SEMAPHORE_GROUP_URL,
} from "../src/util";
import { ZupollError } from "./shared/ErrorOverlay";

enum CreateState {
  DEFAULT,
  REQUESTING,
  RECEIVED
}

export function CreatePoll({
  onCreated,
  onError,
}: {
  onCreated: (newPoll: string) => void;
  onError: (err: ZupollError) => void;
}) {
  const [createState, setCreateState] = useState<CreateState>(CreateState.DEFAULT);
  const [pollBody, setPollBody] = useState<string>("");
  const [pollOptions, setPollOptions] = useState<Array<string>>([]);
  const [pollExpiry, setPollExpiry] = useState<Date>(new Date());
  const [signalHashEnc, setSignalHashEnc] = useState<string>("");

  const [pcdStr, _passportPendingPCDStr] = usePassportPopupMessages();

  const onVerified = useCallback((valid: boolean) => {
    if (createState == CreateState.REQUESTING) {
      if (valid) {
        setCreateState(CreateState.RECEIVED);
      }
    }
  }, [createState]);

  const {
    proof,
    error: proofError,
  } = useSemaphoreGroupProof(
    pcdStr,
    SEMAPHORE_GROUP_URL,
    "zupoll",
    onVerified,
    signalHashEnc
  );

  useEffect(() => {
    if (createState != CreateState.RECEIVED) return;
    setCreateState(CreateState.DEFAULT);

    if (proofError) {
      console.error("error using semaphore passport proof: ", proofError);
      const err = {
        title: "Create poll failed",
        message: "There's an error in generating proof.",
      } as ZupollError;
      onError(err);
      return;
    }

    const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));
    const request: CreatePollRequest = {
      pollsterType: UserType.ANON,
      pollsterSemaphoreGroupUrl: SEMAPHORE_ADMIN_GROUP_URL,
      pollType: PollType.REFERENDUM,
      body: pollBody,
      expiry: pollExpiry,
      options: pollOptions,
      voterSemaphoreGroupUrls: [SEMAPHORE_GROUP_URL],
      proof: parsedPcd.pcd,
    };

    async function doRequest() {
      const res = await createPoll(request);
      if (!res.ok) {
        const resErr = await res.text();
        console.error("error posting confession to the server: ", resErr);
        const err = {
          title: "Publish confession failed",
          message: `Server Error: ${resErr}`,
        } as ZupollError;
        onError(err);
        return;
      }
      onCreated(pollBody);
      setPollBody("");
      setPollOptions([]);
      setPollExpiry(new Date());
    }

    doRequest();
  }, [pcdStr, onCreated, onError, pollBody, pollExpiry, pollOptions, proofError, createState]);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    const signal: PollSignal = {
      pollType: PollType.REFERENDUM,
      body: pollBody,
      expiry: pollExpiry,
      options: pollOptions,
      voterSemaphoreGroupUrls: [SEMAPHORE_GROUP_URL],
    };
    const signalHash = sha256(stableStringify(signal));
    const sigHashEnc = generateMessageHash(signalHash).toString();
    setSignalHashEnc(sigHashEnc);

    openZuzaluMembershipPopup(
      PASSPORT_URL,
      window.location.origin + "/popup",
      SEMAPHORE_GROUP_URL,
      "zupoll",
      sigHashEnc,
      sigHashEnc
    );
    setCreateState(CreateState.REQUESTING);
  };

  function getDateString(date: Date) {
    const newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return newDate.toISOString().slice(0, 16);
  }

  return (
    <>
      <h2>Create Poll</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="body">Question</label>&nbsp;
        <input
          type="text"
          id="body"
          value={pollBody}
          onChange={(e) => setPollBody(e.target.value)}
          required
        />
        <br />
        <br />
        <label htmlFor="options">Options (comma-seperated)</label>&nbsp;
        <input
          type="text"
          id="options"
          value={pollOptions.join(",")}
          onChange={(e) => setPollOptions(e.target.value.split(","))}
          required
        />
        <br />
        <br />
        <label htmlFor="expiry">Expiry</label>&nbsp;
        <input
          type="datetime-local"
          id="expiry"
          value={getDateString(pollExpiry)}
          onChange={(e) => setPollExpiry(new Date(e.target.value))}
          required
        />
        <br />
        <br />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
