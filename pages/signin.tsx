import LoginButton from "../components/LoginButton";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import {GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import firebase from "../lib/firebase-client";

const googleAuthProvider = new GoogleAuthProvider();

const GoogleButton = () => {

  function signIn() {
    signInWithPopup(firebase.auth, googleAuthProvider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential: any = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        // redirect to homepage (app)
        location.href = '/'
      }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);

      // give some feedback as to why the user couldn't log in
    });
  }

  return (
    <button
      onClick={() => signIn()}
      className={'flex items-center border border-slate-300 px-4 py-3 hover:bg-slate-100 transition'}
    >
      <img className={'w-6 mr-4'} alt="Google login" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" />
      <span>Sign in with Google</span>
    </button>
  )
}

const SignIn: React.FC = () => {
  return (
    <>
      <Head>
        <title>sign in - fibers</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={'h-screen bg-slate-100'}>
        <header className={'absolute w-full'}>
          <div className="flex justify-between px-6 py-4">
            <Link href={'/'}>
              <Image src={'/logo-square-black.svg'} alt={'Fibers'} width={40} height={40}/>
            </Link>
            <ul className={'flex'}>
              <li><LoginButton/></li>
            </ul>
          </div>
        </header>

        <div className={'flex justify-center items-center py-40 px-4'}>
          <div className="container md:w-1/2 lg:w-1/3 mx-auto text-center py-10 bg-white rounded-lg">
            <div className="flex justify-center mb-10">
              <Image src={'/logo-full-black.svg'} alt={'Fibers'} width={200} height={100}/>
            </div>
            <div className="flex justify-center">
              <GoogleButton/>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignIn;