import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebase from "../lib/firebase-client";

const provider = new GoogleAuthProvider();

const Playground: React.FC = () => {

  function loginWithGoogle() {
    signInWithPopup(firebase.auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential: any = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        console.log(user);
        // ...
      }).catch((error) => {
      // // Handle Errors here.
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // // The email of the user's account used.
      // const email = error.customData.email;
      // // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
  }

  return (
    <div>
      <button onClick={() => loginWithGoogle()}>Sign inwith google</button>
    </div>
  );
};

export default Playground;