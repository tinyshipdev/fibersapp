import React, {useEffect, useState} from 'react';
import Homepage from "../components/Homepage";
import AppRoot from "../components/AppRoot";
import Head from "next/head";
import { onAuthStateChanged } from "firebase/auth";
import firebase from "../lib/firebase-client";
import {ArrowPathIcon} from "@heroicons/react/24/outline";

function App() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
      if (user) {
        if(!userData) {
          setUserData(user);
        }
      } else {
        if(userData) {
          setUserData(null)
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [])



  if(loading) {
    return (
      <div>
        <div className="fixed inset-0 bg-gray-200 bg-opacity-75 transition-opacity"></div>
        <div className={'flex justify-center items-center h-screen'}>
          <ArrowPathIcon className={'w-10 h-10 animate-spin text-slate-700'}/>
        </div>
      </div>
    )
  }

  if(userData) {
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
