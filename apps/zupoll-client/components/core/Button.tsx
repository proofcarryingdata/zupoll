import styled from "styled-components";

export const Button = styled.button`
  padding: 8px 16px;
  font-size: 16px;
  margin: 0 0 5px 0;
  border: none;
  border-radius: 8px;
  background-color: #eee;
  opacity: 1;
  cursor: pointer;

  &:hover {
    background-color: #dedede;
  }

  &:active {
    background-color: #d3d3d3;
  }
`;
