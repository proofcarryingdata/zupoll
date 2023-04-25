import styled from "styled-components";

export const FormContainer = styled.div`
  box-sizing: border-box;
  font-family: OpenSans;
  border: 1px solid #bbb;
  background-color: #eee;
  width: 100%;
  border-radius: 1rem;
  padding: 1rem 2rem 2rem 2rem;
  margin-bottom: 1rem;
`;

export const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const StyledInput = styled.input`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  border: 1px solid #555;
  width: 50%;
`;

export const StyledSelect = styled.select`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  border: 1px solid #555;
  width: 50%;
`;

export const StyledLabel = styled.label`
  margin-bottom: 0.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: right;
  font-weight: bold;
`;

export const FormButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 50%;
`;
