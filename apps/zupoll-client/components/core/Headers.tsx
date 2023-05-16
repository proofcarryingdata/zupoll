import { useRouter } from "next/router";
import { useCallback } from "react";
import styled from "styled-components";
import { Logo } from ".";
import { Button } from "./Button";

export function MainScreenHeader({
  onLogout,
  createBallot,
}: {
  onLogout: () => void;
  createBallot: () => Promise<boolean>;
}) {
  const confirmLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    }
  }, [onLogout]);

  return (
    <LoggedInContainer>
      <Logo src="/zupoll-logo.png" alt="Zuzalu" />
      <ButtonContainer>
        <Button deemph={true} onClick={confirmLogout}>
          Logout
        </Button>
        <BallotCreateButton onClick={createBallot}>
          <b>Create</b>
        </BallotCreateButton>
      </ButtonContainer>
    </LoggedInContainer>
  );
}

export function ReturnHeader() {
  const router = useRouter();

  return (
    <SecondaryContainer>
      <Button onClick={() => router.push("/")}>← Back</Button>
    </SecondaryContainer>
  );
}

export function ExitHeader() {
  const router = useRouter();

  const confirmExit = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to cancel? You will lose any questions you have written."
      )
    ) {
      router.push("/");
    }
  }, [router]);

  return (
    <SecondaryContainer>
      <Button onClick={confirmExit}>← Cancel</Button>
    </SecondaryContainer>
  );
}

export function LoggedOutHeader() {
  return (
    <HeaderContainer>
      <Logo src="/zupoll-logo.png" alt="Zuzalu" />
    </HeaderContainer>
  );
}

export const SecondaryContainer = styled.div`
  width: 100%;
  font-size: 2em;
  margin-bottom: 1rem;
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #fff;
`;

export const LoggedInContainer = styled.div`
  width: 100%;
  font-size: 2em;
  margin-bottom: 2rem;
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #fff;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const BallotCreateButton = styled.button`
  font-family: OpenSans;
  background: #52b5a4;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: "bold";

  &:hover {
    background-color: #449c8d;
  }

  &:active {
    background-color: #378073;
  }
`;
