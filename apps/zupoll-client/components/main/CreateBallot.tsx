import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { BallotFromUrl, useCreateBallot } from "../../src/createBallot";
import { BALLOT_TYPE_FROM_LOGIN_CONFIG } from "../../src/env";
import { BallotType, Poll } from "../../src/prismaTypes";
import { BallotSignal } from "../../src/requestTypes";
import {
  LoginConfigurationName,
  LoginState,
  ZupollError
} from "../../src/types";
import { USE_CREATE_BALLOT_REDIRECT } from "../../src/util";
import { Button } from "../core/Button";
import {
  FormButtonContainer,
  FormContainer,
  OptionContainer,
  OptionInput,
  OptionsLabel,
  StyledForm,
  StyledInput,
  StyledLabel,
  StyledSelect
} from "../core/Form";
import { RippleLoaderLight } from "../core/RippleLoader";

export function CreateBallot({
  onError,
  loginState
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
      expiry: new Date()
    }
  ]);
  const router = useRouter();
  const [ballotTitle, setBallotTitle] = useState("");
  const [ballotDescription, setBallotDescription] = useState("");
  const [ballotExpiry, setBallotExpiry] = useState<Date>(
    new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
  );
  const [ballotFromUrl, setBallotFromUrl] = useState<BallotFromUrl>();

  const [pcdFromUrl, setPcdFromUrl] = useState("");

  const [ballotType, setBallotType] = useState<BallotType>(
    BALLOT_TYPE_FROM_LOGIN_CONFIG[loginState.config.name]
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

  useEffect(() => {
    const url = new URL(window.location.href);
    console.log({ url });
    // Use URLSearchParams to get the proof query parameter
    const proofString = router.query.proof as string;
    const ballotString = router.query.ballot as string;
    if (proofString && ballotString) {
      // Decode the URL-encoded string
      const decodedProofString = decodeURIComponent(proofString);
      // Parse the decoded string into an object
      const proofObject = JSON.parse(decodedProofString);
      const pcdStr = JSON.stringify(proofObject);

      const ballot = JSON.parse(
        decodeURIComponent(ballotString)
      ) as BallotFromUrl;
      console.log(`[RECEIVED BALLOT]`, ballot);
      setPcdFromUrl(pcdStr);
      setBallotFromUrl(ballot);
    }
    // uwu
  }, [router.query.proof, router.query.ballot]);

  const { loadingVoterGroupUrl, createBallotPCD } = useCreateBallot({
    ballotTitle,
    ballotDescription,
    ballotType,
    expiry: ballotExpiry,
    polls,
    onError,
    setServerLoading,
    loginState,
    ballotFromUrl,
    pcdFromUrl,
    setBallotFromUrl,
    setPcdFromUrl,
    url: window.location.href // If exists, will use redirect instead of pop up
  });

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
                LoginConfigurationName.DEVCONNECT_PARTICIPANT && (
                <option value={BallotType.DEVCONNECT_STRAW}>
                  Devconnect Community Poll
                </option>
              )}
              {loginState.config.name ===
                LoginConfigurationName.DEVCONNECT_ORGANIZER && (
                <>
                  <option value={BallotType.DEVCONNECT_STRAW}>
                    Community Poll
                  </option>
                  <option value={BallotType.DEVCONNECT_ORGANIZER}>
                    Organizer Feedback
                  </option>
                </>
              )}
              {loginState.config.name ===
                LoginConfigurationName.EDGE_CITY_RESIDENT && (
                <>
                  <option value={BallotType.EDGE_CITY_RESIDENT}>
                    Edge City Community Poll
                  </option>
                </>
              )}
              {loginState.config.name ===
                LoginConfigurationName.EDGE_CITY_ORGANIZER && (
                <>
                  <option value={BallotType.EDGE_CITY_RESIDENT}>
                    Edge City Community Poll
                  </option>
                  <option value={BallotType.EDGE_CITY_ORGANIZER}>
                    Edge City Organizer Feedback
                  </option>
                </>
              )}
              {loginState.config.name ===
                LoginConfigurationName.ETH_LATAM_ATTENDEE && (
                <>
                  <option value={BallotType.ETH_LATAM_STRAWPOLL}>
                    ETH LatAm Straw Poll
                  </option>
                </>
              )}
              {loginState.config.name ===
                LoginConfigurationName.ETH_LATAM_ORGANIZER && (
                <>
                  <option value={BallotType.ETH_LATAM_STRAWPOLL}>
                    ETH LatAm Straw Poll
                  </option>
                  <option value={BallotType.ETH_LATAM_FEEDBACK}>
                    ETH LatAm Feedback
                  </option>
                </>
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
                expiry: new Date()
              }
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
