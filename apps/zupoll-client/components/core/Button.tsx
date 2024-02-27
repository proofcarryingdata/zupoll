import styled from "styled-components";

export const Button = styled.button<{ deemph?: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #888;
  opacity: 1;
  cursor: pointer;
  color: black;

  font-family: OpenSans;
  font-weight: ${({ deemph }) => (deemph ? "normal" : "bold")};
  background-color: ${({ deemph }) => (deemph ? "#eee" : "#fff")};

  &:hover {
    background-color: ${({ deemph }) => (deemph ? "#c3c1c1" : "#d8d8d8")};
  }

  &:active {
    background-color: ${({ deemph }) => (deemph ? "#b3b1b1" : "#c3c3c3")};
  }
`;
