import React from 'react';
import { useSession, signIn, signOut } from "next-auth/react"
import {UserCircleIcon} from "@heroicons/react/24/outline";
import Image from "next/image";

const LoginButton: React.FC = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <button onClick={() => signOut()}>
          {session?.user?.image && session?.user?.name ? (
            <Image src={session?.user?.image} alt={session?.user?.name} width={20} height={20} className={'rounded-full'}/>
          ) : (
            <UserCircleIcon className={'w-4 w-4 text-slate-500'}/>
          )}
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