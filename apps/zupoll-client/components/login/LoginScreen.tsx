import styled from "styled-components";
import { SEMAPHORE_ADMIN_GROUP_URL, SEMAPHORE_GROUP_URL } from "../../src/util";
import { Login } from "./Login";

export function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  return (
    <Bg>
      <Header>
        <Logo src="/zuzalulogo.webp" alt="Zuzalu" width="160" height="42" />
        <H1>Polling</H1>
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
          <p>
            You can also log in as an organizer, letting you create your own
            polls.
          </p>
        </Description>
        <LoginRow>
          <Login
            onLogin={onLogin}
            requestedGroup={SEMAPHORE_GROUP_URL}
            prompt="Log in to vote"
          />
          <Login
            onLogin={onLogin}
            requestedGroup={SEMAPHORE_ADMIN_GROUP_URL}
            prompt="Log in as an organizer"
            deemphasized
          />
        </LoginRow>
      </Body>
    </Bg>
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

const Bg = styled.div`
  max-width: 512px;
`;

const Description = styled.div`
  font-size: 1.2rem;
  margin-bottom: 4rem;
  margin-top: -0.75rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  padding: 0 1rem 0 0.25rem;
`;

const Body = styled.div`
  background: #eee;
  border-radius: 1rem;
  padding: 4rem;
`;

const LoginRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 1rem;
`;
