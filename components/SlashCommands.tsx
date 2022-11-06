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
    <div className={'flex flex-col rounded'}>
      {plugins?.map((plugin, index) => {
        return (
          <div
            key={plugin.id}
            className={`${index !== plugins.length - 1 ? 'mb-2' : ''}`}
          >
            <plugin.component
              onComplete={(value) => onComplete(value)}
              launcher={(handleClick) => (
                <button
                  className={'p-4 hover:bg-slate-100'}
                  onClick={() => handleClick()}>
                  {plugin.name}
                </button>
              )}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SlashCommands;