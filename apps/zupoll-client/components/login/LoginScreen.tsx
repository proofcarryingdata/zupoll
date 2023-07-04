import { useState } from "react";
import styled from "styled-components";
import {
  pcdpassUserConfiguration,
  zuzaluOrganizerConfiguration,
  zuzaluParticipantConfiguration,
} from "../../src/loginConfig";
import { LoginConfiguration, ZupollError } from "../../src/types";
import { Center } from "../core";
import { LoggedOutHeader } from "../core/Headers";
import { RippleLoader } from "../core/RippleLoader";
import { ErrorOverlay } from "../main/ErrorOverlay";
import { Login } from "./Login";

export function LoginScreen({
  onLogin,
}: {
  onLogin: (token: string, configuration: LoginConfiguration) => void;
}) {
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
                prompt="PCDPass login"
                configuration={pcdpassUserConfiguration}
              />
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                configuration={zuzaluParticipantConfiguration}
                prompt="Resident login"
              />
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                configuration={zuzaluOrganizerConfiguration}
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
