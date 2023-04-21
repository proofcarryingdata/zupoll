import { useEffect, useState } from "react";
import styled from "styled-components";
import { listPolls } from "../../src/api";
import { ZupollError, PollDefinition } from "../../src/types";
import { Poll } from "./Poll";

/**
 * Shows the user with access token a list of polls.
 * @param accessToken jwt used to authenticate to the server
 * @param newPoll the new poll string
 */
export function Polls({
  accessToken,
  newPoll,
  onError,
}: {
  accessToken: string | null;
  newPoll: string | undefined;
  onError: (err: ZupollError) => void;
}) {
  const [polls, setPolls] = useState<Array<PollDefinition>>([]);
  const [newVote, setNewVote] = useState<string | undefined>();

  useEffect(() => {
    if (!accessToken) {
      setPolls([]);
      return;
    }

    (async () => {
      // TODO: paging
      const resp = await listPolls(accessToken);
      setPolls(resp["polls"]);
    })();
  }, [accessToken, newPoll, newVote]);

  return (
    <PollsContainer>
      {polls.map((poll) => (
        <Poll
          key={poll.id}
          poll={poll}
          onError={onError}
          onVoted={setNewVote}
        />
      ))}
    </PollsContainer>
  );
}

const PollsContainer = styled.div`
  width: 100%;
  margin-bottom: 256px;
`;
