import React from 'react';
import InsertTodayDate from "../plugins/commands/insert-today-date";
// import ExampleModalCommand from "../plugins/commands/example-modal-command";

interface SlashCommandsProps {
  onComplete: (value: string) => void;
}

const plugins = [
  {
    id: InsertTodayDate.id,
    name: InsertTodayDate.name,
    component: InsertTodayDate.component
  },
  // {
  //   id: ExampleModalCommand.id,
  //   name: ExampleModalCommand.name,
  //   component: ExampleModalCommand.component
  // }
];

const SlashCommands: React.FC<SlashCommandsProps> = ({
  onComplete,
}) => {
  return (
    <div className={'flex flex-col'}>
      {plugins?.map((plugin, index) => {
        return (
          <div className={`${index !== plugins.length - 1 ? 'mb-2' : ''}`}>
            <plugin.component
              key={plugin.id}
              onComplete={(value) => onComplete(value)}
              launcher={(handleClick) => (
                <button onClick={() => handleClick()}>{plugin.name}</button>
              )}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SlashCommands;