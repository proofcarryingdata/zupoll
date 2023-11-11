import { ZupollError } from "../../src/types";
import { Button } from "../core/Button";
import { Overlay } from "./Overlay";

export function ErrorOverlay({
  error,
  onClose,
  onLogout,
}: {
  error: ZupollError;
  onClose: () => void;
  onLogout?: () => void;
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
      <br />
      <br />
      {onLogout && <Button onClick={onLogout}>Logout</Button>}
    </Overlay>
  );
}
