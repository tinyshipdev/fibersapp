import React from 'react';
import {signIn} from "next-auth/react";
import LoginButton from "./LoginButton";
import Link from "next/link";

const Homepage: React.FC = () => {
  return (
    <div>

      <div className="bg-slate-500">

        <header>
          <div className="flex justify-between px-6 py-4">
            <Link href={'/'}>fibers</Link>
            <ul className={'flex'}>
              <li><LoginButton/></li>
            </ul>
          </div>
        </header>

        <div className={'py-40'}>
          <div className={'container mx-auto'}>
            <div className="text-center text-slate-200">
              <h1 className={'text-4xl font-bold mb-4'}>Follow your thoughts, infinitely</h1>
              <p className={'mb-10'}>Fiber is an infinitely nested outliner to help you keep track of all your thoughts</p>
              <button
                className={'px-4 py-2 bg-sky-300 hover:bg-sky-400 rounded text-black'}
                onClick={() => signIn()}
              >Try for free*</button>
              <p className={'mt-2'}><small>*Fibers is currently in alpha and may change at any time</small></p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Homepage;