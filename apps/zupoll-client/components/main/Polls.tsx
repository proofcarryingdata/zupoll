import { useEffect, useState } from "react";
import styled from "styled-components";
import { listPolls } from "../../src/api";
import { ZupollError, PollDefinition } from "../../src/types";
import { RippleLoaderLight } from "../core/RippleLoader";
import { Poll } from "./Poll";

/**
 * Shows the user with access token a list of polls.
 * 
 * @param accessToken jwt used to authenticate to the server
 * @param newPoll the new poll string
 * @param resetToken resets the auth token in case it expired
 */
export function Polls({
  accessToken,
  newPoll,
  resetToken,
  onError,
}: {
  accessToken: string | null;
  newPoll: string | undefined;
  resetToken: () => void;
  onError: (err: ZupollError) => void;
}) {
  const [polls, setPolls] = useState<Array<PollDefinition>>([]);
  const [newVote, setNewVote] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!accessToken) {
      setPolls([]);
      return;
    }

    (async () => {
      setLoading(true);
      const res = await listPolls(accessToken);
      setLoading(false);

      if (res === undefined) {
        const serverDownError: ZupollError = {
          title: "Retrieving polls failed",
          message: "Server is down. Contact passport@0xparc.org."
        };
        onError(serverDownError);
        return;
      }

      if (res.status === 401) {
        resetToken();
        return;
      }

      const polls = await res.json();
      setPolls(polls["polls"]);
    })();
  }, [accessToken, newPoll, newVote, onError]);

  return (
    <PollsContainer>
      {
        loading ? (
          <RippleLoaderLight />
        ) : (
          polls.map((poll) => (
            <Poll
              key={poll.id}
              poll={poll}
              onError={onError}
              onVoted={setNewVote}
            />
          ))
        )
      }
    </PollsContainer>
  );
}

const PollsContainer = styled.div`
  width: 100%;
  margin-bottom: 256px;
`;
