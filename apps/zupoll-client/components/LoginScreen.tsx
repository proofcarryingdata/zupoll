import styled from "styled-components";
import { SEMAPHORE_ADMIN_GROUP_URL, SEMAPHORE_GROUP_URL } from "../src/util";
import { Login } from "./Login";

export function LoginScreen({
  updateAccessToken,
}: {
  updateAccessToken: (token: string | null, group: string | null) => void;
}) {
  return (
    <Bg>
      <Header>
        <img src="/zuzalulogo.webp" alt="Zuzalu" width="160" height="42" />
        <H1>Anonymous Polls</H1>
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
            onLoggedIn={updateAccessToken}
            requestedGroup={SEMAPHORE_GROUP_URL}
            prompt="Log in to vote"
          />
          <Login
            onLoggedIn={updateAccessToken}
            requestedGroup={SEMAPHORE_ADMIN_GROUP_URL}
            prompt="Log in as an organizer"
            deemphasized
          />
        </LoginRow>
      </Body>
    </Bg>
  );
}

const Bg = styled.div`
  width: 512px;
`;

const Description = styled.div`
  font-size: 18px;
  margin-bottom: 48px;
  margin-top: -12px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
  padding: 0 16px 0 4px;
`;

const H1 = styled.h1`
  color: #eee;
  margin-top: 0;
  font-size: 30px;
`;

const Body = styled.div`
  background: #eee;
  border-radius: 16px;
  padding: 48px;
`;

const LoginRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
`;
