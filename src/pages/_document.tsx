import Document, { Head, Html, Main, NextScript } from "next/document";
import scrolledScript from "@italodeandra/ui/bootstrap/scrolledScript";

export default class _Document extends Document {
  render() {
    return (
      <Html lang="pt" className="h-full antialiased">
        <Head>
          <script dangerouslySetInnerHTML={{ __html: scrolledScript }} />
        </Head>
        <body className="ui-theme-default">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
