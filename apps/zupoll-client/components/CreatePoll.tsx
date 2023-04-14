import {
  requestZuzaluMembershipUrl,
  usePassportResponse,
  useSemaphorePassportProof,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-signature-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { FormEventHandler, useEffect, useState } from "react";
import { createPoll } from "../src/api";
import {
  CreatePollRequest,
  PollSignal,
  PollType,
  UserType,
} from "../src/types";
import {
  PASSPORT_URL,
  requestProofFromPassport,
  SEMAPHORE_GROUP_URL,
} from "../src/util";
import { ConfessionsError } from "./shared/ErrorOverlay";

export function CreatePoll({
  onCreated,
  onError,
}: {
  onCreated: (newPoll: string) => void;
  onError: (err: ConfessionsError) => void;
}) {
  const [pollSubmit, setPollSubmit] = useState<boolean>(false);
  const [pollBody, setPollBody] = useState<string>("");
  const [pollOptions, setPollOptions] = useState<Array<string>>([]);
  const [pollExpiry, setPollExpiry] = useState<Date>(new Date());

  const [pcdStr] = usePassportResponse();
  const {
    proof,
    valid,
    error: proofError,
  } = useSemaphorePassportProof(SEMAPHORE_GROUP_URL, pcdStr);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setPollSubmit(true);

    const signal: PollSignal = {
      pollType: PollType.REFERENDUM,
      body: pollBody,
      expiry: pollExpiry,
      options: pollOptions,
      voterSemaphoreGroupUrls: [SEMAPHORE_GROUP_URL],
    };
    const signalHash = sha256(stableStringify(signal));
    const sigHashEnc = generateMessageHash(signalHash).toString();

    const proofUrl = requestZuzaluMembershipUrl(
      PASSPORT_URL,
      window.location.origin + "/popup",
      SEMAPHORE_GROUP_URL,
      sigHashEnc,
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
        title: "Create poll failed",
        message: "There's an error in generating proof.",
      } as ConfessionsError;
      onError(err);
      return;
    }

    if (!valid) {
      const err = {
        title: "Create poll failed",
        message: "Proof is invalid.",
      } as ConfessionsError;
      onError(err);
      return;
    }

    const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));
    const request: CreatePollRequest = {
      pollsterType: UserType.ANON,
      pollsterSemaphoreGroupUrl: SEMAPHORE_GROUP_URL,
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
        } as ConfessionsError;
        onError(err);
        return;
      }
      onCreated(pollBody);
      setPollSubmit(false);
      setPollBody("");
      setPollOptions([]);
      setPollExpiry(new Date());
    }

    doRequest();
  }, [
    pcdStr,
    valid,
    proofError,
    onCreated,
    pollBody,
    pollExpiry,
    pollOptions,
    pollSubmit,
    onError,
  ]);

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
