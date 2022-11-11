import React, {useState} from 'react';
import Modal from "./Modal";

const ShareModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        Invite user
      </Modal>
    </>
  );
};

export default ShareModal;