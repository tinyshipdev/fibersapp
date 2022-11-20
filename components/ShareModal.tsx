import React, {useState} from 'react';
import Modal from "./Modal";
import {NodesInterface} from "./RootNode";
import {EnvelopeIcon, ShareIcon} from "@heroicons/react/24/outline";

interface Props {
  rootId: string;
  nodes: NodesInterface;
  userId: string;
  onShare: (rootId: string, email: string, permissions: string[]) => void;
}

const ShareModal: React.FC<Props> = ({
 rootId,
 onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  function handleSubmit() {
    if(!email || permissions.size === 0) {
      return;
    }
    onShare(rootId, email, Array.from(permissions));
  }

  function handleCheckboxChange(key: string) {
    const newPermissions = new Set(permissions);
    if(newPermissions.has(key)) {
      newPermissions.delete(key);
    } else {
      newPermissions.add(key);
    }
    setPermissions(newPermissions);
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >

        <div className={'mb-4'}>
          <p>Invite someone to join!</p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <EnvelopeIcon className={'h-5 w-5 text-gray-400'}/>
              </div>
              <input type="email" name="email" id="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                     placeholder="you@example.com"/>
            </div>
          </div>

          <fieldset className="space-y-5">
            <legend className="sr-only">View</legend>
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input id="comments" aria-describedby="comments-description" name="comments" type="checkbox"
                       className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                       checked={permissions.has('view')}
                       onChange={() => handleCheckboxChange('view')}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="comments" className="font-medium text-gray-700">View</label>
                <p id="comments-description" className="text-gray-500">Allow user to view nodes</p>
              </div>
            </div>
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox"
                       className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                       checked={permissions.has('edit')}
                       onChange={() => handleCheckboxChange('edit')}/>
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="candidates" className="font-medium text-gray-700">Edit</label>
                <p id="candidates-description" className="text-gray-500">Allow user to edit nodes</p>
              </div>
            </div>
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input id="offers" aria-describedby="offers-description" name="offers" type="checkbox"
                       className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                       checked={permissions.has('delete')}
                       onChange={() => handleCheckboxChange('delete')}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="offers" className="font-medium text-gray-700">Delete</label>
                <p id="offers-description" className="text-gray-500">Allow user to delete nodes</p>
              </div>
            </div>
          </fieldset>

          <div className={'mt-6'}>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Invite
            </button>
          </div>

        </form>
      </Modal>
      <button onClick={() => setIsOpen(true)}>
        <ShareIcon className={'w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
      </button>
    </>
  );
};

export default ShareModal;