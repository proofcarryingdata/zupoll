import {
  openZuzaluMembershipPopup,
  usePassportPopupMessages,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-signature-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { createPoll } from "../../src/api";
import {
  CreatePollRequest,
  PollSignal,
  PollType,
  UserType,
} from "../../src/types";
import {
  PASSPORT_URL,
  SEMAPHORE_ADMIN_GROUP_URL,
  SEMAPHORE_GROUP_URL,
} from "../../src/util";
import { Button } from "../core/Button";
import { RippleLoader } from "../core/RippleLoader";
import { ZupollError } from "../../src/types";

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
  const [loading, setLoading] = useState<boolean>(false);

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
      setLoading(true);
      const res = await createPoll(request);
      setLoading(false);

      if (res === undefined) {
        const serverDownError = {
          title: "Creating poll failed",
          message: "Server is down. Contact passport@0xparc.org."
        } as ZupollError;
        onError(serverDownError);
        return;
      }

      if (!res.ok) {
        const resErr = await res.text();
        console.error("error posting post to the server: ", resErr);
        const err = {
          title: "Create poll failed",
          message: `Server error: ${resErr}`,
        } as ZupollError;
        onError(err);
        return;
      }

      onCreated(pollBody);
      setPollBody("");
      setPollOptions([]);
      setPollExpiry(new Date(new Date().getTime() + 1000 * 60 * 60 * 24));
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
      <StyledForm onSubmit={handleSubmit}>
        <StyledLabel htmlFor="body">
          Question&nbsp;
          <StyledInput
            type="text"
            id="body"
            autoComplete="off"
            value={pollBody}
            onChange={(e) => setPollBody(e.target.value)}
            required
            placeholder="Should we do this?"
          />
        </StyledLabel>
        <StyledLabel htmlFor="options">
          Options &nbsp;
          <StyledInput
            type="text"
            autoComplete="off"
            id="options"
            value={pollOptions.join(",")}
            onChange={(e) => setPollOptions(e.target.value.split(","))}
            required
            placeholder="yes,no,maybe"
          />
        </StyledLabel>
        <StyledLabel htmlFor="expiry">
          Expiry&nbsp;
          <StyledInput
            type="datetime-local"
            autoComplete="off"
            id="expiry"
            value={getDateString(pollExpiry)}
            onChange={(e) => setPollExpiry(new Date(e.target.value))}
            required
          />
        </StyledLabel>
        <SubmitRow>
          {loading ? (
            <RippleLoader />
          ) : (
            <Button type="submit">Create Poll</Button>
          )}
        </SubmitRow>
      </StyledForm>
    </Container>
  );
}

const Container = styled.div`
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
  border: 1px solid #bbb;
  background-color: #fcfcfc;
  border-radius: 1rem;
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
`;

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
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  border: 1px solid #555;
  width: 50%;
`;

const StyledLabel = styled.label`
  margin-bottom: 0.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: right;
`;
