import { useState } from "react";
import styled from "styled-components";
import { ZupollError } from "../../src/types";
import {
  PCDPASS_URL,
  PCDPASS_USERS_GROUP_URL,
  SEMAPHORE_ADMIN_GROUP_URL,
  SEMAPHORE_GROUP_URL,
  ZUPASS_URL,
} from "../../src/util";
import { Center } from "../core";
import { LoggedOutHeader } from "../core/Headers";
import { RippleLoader } from "../core/RippleLoader";
import { ErrorOverlay } from "../main/ErrorOverlay";
import { Login } from "./Login";

export function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [serverLoading, setServerLoading] = useState<boolean>(false);
  const [error, setError] = useState<ZupollError>();

  return (
    <Center>
      <LoggedOutHeader />
      <Body>
        <Description>
          <p>
            <strong>This app lets Zuzalu vote anonymously.</strong>
          </p>
          <p>
            The server never learns who you are. The Zuzalu Passport creates a
            zero-knowledge proof that you're a participant without revealing
            which one.
          </p>
        </Description>
        <LoginRow>
          {serverLoading ? (
            <RippleLoader />
          ) : (
            <>
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                passportAppUrl={PCDPASS_URL}
                requestedGroup={PCDPASS_USERS_GROUP_URL}
                prompt="PCDPass login"
              />
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                passportAppUrl={ZUPASS_URL}
                requestedGroup={SEMAPHORE_GROUP_URL}
                prompt="Resident login"
              />
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                passportAppUrl={PCDPASS_URL}
                requestedGroup={SEMAPHORE_ADMIN_GROUP_URL}
                prompt="Organizer login"
                deemphasized
              />
            </>
          )}
        </LoginRow>
      </Body>

      {error && (
        <ErrorOverlay error={error} onClose={() => setError(undefined)} />
      )}
    </Center>
  );
}

const LoginRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
`;

const Description = styled.div`
  font-family: OpenSans;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  margin-top: -0.75rem;
  text-align: center;
`;

const Body = styled.div`
  background: #eee;
  border-radius: 1rem;
  padding: 2rem;
`;
