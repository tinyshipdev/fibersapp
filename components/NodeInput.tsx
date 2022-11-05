import React, {useState} from "react";
import parseMarkdown from '../lib/markdown-parser';
import SlashCommands from "./SlashCommands";

interface NodeInputProps {
  id: string,
  onChange: (value: string) => void,
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
  value: string
}

const NodeInput: React.FC<NodeInputProps> = ({
  id,
  onChange,
  onKeyDown,
  value,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSlashCommands, setShowSlashCommands] = useState(false);

  return (
    <div
      onClick={() => {
        setIsFocused(true)
      }}
    >
      {showSlashCommands && (
        <div
          className={'absolute bottom-4 border bg-white p-4 drop-shadow'}
        >
          <SlashCommands
            onComplete={(val) => {
              if(val) {
                onChange(value.substring(0, value.length - 1) + val);
              }
              setShowSlashCommands(false);
            }}
          />
        </div>
      )}
      <div
        className={`node-input absolute top-0 ${isFocused ? 'opacity-0' : 'opacity-100'}`}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
        onBlur={() => setIsFocused(false)}
      />
      <input
        className={`focus:outline-none w-full bg-inherit ${!isFocused ? 'opacity-0' : 'opacity-100'}`}
        id={id}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onKeyDown={(e
        ) => {
          // this is messy as shit, i'm working on it lol

          if(e.key === '/') {
            setShowSlashCommands(true);
            return;
          }

          if(showSlashCommands) {
            if(e.key === 'ArrowUp') {
              e.preventDefault();
              return;
            }

            if(e.key === 'ArrowDown') {
              e.preventDefault();
              return;
            }

            if(e.key === 'Enter') {
              e.preventDefault();
              return;
            }

            setShowSlashCommands(false);
          }

          onKeyDown(e);
        }}
        value={value}
        autoComplete={"off"}
      />
    </div>
  );
}

export default NodeInput;