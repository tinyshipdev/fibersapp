import React from 'react';
import LoginButton from "./LoginButton";

const Homepage: React.FC = () => {
  return (
    <div>
      <div className={'container mx-auto'}>
        <div className="py-20 text-center">
          <h1 className={'text-2xl font-bold mb-6'}>Fibers</h1>
          <LoginButton/>
        </div>
      </div>
    </div>
  );
};

export default Homepage;