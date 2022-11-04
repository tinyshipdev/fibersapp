import {getCsrfToken, getProviders, getSession, signIn} from "next-auth/react"

const GoogleButton = ({ id }) => {
  return (
    <button
      onClick={() => signIn(id)}
      className={'flex items-center border border-blue-600 px-4 py-3'}
    >
      <img className={'w-6 mr-4'} alt="Google login" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" />
      <span>Sign in with Google</span>
    </button>
  )
}

export default function SignIn({providers}) {
  return (
    <div>
      <div className="container mx-auto text-center py-20">
        <h2 className={'text-2xl font-bold mb-6'}>Fibers</h2>
        {Object.values(providers).map((provider) => (
          <div key={provider.name} className={'flex justify-center'}>
            {provider.id === 'google' ? <GoogleButton id={provider.id}/> : null}
          </div>
        ))}
      </div>
    </div>
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