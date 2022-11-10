import '../styles/globals.css'
import type { AppProps } from 'next/app'

function App({
   Component,
   pageProps: { session, ...pageProps },
 }: AppProps) {
  return (
    <div>
      <Component {...pageProps} />
      <div id={"modal"}/>
    </div>
  )
}

export default App