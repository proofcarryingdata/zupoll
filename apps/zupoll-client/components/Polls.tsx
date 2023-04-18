import { Fragment, useEffect, useState } from "react";
import { listPolls } from "../src/api";
import { Poll } from "./Poll";
import { ZupollError } from "./shared/ErrorOverlay";

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
  const [polls, setPolls] = useState<Array<Poll>>([]);
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
    <>
      {polls.map((poll) => (
        <Fragment key={poll.id}>
          <Poll poll={poll} onError={onError} onVoted={setNewVote} />
        </Fragment>
      ))}
    </>
  );
}
