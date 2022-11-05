import React from 'react';
import InsertTodayDate from "./SlashCommands/InsertTodayDate";

interface SlashCommandsProps {
  onSelect: (value: string) => void;
  onClose: () => void;
}

const SlashCommands: React.FC<SlashCommandsProps> = ({
  onSelect,
  onClose,
}) => {
  return (
    <div>
      <InsertTodayDate
        onSelect={(value) => {
          onSelect(value);
          onClose();
        }}
      />
    </div>
  );
};

export default SlashCommands;