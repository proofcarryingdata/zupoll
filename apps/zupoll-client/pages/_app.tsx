import { GlobalStyle } from "../components/core/GlobalStyle";
import "../styles/globals.css";

export default function ZupollApp({ Component, pageProps }: any) {
  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}
