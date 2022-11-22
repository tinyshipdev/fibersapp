import React, {useEffect, useState} from "react";
import parseMarkdown from '../lib/markdown-parser';

interface Props {
  onChange: (value: string) => void,
  onDebounceChange: (value: string) => void;
  placeholder?: string;
  value: string
}

const NodeTitleInput: React.FC<Props> = ({
  onChange,
  onDebounceChange,
  placeholder,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if(isMounted) {
        onDebounceChange(value);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [debouncedValue]);

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
      onChange={(e) => {
        setDebouncedValue(e.target.value);
        onChange(e.target.value);
      }}
    />
    </div>
  );
}

export default NodeTitleInput;