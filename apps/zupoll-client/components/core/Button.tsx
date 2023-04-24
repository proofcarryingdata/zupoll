import styled from "styled-components";

export const Button = styled.button<{ deemph?: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #888;
  opacity: 1;
  cursor: pointer;

  font-family: OpenSans;
  font-weight: ${({ deemph }) => (deemph ? "normal" : "bold")};
  background-color: ${({ deemph }) => (deemph ? "#eee" : "#fff")};

  &:hover {
    background-color: ${({ deemph }) => (deemph ? "#e8e8e8" : "#f8f8f8")};
  }

  &:active {
    background-color: ${({ deemph }) => (deemph ? "#e3e3e3" : "#f3f3f3")};
  }
`;
