import { useState } from "react";
import styled from "styled-components";
import {
  DEVCONNECT_ORGANIZER_CONFIG,
  DEVCONNECT_USER_CONFIG,
  ZUZALU_ORGANIZER_LOGIN_CONFIG,
  ZUZALU_PARTICIPANT_LOGIN_CONFIG,
} from "../../src/loginConfig";
import { LoginState, ZupollError } from "../../src/types";
import { Center } from "../core";
import { LoggedOutHeader } from "../core/Headers";
import { RippleLoader } from "../core/RippleLoader";
import { ErrorOverlay } from "../main/ErrorOverlay";
import { Login } from "./Login";

export function LoginScreen({
  onLogin,
}: {
  onLogin: (loginState: LoginState) => void;
}) {
  const [serverLoading, setServerLoading] = useState<boolean>(false);
  const [error, setError] = useState<ZupollError>();

  return (
    <Center>
      <LoggedOutHeader />
      <Body>
        <Description>
          <p>
            <strong>This app lets Zupass users vote anonymously.</strong>
          </p>
          <p>
            The server never learns who you are. From Zupass, you create a
            zero-knowledge proof that you're a participant without revealing
            which one.
          </p>
          <p>
            <strong>Choose a group to get started </strong>
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
                config={ZUZALU_PARTICIPANT_LOGIN_CONFIG}
                prompt="ZuConnect Resident"
              />
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                config={ZUZALU_ORGANIZER_LOGIN_CONFIG}
                prompt="ZuConnect Organizer"
              />
            </>
          )}
        </LoginRow>
        <br></br>
        <LoginRow>
          {serverLoading ? (
            <RippleLoader />
          ) : (
            <>
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                config={DEVCONNECT_USER_CONFIG}
                prompt="Devconnect Resident"
              />
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                config={DEVCONNECT_ORGANIZER_CONFIG}
                prompt="Devconnect Organizer"
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
