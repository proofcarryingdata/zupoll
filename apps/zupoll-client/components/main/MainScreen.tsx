import { useRouter } from "next/router";
import styled from "styled-components";
import { Center } from "../core";
import { BallotButton, Button } from "../core/Button";
import { LoggedInHeader } from "../core/Headers";

export function MainScreen({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();

  return (
    <Center>
      <LoggedInHeader onLogout={onLogout} />

      <BallotButton onClick={() => router.push("/create-ballot")}>
        <h3>Create a new ballot</h3>
      </BallotButton>

      <BallotListContainer>
        <TitleContainer>
          <H1>Advisory Votes</H1>
        </TitleContainer>
        <Button>AV #1</Button>
        <Button>AV #2</Button>
        <Button>AV #3</Button>
      </BallotListContainer>
      <br />
      <BallotListContainer>
        <TitleContainer>
          <H1>Straw Polls</H1>
        </TitleContainer>
        <Button>SP #1</Button>
        <Button>SP #2</Button>
        <Button>SP #3</Button>
      </BallotListContainer>
    </Center>
  );
}

const H1 = styled.h1`
  color: black;
  margin: 0;
  font-size: 1.4rem;
  font-family: OpenSans;
  font-weight: 700;
  font-style: normal;
  /* ::first-letter {
    font-size: 1.6rem;
  } */
`;

const BallotListContainer = styled.div`
  display: flex;
  background: #eee;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  margin-top: 1rem;
  border-radius: 1rem;
  padding: 1.5rem 2rem 2rem 2rem;
  border: 1px solid #eee;
  gap: 1rem;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;
