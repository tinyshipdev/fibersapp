import React from 'react';
import {useSession} from "next-auth/react";
import Homepage from "../components/Homepage";
import AppRoot from "../components/AppRoot";
import {ArrowPathIcon} from "@heroicons/react/24/outline";


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
    return <AppRoot/>
  }

  return <Homepage/>
}

export default App;
