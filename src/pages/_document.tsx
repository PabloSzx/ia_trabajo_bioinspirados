import Document, { Head, Html, Main, NextScript } from "next/document";

import { ColorModeScript } from "@chakra-ui/core";

class AppDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <ColorModeScript initialColorMode="system" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default AppDocument;
