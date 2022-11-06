import {getCsrfToken, getProviders, getSession, signIn} from "next-auth/react"
import LoginButton from "../../components/LoginButton";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

const GoogleButton = ({ id }) => {
  return (
    <button
      onClick={() => signIn(id)}
      className={'flex items-center border border-slate-300 px-4 py-3 hover:bg-slate-200 transition'}
    >
      <img className={'w-6 mr-4'} alt="Google login" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" />
      <span>Sign in with Google</span>
    </button>
  )
}

export default function SignIn({providers}) {
  return (
    <>
      <Head>
        <title>sign in - fibers</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={'h-screen bg-slate-200'}>
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
          <div className="container md:w-1/2 lg:w-1/3 mx-auto text-center py-10 bg-slate-100 rounded-lg">
            <div className="flex justify-center mb-10">
              <Image src={'/logo-full-black.svg'} alt={'Fibers'} width={200} height={100}/>
            </div>
            {/*<h2 className={'text-2xl font-bold mb-6'}>Sign in</h2>*/}
            {Object.values(providers).map((provider) => (
              <div key={provider.name} className={'flex justify-center'}>
                {provider.id === 'google' ? <GoogleButton id={provider.id}/> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const { req } = context;
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: { destination: "/" },
    };
  }

  return {
    props: {
      providers: await getProviders(),
      csrfToken: await getCsrfToken(context)
    },
  }
}