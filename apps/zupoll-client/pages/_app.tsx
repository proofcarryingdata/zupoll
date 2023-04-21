import { GlobalStyle } from "../components/core/GlobalStyle";

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}
