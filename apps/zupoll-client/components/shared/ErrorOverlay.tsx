import * as React from "react";
import { Overlay } from "./Overlay";

export function ErrorOverlay({
  error,
  onClose,
}: {
  error: ConfessionsError;
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
      <br/>
      <button onClick={onClose}>Close</button>
    </Overlay>
  );
}

export interface ConfessionsError {
  /** Big title, should be under 40 chars */
  title: string;
  /** Useful explanation, avoid "Something went wrong." */
  message: string | React.ReactNode;
  /** Optional stacktrace. */
  stack?: string;
}
