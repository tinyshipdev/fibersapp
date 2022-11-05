import React, {useState} from 'react';
import Modal from "../../components/Modal";

interface Props {
  launcher: (handleClick: () => void) => JSX.Element;
  onComplete: (value: string) => void;
}

const ExampleModalCommand: React.FC<Props> = ({
  launcher,
  onComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          onComplete('')
        }}
      >
        WIP
      </Modal>
      {launcher(() => setIsOpen(true))}
    </>
  );
};

export default {
  id: 'example-modal-command',
  name: 'Example Modal Command',
  component: ExampleModalCommand
}