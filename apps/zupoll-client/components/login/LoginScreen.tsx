import _ from "lodash";
import { useState } from "react";
import styled from "styled-components";
import {
  DEVCONNECT_ORGANIZER_CONFIG,
  DEVCONNECT_USER_CONFIG,
  EDGE_CITY_ORGANIZER_CONFIG,
  EDGE_CITY_RESIDENT_CONFIG,
  ETH_LATAM_ATTENDEE_CONFIG,
  ETH_LATAM_ORGANIZER_CONFIG,
  ZUZALU_ORGANIZER_LOGIN_CONFIG,
  ZUZALU_PARTICIPANT_LOGIN_CONFIG
} from "../../src/loginConfig";
import {
  LoginConfig,
  LoginConfigurationName,
  LoginState,
  ZupollError
} from "../../src/types";
import { Center } from "../core";
import { LoggedOutHeader } from "../core/Headers";
import { RippleLoader } from "../core/RippleLoader";
import { ErrorOverlay } from "../main/ErrorOverlay";
import { Login } from "./Login";

const allLoginConfigs: LoginConfig[] = [
  ETH_LATAM_ATTENDEE_CONFIG,
  ETH_LATAM_ORGANIZER_CONFIG,
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
  // visibleLoginOptions is a set of login config names to show here
  // this supports creating login pages for specific events which only show
  // some login options.
  // if the array is empty, all options are shown.
  visibleLoginOptions
}: {
  onLogin: (loginState: LoginState) => void;
  title: string;
  visibleLoginOptions: LoginConfigurationName[] | undefined;
}) {
  const [serverLoading, setServerLoading] = useState<boolean>(false);
  const [error, setError] = useState<ZupollError>();
  const loginConfigSet = new Set(visibleLoginOptions);
  const visibleLoginRows =
    visibleLoginOptions === undefined
      ? allLoginConfigs
      : allLoginConfigs.filter(
          // If loginConfigSet is zero include everything, otherwise check for
          // inclusion
          (config) =>
            loginConfigSet.size === 0 || loginConfigSet.has(config.name)
        );
  // Chunk the login options into rows of two options
  const loginRows = _.chunk(visibleLoginRows, 2);
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
          {loginRows.map(([a, b], idx) => {
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
                  {b &&
                    (serverLoading ? (
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
