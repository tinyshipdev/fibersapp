import React, {useState} from 'react';
import {UserCircleIcon} from "@heroicons/react/24/outline";
import firebase from "../lib/firebase-client";

const UserButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = firebase.auth.currentUser;

  return (
    <div className={'relative flex items-center'}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {user?.photoURL ? (
          <img src={user?.photoURL} alt={user?.displayName || ''} width={20} height={20} className={'rounded-full'}/>
        ) : (
          <UserCircleIcon className={'w-4 w-4 text-slate-500'}/>
        )}
      </button>
      {isOpen && (
        <div className={'absolute w-40 top-10 border bg-white border-slate-400 px-3 py-1 right-0 text-left drop-shadow rounded text-slate-600'}>
        <button
          className={'w-full text-left'}
          onClick={() => firebase.auth.signOut().then(() => location.href = '/')}
        >Sign out</button>
        </div>
      )}
    </div>
  );
};

export default UserButton;