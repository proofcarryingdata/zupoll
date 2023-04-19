import { GlobalStyle } from "../components/GlobalStyle";

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}
