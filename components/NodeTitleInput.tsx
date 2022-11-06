import React, {useState} from "react";
import parseMarkdown from '../lib/markdown-parser';

interface Props {
  onChange: (value: string) => void,
  placeholder?: string;
  value: string
}

const NodeTitleInput: React.FC<Props> = ({
  onChange,
  placeholder,
  value,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={'relative text-xl'}
      onClick={() => {
        setIsFocused(true)
      }}
      onBlur={() => setIsFocused(false)}
    >
    <div
      className={`absolute top-0 ${isFocused ? 'opacity-0' : 'opacity-100'}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
      onBlur={() => setIsFocused(false)}
    />
    <input
      className={`mb-6 focus:outline-none w-full ${!isFocused ? 'opacity-0' : 'opacity-100'}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
    </div>
  );
}

export default NodeTitleInput;