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
import { Button } from "./core/Button";
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
  const [pollExpiry, setPollExpiry] = useState<Date>(
    new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
  );

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
        console.error("error posting post to the server: ", resErr);
        const err = {
          title: "Create poll failed",
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
    <Container>
      {/* <Header>Admin Create Poll</Header> */}
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
        <SubmitRow>
          <Button type="submit">Create Poll</Button>
        </SubmitRow>
      </StyledForm>
    </Container>
  );
}

const SubmitRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledInput = styled.input`
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 5px;
  border: none;
  border: 1px solid #555;
  width: 50%;
`;

const StyledLabel = styled.label`
  margin-bottom: 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: right;
`;

const Container = styled.div`
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
  border: 1px solid #bbb;
  background-color: #fcfcfc;
  border-radius: 4px;
  width: 110%;
  margin: 10px;
  padding: 16px;
  margin-bottom: 32px;
`;

const Header = styled.div`
  width: 100%;
  margin-bottom: 16px;
  margin-top: 8px;
  font-size: 1.5em;
`;
