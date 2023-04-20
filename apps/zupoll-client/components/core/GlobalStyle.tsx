import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html {
    font-family: system-ui, sans-serif;
    font-size: 16px;
    background: rgb(28, 41, 40);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  @media screen and (max-width: 640px) {
    html {
      font-size: 12px;
    }
  }
`;
