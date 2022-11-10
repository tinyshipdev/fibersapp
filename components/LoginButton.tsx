import React from 'react';
import UserButton from "./UserButton";
import firebase from "../lib/firebase-client";
import Link from "next/link";

const LoginButton: React.FC = () => {
  const user = firebase.auth.currentUser;

  if (user) {
    return <UserButton/>
  }

  return (
    <>
      <Link href={'/signin'}>
        <button>Sign in</button>
      </Link>
    </>
  )
}

export default LoginButton;