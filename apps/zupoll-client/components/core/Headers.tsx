import { useCallback } from "react";
import styled from "styled-components";
import { Logo } from ".";
import { Button } from "./Button";

export function LoggedInHeader({ onLogout }: { onLogout: () => void }) {
  const confirmLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    }
  }, [onLogout]);

  return (
    <LoggedInContainer>
      <Logo src="/zupoll-logo.png" alt="Zuzalu" />
      <Button onClick={confirmLogout}>Logout</Button>
    </LoggedInContainer>
  );
}

export function LoggedOutHeader() {
  return (
    <HeaderContainer>
      <Logo src="/zupoll-logo.png" alt="Zuzalu" />
    </HeaderContainer>
  );
}

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
  margin-bottom: 2em;
`;
