import React, {useState} from 'react';
import Modal from "./Modal";
import {NodesInterface} from "./RootNode";
import {ShareIcon} from "@heroicons/react/24/outline";

interface Props {
  rootId: string;
  nodes: NodesInterface;
  userId: string;
  onShare: () => void;
}

const ShareModal: React.FC<Props> = ({
  rootId,
  onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <p>Invite user to {rootId}</p>
        <p><button onClick={() => onShare()}>get share tree</button></p>
      </Modal>
      <button onClick={() => setIsOpen(true)}>
        <ShareIcon className={'w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
      </button>
    </>
  );
};

export default ShareModal;