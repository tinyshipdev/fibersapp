import React from 'react';
import dynamic from "next/dynamic";

const RootNode = dynamic(() => import('../src/RootNode'), { ssr: false });

function App() {
  return (
    <div
      className="App font-sans"
      onKeyDown={(e) => {
        if(e.metaKey && e.key === 'z') {
          e.preventDefault();
        }

        if(e.shiftKey && e.key === 'Tab') {
          e.preventDefault();
        }
      }}
    >
      <RootNode/>
    </div>
  );
}

export default App;
