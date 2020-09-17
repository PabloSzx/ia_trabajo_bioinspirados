import "../../public/style.css";

import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";

import { ChakraProvider, theme } from "@chakra-ui/core";
import { merge } from "@chakra-ui/utils";
import { Navigation } from "../components/Navigation";

const chakraTheme = merge(theme, {});

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>IA Algoritmos Bioinspirados</title>
      </Head>
      <ChakraProvider resetCSS theme={chakraTheme}>
        <Navigation />
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
};

export default App;
