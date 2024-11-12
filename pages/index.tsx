import React from "react";
import AppRoot from "../components/AppRoot";
import Head from "next/head";

function App() {
  return (
    <>
      <Head>
        <title>fibers - follow your thoughts</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <AppRoot />
      <a
        target={"_blank"}
        className="fixed bottom-8 right-8"
        href="https://buymeacoffee.com/tinyship"
      >
        <img
          src="/bmc-button.png"
          alt="Buy me a coffee"
          className="w-40 hover:opacity-70 cursor-pointer shadow-lg"
        />
      </a>
    </>
  );
}

export default App;
