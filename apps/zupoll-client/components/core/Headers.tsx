import { useRouter } from "next/router";
import { useCallback } from "react";
import styled from "styled-components";
import { Logo } from ".";
import { Button } from "../../@/components/ui/button";

export function MainScreenHeader({
  logout,
  createBallot
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
          <Button onClick={confirmLogout}>Logout</Button>
          <Button onClick={createBallot}>Create</Button>
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
