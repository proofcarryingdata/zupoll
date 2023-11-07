import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { createBallot } from "../../src/api";
import { useCreateBallot } from "../../src/createBallot";
import { BallotType, Poll, UserType } from "../../src/prismaTypes";
import { BallotSignal, CreateBallotRequest } from "../../src/requestTypes";
import {
  BallotConfig,
  LoginConfigurationName,
  LoginState,
  ZupollError,
} from "../../src/types";
import { useHistoricSemaphoreUrl } from "../../src/useHistoricSemaphoreUrl";
import {
  FormButtonContainer,
  FormContainer,
  OptionContainer,
  OptionInput,
  OptionsLabel,
  StyledForm,
  StyledInput,
  StyledLabel,
  StyledSelect,
} from "../core/Form";
import { RippleLoaderLight } from "../core/RippleLoader";
import { USE_CREATE_BALLOT_REDIRECT } from "../../src/util";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { Button } from "../core/Button";

interface BallotFromUrl {
  ballotConfig: BallotConfig;
  ballotSignal: BallotSignal;
  polls: Poll[];
}

export function CreateBallot({
  onError,
  loginState,
}: {
  onError: (err: ZupollError) => void;
  loginState: LoginState;
}) {
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "0",
      body: "",
      options: [""],
      ballotURL: 0,
      createdAt: new Date(),
      expiry: new Date(),
    },
  ]);
  const router = useRouter();
  const [ballotTitle, setBallotTitle] = useState("");
  const [ballotDescription, setBallotDescription] = useState("");
  const [ballotExpiry, setBallotExpiry] = useState<Date>(
    new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
  );
  const [ballotFromUrl, setBallotFromUrl] = useState<BallotFromUrl>();
  const [ballotConfig, setBallotConfig] = useState<BallotConfig>();

  const [myPcdStr, setMyPcdStr] = useState("");

  const [ballotType, setBallotType] = useState<BallotType>(
    loginState.config.name === LoginConfigurationName.PCDPASS_USER
      ? BallotType.PCDPASSUSER
      : BallotType.STRAWPOLL
  );
  const [useLastBallot, setUseLastBallot] = useState(false);

  const getDateString = (date: Date) => {
    const newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return newDate.toISOString().slice(0, 16);
  };

  const updatePollBody = (pollBody: string, index: number) => {
    const newPolls = [...polls];
    newPolls[index].body = pollBody;
    setPolls(newPolls);
  };

  const updatePollOptions = (
    newOption: string,
    pollIndex: number,
    optionIndex: number
  ) => {
    const newPolls = [...polls];
    newPolls[pollIndex].options[optionIndex] = newOption;
    setPolls(newPolls);
  };

  /**
   * CREATING BALLOT LOGIC
   */

  const [serverLoading, setServerLoading] = useState(false);

  const { loadingVoterGroupUrl, createBallotPCD } = useCreateBallot({
    ballotTitle,
    ballotDescription,
    ballotType,
    expiry: ballotExpiry,
    polls,
    onError,
    setServerLoading,
    loginState,
    url: window.location.href, // If exists, will use redirect instead of pop up
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    console.log({ url });
    // Use URLSearchParams to get the proof query parameter
    const proofString = url.searchParams.get("proof");
    const ballotString = url.searchParams.get("ballot");
    if (proofString && ballotString) {
      // Decode the URL-encoded string
      const decodedProofString = decodeURIComponent(proofString);
      // Parse the decoded string into an object
      const proofObject = JSON.parse(decodedProofString);
      console.log(`proof object`, proofObject);
      const pcdStr = JSON.stringify(proofObject);

      const ballot = JSON.parse(
        decodeURIComponent(ballotString)
      ) as BallotFromUrl;
      console.log(`[RECEIVED BALLOT]`, ballot);
      setMyPcdStr(pcdStr);
      setBallotFromUrl(ballot);
      setBallotConfig(ballot.ballotConfig);
    }
    // uwu
  }, []);

  const { rootHash: voterGroupRootHash, groupUrl: voterGroupUrl } =
    useHistoricSemaphoreUrl(
      ballotConfig?.passportServerUrl,
      ballotConfig?.voterGroupId,
      onError
    );

  useEffect(() => {
    if (useLastBallot) {
      const ballotSignalString = localStorage.getItem("lastBallotSignal");
      const ballotPollsString = localStorage.getItem("lastBallotPolls");

      if (ballotSignalString && ballotPollsString) {
        const ballotSignal = JSON.parse(ballotSignalString) as BallotSignal;
        console.log({ ballotSignal });
        setBallotTitle(ballotSignal.ballotTitle);
        setBallotDescription(ballotSignal.ballotDescription);
        setBallotExpiry(new Date(ballotSignal.expiry));

        const ballotPolls = JSON.parse(ballotPollsString) as Poll[];
        console.log({ ballotPolls });
        setPolls(ballotPolls);
      }
    }
  }, [useLastBallot]);

  useEffect(() => {
    async function doRequest() {
      if (!voterGroupRootHash || !voterGroupUrl)
        return console.warn(`NO GROUP URL OR HASH`);
      if (!ballotFromUrl) return console.warn(`NO BALLOT FROM URL`);
      console.log(`DOING CREATE REQ`);
      const { ballotSignal, ballotConfig, polls } = ballotFromUrl;

      const parsedPcd = JSON.parse(decodeURIComponent(myPcdStr));
      const finalRequest: CreateBallotRequest = {
        ballot: {
          ballotId: "",
          ballotURL: 0,
          ballotTitle: ballotSignal.ballotTitle,
          ballotDescription: ballotSignal.ballotDescription,
          createdAt: new Date(),
          expiry: new Date(ballotSignal.expiry),
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
          ballotType: ballotSignal.ballotType,
        },
        polls: polls,
        proof: parsedPcd.pcd,
      };
      const ballotSignalString = localStorage.getItem("lastBallotSignal");
      if (ballotSignalString) {
        console.log(`PREV BALLOT SIGNAL`, JSON.parse(ballotSignalString));
        console.log(`CURR BALLOT SIGNAL`, ballotSignal);
      }
      const signalHash = sha256(stableStringify(ballotSignal));
      const lastBallotSignalHash = localStorage.getItem("lastBallotSignalHash");
      if (signalHash !== lastBallotSignalHash)
        throw new Error(`Signal hashes did not match`);
      setServerLoading(true);
      const res = await createBallot(finalRequest, loginState.token);
      console.log(`res`, res);
      router.push("/");
      setServerLoading(false);
    }

    doRequest();
  }, [
    voterGroupRootHash,
    voterGroupUrl,
    loginState,
    ballotConfig,
    ballotFromUrl,
    router,
    myPcdStr,
  ]);

  return (
    <>
      <Button onClick={() => setUseLastBallot(true)}>
        Autofill from previous ballot
      </Button>
      {USE_CREATE_BALLOT_REDIRECT ? (
        ""
      ) : (
        <p style={{ color: "white" }}>
          Can only create polls in the browser, not Telegram
        </p>
      )}
      <FormContainer>
        <StyledForm>
          <h2>Ballot Info</h2>
          <StyledLabel>
            Ballot title&nbsp;
            <StyledInput
              type="text"
              id="body"
              autoComplete="off"
              value={ballotTitle}
              onChange={(e) => setBallotTitle(e.target.value)}
              placeholder="Advisory Vote 04/25"
            />
          </StyledLabel>
          <StyledLabel>
            Ballot description &nbsp;
            <StyledInput
              type="text"
              autoComplete="off"
              id="options"
              value={ballotDescription}
              onChange={(e) => setBallotDescription(e.target.value)}
              placeholder="Advisory vote for 04/25 town hall"
            />
          </StyledLabel>
          <StyledLabel>
            Expiry&nbsp;
            <StyledInput
              type="datetime-local"
              autoComplete="off"
              id="expiry"
              value={getDateString(ballotExpiry)}
              onChange={(e) => setBallotExpiry(new Date(e.target.value))}
            />
          </StyledLabel>
          <StyledLabel>
            Type of ballot
            <StyledSelect
              id="ballotType"
              value={ballotType}
              onChange={(e) => setBallotType(e.target.value)}
            >
              {loginState.config.name ===
                LoginConfigurationName.ZUZALU_PARTICIPANT && (
                <>
                  <option value={BallotType.STRAWPOLL}>Straw Poll</option>
                </>
              )}
              {loginState.config.name ===
                LoginConfigurationName.ZUZALU_ORGANIZER && (
                <>
                  <option value={BallotType.STRAWPOLL}>Straw Poll</option>
                  <option value={BallotType.ADVISORYVOTE}>Advisory Vote</option>
                  <option value={BallotType.ORGANIZERONLY}>
                    Organizer Only
                  </option>
                </>
              )}
              {loginState.config.name ===
                LoginConfigurationName.PCDPASS_USER && (
                <option value={BallotType.PCDPASSUSER}>PCDPass Poll</option>
              )}
            </StyledSelect>
          </StyledLabel>
        </StyledForm>
      </FormContainer>
      {polls.map((poll, i) => {
        return (
          <FormContainer key={i}>
            <StyledForm>
              <h2>Question {i + 1}</h2>
              <StyledLabel>
                Question&nbsp;
                <StyledInput
                  type="text"
                  id="body"
                  autoComplete="off"
                  value={poll.body}
                  onChange={(e) => updatePollBody(e.target.value, i)}
                  placeholder="Should we do this?"
                />
              </StyledLabel>
              <OptionsLabel>
                <div>Options &nbsp;</div>
                <OptionContainer>
                  {poll.options.map((option, j) => (
                    <OptionInput
                      key={j}
                      type="text"
                      autoComplete="off"
                      id="options"
                      value={option}
                      onChange={(e) => updatePollOptions(e.target.value, i, j)}
                      placeholder="Option text"
                    />
                  ))}
                  <FormButtonContainer>
                    <WideButton
                      onClick={() => {
                        const newPolls = [...polls];
                        newPolls[i].options.push("");
                        setPolls(newPolls);
                      }}
                    >
                      +
                    </WideButton>
                    <WideButton
                      onClick={() => {
                        const newPolls = [...polls];
                        if (newPolls[i].options.length !== 1) {
                          newPolls[i].options.pop();
                          setPolls(newPolls);
                        }
                      }}
                    >
                      -
                    </WideButton>
                  </FormButtonContainer>
                </OptionContainer>
              </OptionsLabel>
            </StyledForm>
          </FormContainer>
        );
      })}
      <QuestionContainer>
        <QuestionChangeButton
          onClick={() =>
            setPolls([
              ...polls,
              {
                id: polls.length.toString(),
                body: "",
                options: [""],
                ballotURL: 0,
                createdAt: new Date(),
                expiry: new Date(),
              },
            ])
          }
        >
          Add question
        </QuestionChangeButton>

        <QuestionChangeButton
          onClick={() => {
            if (polls.length !== 0) {
              const newPolls = [...polls];
              newPolls.pop();
              setPolls(newPolls);
            }
          }}
        >
          Remove question
        </QuestionChangeButton>
      </QuestionContainer>
      {loadingVoterGroupUrl || serverLoading ? (
        <RippleLoaderLight />
      ) : (
        <SubmitButton
          disabled={
            ballotTitle === "" ||
            polls.length === 0 ||
            polls.some((poll) => poll.body === "" || poll.options.length < 2)
          }
          onClick={createBallotPCD}
        >
          <h3>Create ballot</h3>
        </SubmitButton>
      )}
    </>
  );
}

const SubmitButton = styled.button`
  font-family: OpenSans;
  background: #52b5a4;
  width: 100%;
  border-radius: 1rem;
  border: none;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
  text-align: center;
  cursor: pointer;
  color: rgb(28, 41, 40);

  &:hover {
    background-color: #449c8d;
  }

  &:active {
    background-color: #378073;
  }
`;

const WideButton = styled.button`
  width: calc(50% - 0.5rem);
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #888;
  opacity: 1;
  cursor: pointer;
  text-align: center;
  color: black;

  font-family: OpenSans;
  background-color: #fff;

  &:hover {
    background-color: #d8d8d8;
  }

  &:active {
    background-color: #c3c3c3;
  }
`;

const QuestionContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const QuestionChangeButton = styled.button`
  width: calc(50% - 0.5rem);
  padding: 0.5rem;
  border: none;
  margin-bottom: 1.5rem;
  border-radius: 0.5rem;
  opacity: 1;
  cursor: pointer;
  text-align: center;
  color: black;

  font-family: OpenSans;
  background-color: #fff;

  &:hover {
    background-color: #d8d8d8;
  }

  &:active {
    background-color: #c3c3c3;
  }
`;
