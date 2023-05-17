import { useState } from "react";
import styled from "styled-components";
import { useCreateBallot } from "../../src/createBallot";
import { BallotType, Poll } from "../../src/prismaTypes";
import { ZupollError } from "../../src/types";
import { SEMAPHORE_ADMIN_GROUP_URL } from "../../src/util";
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

export function CreateBallot({
  group,
  onError,
}: {
  group: string | undefined;
  onError: (err: ZupollError) => void;
}) {
  /**
   * EDITING BALLOT INFO LOGIC
   */
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
  const [ballotTitle, setBallotTitle] = useState("");
  const [ballotDescription, setBallotDescription] = useState("");
  const [ballotExpiry, setBallotExpiry] = useState<Date>(
    new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
  );
  const [ballotType, setBallotType] = useState<BallotType>(
    BallotType.STRAWPOLL
  );

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
  });

  return (
    <>
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
          <StyledLabel >
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
          <StyledLabel >
            Expiry&nbsp;
            <StyledInput
              type="datetime-local"
              autoComplete="off"
              id="expiry"
              value={getDateString(ballotExpiry)}
              onChange={(e) => setBallotExpiry(new Date(e.target.value))}
            />
          </StyledLabel>
          <StyledLabel >
            Type of ballot
            <StyledSelect
              id="ballotType"
              value={ballotType}
              onChange={(e) => setBallotType(e.target.value)}
            >
              <option value={BallotType.STRAWPOLL}>Straw Poll</option>
              {group === SEMAPHORE_ADMIN_GROUP_URL ? (
                <option value={BallotType.ADVISORYVOTE}>Advisory Vote</option>
              ) : (
                <></>
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
              <StyledLabel >
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
  font-size: 1rem;
  border-radius: 0.5rem;
  opacity: 1;
  cursor: pointer;
  text-align: center;

  font-family: OpenSans;
  background-color: #fff;

  &:hover {
    background-color: #d8d8d8;
  }

  &:active {
    background-color: #c3c3c3;
  }
`;
