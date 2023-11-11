import { useRouter } from "next/router";
import { ZupollError } from "../../src/types";
import { useSavedLoginState } from "../../src/useLoginState";
import { Button } from "../core/Button";
import { Overlay } from "./Overlay";

export function ErrorOverlay({
  error,
  onClose,
  showLogout,
}: {
  error: ZupollError;
  onClose: () => void;
  showLogout?: boolean;
}) {
  const router = useRouter();
  const { logout } = useSavedLoginState(router);
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
      {showLogout && <Button onClick={logout}>Logout</Button>}
    </Overlay>
  );
}
