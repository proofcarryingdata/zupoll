import { BallotType } from "../../src/prismaTypes";
import { ZupollError } from "../../src/types";

export function CreateBallot({
  token,
  ballotType,
  onError,
}: {
  token: string;
  ballotType: BallotType | undefined;
  onError: (err: ZupollError) => void;
}) {
  return <>{ballotType ?? ballotType}</>;
}
