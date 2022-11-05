import React, {useState} from "react";
import { marked } from 'marked';
import * as DOMPurify from "dompurify";

const renderer = new marked.Renderer();

renderer.image = function (text) {
  return text || '';
};

marked.setOptions({
  breaks: false,
  renderer: renderer
});

interface NodeInputProps {
  id: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
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

  return (
    <div
      onClick={() => {
        setIsFocused(true)
      }}
    >
      <div
        className={`absolute top-0 ${isFocused ? 'opacity-0' : 'opacity-100'}`}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(value))}}
      />
      <input
        className={`focus:outline-none w-full bg-inherit ${!isFocused ? 'opacity-0' : 'opacity-100'}`}
        id={id}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e)}
        onKeyDown={(e) => onKeyDown(e)}
        value={value}
        autoComplete={"off"}
      />
    </div>
  );
}

export default NodeInput;