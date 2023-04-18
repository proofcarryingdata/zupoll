import styled from "styled-components";

export const Button = styled.button`
  height: 48px;
  padding: 12px;
  font-size: 16px;
  margin: 0 0 5px 0;
  border: none;
  border-radius: 99px;
  background-color: #fcd270;
  opacity: 1;
  cursor: pointer;
  &:hover {
    opacity: 0.95;
  }
  &:active {
    opacity: 0.9;
  }
`;
