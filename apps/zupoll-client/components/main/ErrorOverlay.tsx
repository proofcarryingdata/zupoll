import * as React from "react";
import { Overlay } from "./Overlay";
import { ZupollError } from "../../src/types";


export function ErrorOverlay({
  error,
  onClose,
}: {
  error: ZupollError;
  onClose: () => void;
}) {
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
      <button onClick={onClose}>Close</button>
    </Overlay>
  );
}
