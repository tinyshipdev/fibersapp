import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

function App({
   Component,
   pageProps: { session, ...pageProps },
 }: AppProps) {
  return (
    <DndProvider debugMode={true} backend={HTML5Backend}>
      <div>
        <Component {...pageProps} />
        <div id={"modal"}/>
      </div>
    </DndProvider>
  )
}

export default App