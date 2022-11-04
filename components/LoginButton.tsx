import React from 'react';
import { useSession, signIn, signOut } from "next-auth/react"
import {UserCircleIcon} from "@heroicons/react/24/outline";

const LoginButton: React.FC = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <button onClick={() => signOut()}>
          <UserCircleIcon className={'w-4 w-4 text-slate-500'}/>
        </button>
      </>
    )
  }
  return (
    <>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}

export default LoginButton;