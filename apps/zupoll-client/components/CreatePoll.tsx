import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-signature-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import styled from "styled-components";
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

enum CreatePollState {
  DEFAULT,
  AWAITING_PCDSTR,
  RECEIVED_PCDSTR,
}

export function CreatePoll({
  onCreated,
  onError,
}: {
  onCreated: (newPoll: string) => void;
  onError: (err: ZupollError) => void;
}) {
  const createState = useRef<CreatePollState>(CreatePollState.DEFAULT);
  const [pollBody, setPollBody] = useState<string>("");
  const [pollOptions, setPollOptions] = useState<Array<string>>([]);
  const [pollExpiry, setPollExpiry] = useState<Date>(new Date());

  const [pcdStr, _passportPendingPCDStr] = usePassportPopupMessages();

  useEffect(() => {
    if (createState.current === CreatePollState.AWAITING_PCDSTR) {
      createState.current = CreatePollState.RECEIVED_PCDSTR;
    }
  }, [pcdStr]);

  useEffect(() => {
    if (createState.current !== CreatePollState.RECEIVED_PCDSTR) return;
    createState.current = CreatePollState.DEFAULT;

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
  }, [pcdStr, onCreated, onError, pollBody, pollExpiry, pollOptions]);

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    createState.current = CreatePollState.AWAITING_PCDSTR;

    const signal: PollSignal = {
      pollType: PollType.REFERENDUM,
      body: pollBody,
      expiry: pollExpiry,
      options: pollOptions,
      voterSemaphoreGroupUrls: [SEMAPHORE_GROUP_URL],
    };
    const signalHash = sha256(stableStringify(signal));
    const sigHashEnc = generateMessageHash(signalHash).toString();

    openZuzaluMembershipPopup(
      PASSPORT_URL,
      window.location.origin + "/popup",
      SEMAPHORE_ADMIN_GROUP_URL,
      "zupoll",
      sigHashEnc,
      sigHashEnc
    );
  };

  function getDateString(date: Date) {
    const newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return newDate.toISOString().slice(0, 16);
  }

  return (
    <StyledDiv>
      <h2>Create Poll</h2>
      <StyledForm onSubmit={handleSubmit}>
        <StyledLabel htmlFor="body">
          Question&nbsp;
          <StyledInput
            type="text"
            id="body"
            value={pollBody}
            onChange={(e) => setPollBody(e.target.value)}
            required
          />
        </StyledLabel>
        <StyledLabel htmlFor="options">
          Options (comma-seperated)&nbsp;
          <StyledInput
            type="text"
            id="options"
            value={pollOptions.join(",")}
            onChange={(e) => setPollOptions(e.target.value.split(","))}
            required
          />
        </StyledLabel>
        <StyledLabel htmlFor="expiry">
          Expiry&nbsp;
          <StyledInput
            type="datetime-local"
            id="expiry"
            value={getDateString(pollExpiry)}
            onChange={(e) => setPollExpiry(new Date(e.target.value))}
            required
          />
        </StyledLabel>
        <StyledButton type="submit">Submit</StyledButton>
      </StyledForm>
    </StyledDiv>
  );
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledInput = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: none;
  margin-left: 5px;
`;

const StyledLabel = styled.label`
  margin-bottom: 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const StyledButton = styled.button`
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #1c2928;
  color: white;
  font-weight: bold;
`;

const StyledDiv = styled.div`
  background-color: #fcd270;
  padding: 20px;
  border-radius: 10px;
  font-family: system-ui, sans-serif;
  width: calc(100% - 40px);
  margin: 10px;
  padding: 20px;
`;
