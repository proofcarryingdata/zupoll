import styled from "styled-components";
import { ZupollError } from "../../src/types";

export function CreatePost({
  onError,
}: {
  onError: (err: ZupollError) => void;
}) {
  return (
    <PollWrapper>
      <PollHeader>Create post from @zupoll_bot</PollHeader>
      <input></input>
    </PollWrapper>
  );
}

const PollWrapper = styled.div`
  box-sizing: border-box;
  font-family: OpenSans;
  border: 1px solid #bbb;
  background-color: #eee;
  width: 100%;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 1rem;
  position: relative;
  transition: 200ms;

  &:hover {
    background-color: #f8f8f8;
  }
`;

const PollHeader = styled.div`
  padding: 0px;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 700;
`;