import { GlobalStyle } from "../components/core/GlobalStyle";

export default function ZupollApp({ Component, pageProps }: any) {
  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}
