import { useState } from "react";
import styled from "styled-components";
import { ZupollError } from "../../src/types";
import { SEMAPHORE_ADMIN_GROUP_URL, SEMAPHORE_GROUP_URL } from "../../src/util";
import { RippleLoader } from "../core/RippleLoader";
import { ErrorOverlay } from "../main/ErrorOverlay";
import { Login } from "./Login";

export function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [serverLoading, setServerLoading] = useState<boolean>(false);
  const [error, setError] = useState<ZupollError>();

  return (
    <Center>
      <Header>
        <Logo src="/zuzalulogo.webp" alt="Zuzalu" width="160" height="42" />
        <H1>Polls</H1>
      </Header>
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
                requestedGroup={SEMAPHORE_GROUP_URL}
                prompt="Log in to vote"
              />
              <Login
                onLogin={onLogin}
                onError={setError}
                setServerLoading={setServerLoading}
                requestedGroup={SEMAPHORE_ADMIN_GROUP_URL}
                prompt="Log in as an organizer"
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

const Logo = styled.img`
  width: 10rem;
  height: 2.625rem;
`;

const H1 = styled.h1`
  color: #eee;
  margin-top: 0;
  font-size: 1.8rem;
`;

const Center = styled.div`
  max-width: 580px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Description = styled.div`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  margin-top: -0.75rem;
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding: 0 1rem 0 0.25rem;
`;

const Body = styled.div`
  background: #eee;
  border-radius: 1rem;
  padding: 2rem;
`;

const LoginRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
`;
