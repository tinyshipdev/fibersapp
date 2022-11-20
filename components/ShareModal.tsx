import React, {useState} from 'react';
import Modal from "./Modal";
import {NodesInterface} from "./RootNode";
import {EnvelopeIcon, ShareIcon} from "@heroicons/react/24/outline";
import {cloneDeep} from "lodash";
import {doc, setDoc} from "firebase/firestore";
import firebase from "../lib/firebase-client";

interface Props {
  rootId: string;
  nodes: NodesInterface;
  userId: string;
  onShare: (newNodes: NodesInterface) => void;
}

function generateTree(curr: string, nodes: NodesInterface, tree: string[]) {
  if (nodes[curr].children.length === 0) {
    return tree;
  }

  for (let i = 0; i < nodes[curr].children.length; i++) {
    tree.push(nodes[curr].children[i]);
    generateTree(nodes[curr].children[i], nodes, tree);
  }

  return tree;
}

const ShareModal: React.FC<Props> = ({
                                       rootId,
                                       onShare,
                                       userId,
                                       nodes,
                                     }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [stage, setStage] = useState<'form' | 'link'>('form');
  const [newNodes, setNewNodes] = useState<NodesInterface>();

  async function handleShare(id: string, email: string, permissions: string[]) {
    if (!email || !permissions) {
      return null;
    }

    const updatedNodes = cloneDeep(nodes);
    // need to get all the nodes under id
    // we will send this array of ids to the backend,
    // the backend will then move the ids from nodes, to shared-nodes (or whatever we call it) along with permissions
    const tree = [id, ...generateTree(id, updatedNodes, [])];

    // get all the nodes from the tree

    // add these nodes to the shared-nodes collection
    // remove these nodes from the current users collection

    const nodesToShare: NodesInterface = {};
    for (let i = 0; i < tree.length; i++) {
      nodesToShare[tree[i]] = updatedNodes[tree[i]];
    }

    await setDoc(doc(firebase.db, 'shared-nodes', id), {
      owner: userId,
      collaborators: {
        [email]: {
          permissions
        }
      },
      nodes: nodesToShare
    });

    // delete these nodes from the current users private nodes
    for (let i = 0; i < tree.length; i++) {
      delete updatedNodes[tree[i]];
    }

    updatedNodes[id] = {
      shared: true,
      parent: nodes[id].parent,
      children: [],
      isExpanded: true,
      value: ''
    };

    return updatedNodes;
  }

  async function handleSubmit() {
    if (!email || permissions.size === 0) {
      return;
    }
    const newNodes = await handleShare(rootId, email, Array.from(permissions));

    if(newNodes) {
      setNewNodes(newNodes);
      setStage('link');
    }
  }

  function handleCheckboxChange(key: string) {
    const newPermissions = new Set(permissions);
    if (newPermissions.has(key)) {
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
          if(newNodes) {
            onShare(newNodes);
          }
          setIsOpen(false);
        }}
      >

        {stage === 'form' && (
          <div>
            <div className={'mb-4'}>
              <p>Invite someone to join!</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              await handleSubmit()
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
          </div>
        )}

        {stage === 'link' && (
          <div className={'text-center'}>
            <p className={'mb-2'}>Share this URL to the users you invited</p>
            <a href={`${window.location.href}join?nid=${rootId}`} className={'font-bold text-cyan-500'}>{window.location.href}join?nid={rootId}</a>
          </div>
        )}

      </Modal>
      <button onClick={() => setIsOpen(true)}>
        <ShareIcon className={'w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
      </button>
    </>
  );
};

export default ShareModal;