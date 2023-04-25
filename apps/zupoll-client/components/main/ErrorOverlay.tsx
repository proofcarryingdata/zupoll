import { ZupollError } from "../../src/types";
import { Overlay } from "./Overlay";
import { Button } from "../core/Button";

export function ErrorOverlay({
  error,
  onClose,
}: {
  error: ZupollError;
  onClose: () => void;
}) {
  console.log(error);
  return (
    <Overlay onClose={onClose}>
      <br />
      <h1>{error.title}</h1>
      <br />
      <p>{error.message}</p>
      {error.stack && (
        <>
          <br />
          <pre>{error.stack}</pre>
        </>
      )}
      <br />
      <Button onClick={onClose}>Close</Button>
    </Overlay>
  );
}
