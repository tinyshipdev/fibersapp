import React from 'react';
import {useSession} from "next-auth/react";
import Homepage from "../components/Homepage";
import AppRoot from "../components/AppRoot";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import Head from "next/head";


function App() {
  const { data: session, status } = useSession();

  if(status === 'loading') {
    return (
      <div>
        <div className="fixed inset-0 bg-gray-200 bg-opacity-75 transition-opacity"></div>
        <div className={'flex justify-center items-center h-screen'}>
          <ArrowPathIcon className={'w-10 h-10 animate-spin text-slate-700'}/>
        </div>
      </div>
    )
  }

  if(session) {

    // @ts-ignore
    const userId = session?.user?.id;

    return (
      <>
        <Head>
          <title>fibers - follow your thoughts</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <AppRoot userId={userId}/>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>fibers - follow your thoughts</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Homepage/>
    </>
  );
}

export default App;
