import React from 'react';
import { useSession, signIn } from "next-auth/react"
import UserButton from "./UserButton";

const LoginButton: React.FC = () => {
  const { data: session } = useSession();

  if (session) {
    return <UserButton/>
  }

  return (
    <>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}

export default LoginButton;