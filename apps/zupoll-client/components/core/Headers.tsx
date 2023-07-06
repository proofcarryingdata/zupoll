import { useRouter } from "next/router";
import { useCallback } from "react";
import styled from "styled-components";
import { Logo } from ".";
import { Button } from "./Button";

export function MainScreenHeader({
  logout,
  createBallot,
}: {
  logout: () => void;
  createBallot: () => Promise<boolean>;
}) {
  const confirmLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  }, [logout]);

  return (
    <StickyHeader>
      <MainScreenContainer>
        <Logo src="/zupoll-logo.png" alt="Zuzalu" />
        <ButtonContainer>
          <LogoutButton onClick={confirmLogout}>Logout</LogoutButton>
          <BallotCreateButton onClick={createBallot}>
            <b>Create</b>
          </BallotCreateButton>
        </ButtonContainer>
      </MainScreenContainer>
    </StickyHeader>
  );
}

export function ReturnHeader() {
  const router = useRouter();

  return (
    <StickyHeader>
      <SecondaryContainer>
        <Button onClick={() => router.push("/")}>← Back</Button>
      </SecondaryContainer>
    </StickyHeader>
  );
}

export function CancelPollHeader() {
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
    <StickyHeader>
      <SecondaryContainer>
        <Button onClick={confirmExit}>← Cancel</Button>
      </SecondaryContainer>
    </StickyHeader>
  );
}

export function LoggedOutHeader() {
  return (
    <LoggedOutContainer>
      <Logo src="/zupoll-logo.png" alt="Zuzalu" />
    </LoggedOutContainer>
  );
}

const StickyHeader = styled.div`
  z-index: 900;
  position: sticky;
  top: 0;
`;

const MainScreenContainer = styled.div`
  width: 100%;
  font-size: 2em;
  padding-bottom: 2rem;
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  background: rgb(28, 41, 40);
`;

const SecondaryContainer = styled.div`
  width: 100%;
  font-size: 2em;
  padding-bottom: 1.5rem;
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  background: rgb(28, 41, 40);
`;

const LoggedOutContainer = styled.div`
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
  font-weight: bold;
  color: rgb(28, 41, 40);

  &:hover {
    background-color: #449c8d;
  }

  &:active {
    background-color: #378073;
  }
`;

const LogoutButton = styled.button`
  font-family: OpenSans;
  background: rgb(28, 41, 40);
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-style: solid;
  border-color: #52b5a4;
  border-width: 1px;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: bold;
  color: #52b5a4;
`;
