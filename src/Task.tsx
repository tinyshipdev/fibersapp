import React, {useRef} from 'react';
import {NodesInterface, TaskGraphInterface} from "./RootTask";

interface TaskNodeProps {
  id: string;
  value: string;
  graph: TaskGraphInterface;
  nodes: NodesInterface;
  onChange: (id: string, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onKeyUp: (e: React.KeyboardEvent) => void;
  onFocus: (id: string) => void;
  onExpand: (id: string) => void;
  onCollapse: (id: string) => void;
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
  onExpand,
  onCollapse,
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  const graphMap = (
    <ul className={'list-disc'}>
      {graph[id]?.children?.map((n: any) => (
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
          onExpand={(id) => onExpand(id)}
          onCollapse={(id) => onCollapse(id)}
        />
      ))}
    </ul>
  )

  if(id === 'root') {
    return graphMap;
  }

  if(!graph[id].isExpanded) {
    return (
      <li key={id} className={'ml-10'}>
        <button className={'bg-red-400'} onClick={() => onExpand(id)}>Expand</button>
        <p className={'text-slate-400'}><span>{value}</span></p>
      </li>
    )
  }

  return (
    <li key={id} className={'ml-10'}>
      <p>
        <button className={'bg-red-400'} onClick={() => onCollapse(id)}>Collapse</button>
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