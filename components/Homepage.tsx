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
            <Link href={'/'}>logo</Link>
            <ul className={'flex'}>
              <li><LoginButton/></li>
            </ul>
          </div>
        </header>

        <div className={'py-40'}>
          <div className={'container mx-auto'}>
            <div className="text-center text-slate-200">
              <h1 className={'text-2xl font-bold mb-2'}>Fibers</h1>
              <p className={'text-xl mb-10'}>Follow your thoughts, infinitely</p>
              <button
                className={'px-4 py-2 bg-cyan-300 rounded text-black'}
                onClick={() => signIn()}
              >Get Started</button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Homepage;