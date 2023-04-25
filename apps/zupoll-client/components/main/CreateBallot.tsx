import { useState } from "react";
import { useCreateBallot } from "../../src/createBallot";
import { BallotType, Poll } from "../../src/prismaTypes";
import { ZupollError } from "../../src/types";
import { SEMAPHORE_ADMIN_GROUP_URL } from "../../src/util";
import { CreateBallotButton, WideButton } from "../core/Button";
import {
  FormButtonContainer,
  FormContainer,
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
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "",
      body: "",
      options: [],
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
  const [serverLoading, setServerLoading] = useState(false);

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

  const updatePollOptions = (pollOptions: string[], index: number) => {
    const newPolls = [...polls];
    newPolls[index].options = pollOptions;
    setPolls(newPolls);
  };

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
          <StyledLabel htmlFor="body">
            Ballot title&nbsp;
            <StyledInput
              type="text"
              id="body"
              autoComplete="off"
              value={ballotTitle}
              onChange={(e) => setBallotTitle(e.target.value)}
              required
              placeholder="Advisory Vote 04/25"
            />
          </StyledLabel>
          <StyledLabel htmlFor="options">
            Ballot description &nbsp;
            <StyledInput
              type="text"
              autoComplete="off"
              id="options"
              value={ballotDescription}
              onChange={(e) => setBallotDescription(e.target.value)}
              required
              placeholder="Advisory vote for 04/25 town hall"
            />
          </StyledLabel>
          <StyledLabel htmlFor="expiry">
            Expiry&nbsp;
            <StyledInput
              type="datetime-local"
              autoComplete="off"
              id="expiry"
              value={getDateString(ballotExpiry)}
              onChange={(e) => setBallotExpiry(new Date(e.target.value))}
              required
            />
          </StyledLabel>
          <StyledLabel htmlFor="expiry">
            Type of ballot
            <StyledSelect
              id="ballotType"
              value={ballotType}
              onChange={(e) => setBallotType(e.target.value)}
              required
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
        <StyledLabel>
          Questions
          <FormButtonContainer>
            <WideButton
              onClick={() =>
                setPolls([
                  ...polls,
                  {
                    id: "",
                    body: "",
                    options: [],
                    ballotURL: 0,
                    createdAt: new Date(),
                    expiry: new Date(),
                  },
                ])
              }
            >
              +
            </WideButton>
            <WideButton
              onClick={() => {
                if (polls.length !== 0) {
                  const newPolls = [...polls];
                  newPolls.pop();
                  setPolls(newPolls);
                }
              }}
            >
              -
            </WideButton>
          </FormButtonContainer>
        </StyledLabel>
      </FormContainer>

      {polls.map((poll, i) => {
        return (
          <FormContainer key={i}>
            <StyledForm>
              <h2>Question {i + 1}</h2>
              <StyledLabel htmlFor="body">
                Question&nbsp;
                <StyledInput
                  type="text"
                  id="body"
                  autoComplete="off"
                  value={poll.body}
                  onChange={(e) => updatePollBody(e.target.value, i)}
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
                  value={poll.options.join(",")}
                  onChange={(e) =>
                    updatePollOptions(e.target.value.split(","), i)
                  }
                  required
                  placeholder="Yes,No,Maybe"
                />
              </StyledLabel>
            </StyledForm>
          </FormContainer>
        );
      })}

      {loadingVoterGroupUrl || serverLoading ? (
        <RippleLoaderLight />
      ) : (
        <CreateBallotButton onClick={createBallotPCD}>
          <h3>Create ballot</h3>
        </CreateBallotButton>
      )}
    </>
  );
}
