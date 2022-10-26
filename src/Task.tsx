import React, {useRef} from 'react';

interface TaskNodeProps {
  id: string;
  value: string;
  graph: any;
  nodes: any;
  onChange: (id: string, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onKeyUp: (e: React.KeyboardEvent) => void;
  onFocus: (id: string) => void;
}

const Task: React.FC<TaskNodeProps> = ({
  id,
  value,
  graph,
  nodes,
  onChange,
  onKeyDown,
  onKeyUp,
  onFocus,
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  const graphMap = (
    <ul className={'list-disc'}>
      {graph[id]?.map((n: any) => (
        <Task
          key={n}
          id={n}
          value={nodes[n].value}
          graph={graph}
          nodes={nodes}
          onChange={(id, value) => onChange(id, value)}
          onKeyDown={(e) => onKeyDown(e)}
          onKeyUp={(e) => onKeyUp(e)}
          onFocus={(id) => onFocus(id)}
        />
      ))}
    </ul>
  )

  if(id === 'root') {
    return graphMap;
  }

  return (
    <li key={id} className={'ml-10'}>
      <p>
        <span
          className={'focus:outline-none inline-block'}
          id={id}
          ref={ref}
          contentEditable={true}
          onFocus={() => onFocus(id)}
          onInput={(e) => {
            onChange(id, e.currentTarget.innerText);
          }}
          onKeyDown={(e) => onKeyDown(e)}
          onKeyUp={(e) => onKeyUp(e)}
          suppressContentEditableWarning={true} // feels a bit dangerous but tired of warnings
        >{value}</span>
      </p>
      {graphMap}
    </li>
  );
};

export default Task;