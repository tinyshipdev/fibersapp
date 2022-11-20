import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

function App({
   Component,
   pageProps: { session, ...pageProps },
 }: AppProps) {
  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <Component {...pageProps} />
        <div id={"modal"}/>
      </DndProvider>
    </div>
  )
}

export default App