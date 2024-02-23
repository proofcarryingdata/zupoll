import { useState } from "react";
import styled from "styled-components";
import {
  DEVCONNECT_ORGANIZER_CONFIG,
  DEVCONNECT_USER_CONFIG,
  EDGE_CITY_ORGANIZER_CONFIG,
  EDGE_CITY_RESIDENT_CONFIG,
  ZUZALU_ORGANIZER_LOGIN_CONFIG,
  ZUZALU_PARTICIPANT_LOGIN_CONFIG,
} from "../../src/loginConfig";
import { LoginState, ZupollError } from "../../src/types";
import { Center } from "../core";
import { LoggedOutHeader } from "../core/Headers";
import { RippleLoader } from "../core/RippleLoader";
import { ErrorOverlay } from "../main/ErrorOverlay";
import { Login } from "./Login";
import _ from "lodash";

const allLoginConfigs = [
  EDGE_CITY_RESIDENT_CONFIG,
  EDGE_CITY_ORGANIZER_CONFIG,
  ZUZALU_PARTICIPANT_LOGIN_CONFIG,
  ZUZALU_ORGANIZER_LOGIN_CONFIG,
  DEVCONNECT_USER_CONFIG,
  DEVCONNECT_ORGANIZER_CONFIG
];

export function LoginScreen({
  onLogin,
  title = "This app lets Zupass users vote anonymously.",
  loginConfigs
}: {
  onLogin: (loginState: LoginState) => void;
  title: string;
  loginConfigs: string[]
}) {
  const [serverLoading, setServerLoading] = useState<boolean>(false);
  const [error, setError] = useState<ZupollError>();
  const loginConfigSet = new Set(loginConfigs);
  return (
    <Center>
      <LoggedOutHeader />
      <Body>
        <Description>
          <p>
            <strong>{title}</strong>
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
        <>
          {_.chunk(allLoginConfigs.filter(config => loginConfigSet.size === 0 || loginConfigSet.has(config.name)), 2).map(([a, b], idx) => {
            return (
              <div key={idx}>
                <LoginRow>
                  {serverLoading ? (
                    <RippleLoader />
                  ) : (
                    <Login
                      onLogin={onLogin}
                      onError={setError}
                      setServerLoading={setServerLoading}
                      config={a}
                      prompt={a.prompt}
                    />
                  )}
                  {b && (serverLoading ? (
                    <RippleLoader />
                  ) : (
                    <Login
                      onLogin={onLogin}
                      onError={setError}
                      setServerLoading={setServerLoading}
                      config={b}
                      prompt={b.prompt}
                    />
                  ))}
                </LoginRow>
                <br />
              </div>
            );
          })}
        </>
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
