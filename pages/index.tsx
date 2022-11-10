import React, {useState} from 'react';
import Homepage from "../components/Homepage";
import AppRoot from "../components/AppRoot";
import Head from "next/head";
import { onAuthStateChanged } from "firebase/auth";
import firebase from "../lib/firebase-client";

function App() {
  const [userData, setUserData] = useState<any>(null);

  onAuthStateChanged(firebase.auth, (user) => {
    if (user) {
      if(!userData) {
        console.log('will set user data');
        setUserData(user);
      }
    } else {
      if(userData) {
        console.log('will unset user data')
        setUserData(null)
      }
    }
  });

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

  // if(status === 'loading') {
  //   return (
  //     <div>
  //       <div className="fixed inset-0 bg-gray-200 bg-opacity-75 transition-opacity"></div>
  //       <div className={'flex justify-center items-center h-screen'}>
  //         <ArrowPathIcon className={'w-10 h-10 animate-spin text-slate-700'}/>
  //       </div>
  //     </div>
  //   )
  // }
  //
  // if(session) {
  //   return (
  //     <>
  //       <Head>
  //         <title>fibers - follow your thoughts</title>
  //         <meta name="viewport" content="initial-scale=1.0, width=device-width" />
  //       </Head>
  //       <AppRoot/>
  //     </>
  //   );
  // }


}

export default App;
