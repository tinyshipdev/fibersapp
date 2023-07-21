import React from 'react';
import InsertTodayDate from "../plugins/commands/insert-today-date";
import {CalendarDaysIcon} from "@heroicons/react/24/outline";

interface SlashCommandsProps {
  onComplete: (value: string) => void;
}

const plugins = [
  {
    id: InsertTodayDate.id,
    name: InsertTodayDate.name,
    component: InsertTodayDate.component
  },
];

const SlashCommands: React.FC<SlashCommandsProps> = ({
  onComplete,
}) => {
  return (
    <div className={'flex flex-col rounded p-2'} id={'commands'}>
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
                  className={'p-2 hover:bg-slate-100 rounded'}
                  onClick={() => handleClick()}>
                  <span className="flex items-center">
                    <span className={'mr-2'}><CalendarDaysIcon className={'w-4 h-4'}/></span>
                    <span>{plugin.name}</span>
                  </span>
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