import React, {useState} from 'react';
import {signOut, useSession} from "next-auth/react";
import {UserCircleIcon} from "@heroicons/react/24/outline";

const UserButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className={'relative'}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {session?.user?.image && session?.user?.name ? (
          <img src={session?.user?.image} alt={session?.user?.name} width={20} height={20} className={'rounded-full'}/>
        ) : (
          <UserCircleIcon className={'w-4 w-4 text-slate-500'}/>
        )}
      </button>
      {isOpen && (
        <div className={'absolute w-40 top-10 border bg-white border-slate-400 px-3 py-1 right-0 text-left drop-shadow rounded text-slate-600'}>
        <button
          className={'w-full text-left'}
          onClick={() => signOut()}
        >Sign out</button>
        </div>
      )}
    </div>
  );
};

export default UserButton;