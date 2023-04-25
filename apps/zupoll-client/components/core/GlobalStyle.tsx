import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html {
    font-family: system-ui, sans-serif;
    font-size: 1rem;
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
      font-size: 0.75rem;
    }
  }

  @font-face {
    font-family: 'OpenSans';
    font-style: normal;
    font-weight: 300;
    src:url(/fonts/OpenSans-Light.ttf) format('truetype');
  }
  @font-face {
    font-family: 'OpenSans';
    font-style: italic;
    font-weight: 300;
    src:url(/fonts/OpenSans-LightItalic.ttf) format('truetype');
  }
  @font-face {
    font-family: 'OpenSans';
    font-style: normal;
    font-weight: 400;
    src:url(/fonts/OpenSans-Regular.ttf) format('truetype');
  }
  @font-face {
    font-family: 'OpenSans';
    font-style: normal;
    font-weight: 500;
    src:url(/fonts/OpenSans-Medium.ttf) format('truetype');
  }
  @font-face {
    font-family: 'OpenSans';
    font-style: normal;
    font-weight: 600;
    src:url(/fonts/OpenSans-SemiBold.ttf) format('truetype');
  }
  @font-face {
    font-family: 'OpenSans';
    font-style: normal;
    font-weight: 700;
    src:url(/fonts/OpenSans-Bold.ttf) format('truetype');
  }
`;
