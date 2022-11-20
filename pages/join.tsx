import React, {useEffect, useState} from 'react';
import {useRouter} from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import LoginButton from "../components/LoginButton";
import firebase from "../lib/firebase-client";
import {doc, getDoc, arrayUnion, updateDoc} from "firebase/firestore";
import {onAuthStateChanged} from "firebase/auth";
import {ArrowPathIcon} from "@heroicons/react/24/outline";

const Join: React.FC = () => {
  const router = useRouter();
  const user = firebase.auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

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
  }, []);

  async function join() {
    const joinNodeId = router?.query.nid as string;

    if(typeof joinNodeId !== 'string') {
      return;
    }

    if(!user) {
      return;
    }

    const nodesRef = await getDoc(doc(firebase.db, 'nodes', user.uid));
    const nodesData = nodesRef.data();

    if(!nodesData) {
      return;
    }

    const nodes = nodesData.data;

    // if we've already joined this node, don't do anything
    if(nodes.hasOwnProperty(joinNodeId)) {
      return;
    }

    try {
      // see if this is a valid node id
      await getDoc(doc(firebase.db, 'shared-nodes', joinNodeId));

      // if we were able to test the nodeId, then we can add it to our own nodes
      await updateDoc(doc(firebase.db, 'nodes', userData.uid), {
        'data.root.children': arrayUnion(joinNodeId),
        [`data.${joinNodeId}`]: {
          children: [],
          value: '',
          isExpanded: true,
          parent: 'root',
          shared: true
        }
      });

      window.location.href = '/';
    } catch (err) {
      console.log(err);
      setHasError(true);
    }
  }

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

  if(!user) {
    return <p>page not found</p>;
  }

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
            <div className="flex justify-center">
              {!hasError ? (
                <button onClick={async () => await join()}>Join</button>
              ) : (
                <p>Invalid join code.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Join;