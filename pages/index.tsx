import React from 'react';
import {useSession} from "next-auth/react";
import Homepage from "../components/Homepage";
import AppRoot from "../components/AppRoot";


function App() {
  const { data: session, status } = useSession();

  if(status === 'loading') {
    return <div>Loading...</div>
  }

  if(session) {
    return <AppRoot/>
  }

  return <Homepage/>
}

export default App;
