import React from 'react';
import dynamic from "next/dynamic";
const RootNode = dynamic(() => import('../components/RootNode'), { ssr: false });

interface Props {
  userId: string;
}

const AppRoot: React.FC<Props> = ({
  userId
}) => {
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
      <RootNode userId={userId}/>
    </div>
  );
};

export default AppRoot;