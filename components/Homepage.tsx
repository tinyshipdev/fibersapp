import React from 'react';
import {signIn} from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const Homepage: React.FC = () => {
  return (
    <div>

      <div className="bg-slate-500">

        <header>
          <div className="flex justify-between px-6 py-4">
            <Link href={'/'}>
              <Image src={'/logo-full-white.svg'} alt={'Fibers'} width={120} height={40}/>
            </Link>
            <ul className={'flex'}>
              <li>
                <button className={'text-white'} onClick={() => signIn()}>Sign in</button>
              </li>
            </ul>
          </div>
        </header>

        <div className={'pt-20 pb-60'}>
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

      <div className={'px-20 container mx-auto -top-40 relative'}>
        <div className="video-container">
          <iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/dU2GTuJ38Yw?autoplay=1"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen></iframe>
        </div>
      </div>

    </div>
  );
};

export default Homepage;