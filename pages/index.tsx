import React from 'react';
import AppRoot from "../components/AppRoot";
import Head from "next/head";

function App() {
  return (
    <>
      <Head>
        <title>fibers - follow your thoughts</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <AppRoot/>
    </>
  );

}

export default App;
