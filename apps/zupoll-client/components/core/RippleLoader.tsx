import styled, { keyframes } from "styled-components";

/**
 * Source: https://loading.io/css/
 */

const ripple = keyframes`
 0% {
   top: 1rem;
   left: 1rem;
   width: 0;
   height: 0;
   opacity: 0;
 }
 4.9% {
   top: 1rem;
   left: 1rem;
   width: 0;
   height: 0;
   opacity: 0;
 }
 5% {
   top: 1rem;
   left: 1rem;
   width: 0;
   height: 0;
   opacity: 1;
 }
 100% {
   top: 0px;
   left: 0px;
   width: 2rem;
   height: 2rem;
   opacity: 0;
 }
`;

export const RippleLoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const RippleLoaderInner = styled.div<{ light: boolean }>`
  display: inline-block;
  position: relative;
  width: 2rem;
  height: 2rem;
  & > div {
    position: absolute;
    border: 4px solid ${({ light }) => (light ? "white" : "black")};
    opacity: 1;
    border-radius: 50%;
    animation: ${ripple} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }
  & > div:nth-child(2) {
    animation-delay: -0.5s;
  }
`;

export const RippleLoader = () => {
  return (
    <RippleLoaderWrapper>
      <RippleLoaderInner light={false}>
        <div></div>
        <div></div>
      </RippleLoaderInner>
    </RippleLoaderWrapper>
  );
};

export const RippleLoaderLight = () => {
  return (
    <RippleLoaderWrapper>
      <RippleLoaderInner light={true}>
        <div></div>
        <div></div>
      </RippleLoaderInner>
    </RippleLoaderWrapper>
  );
};
