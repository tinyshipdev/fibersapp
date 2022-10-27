import React, {useRef} from 'react';
import {ACTION_KEYS, NodesInterface, TaskGraphInterface} from "./RootTask";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/20/solid";

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
  onDelete: (id: string) => void;
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
  onDelete,
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  const graphMap = (
    <ul className={'list-none'}>
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
          onDelete={(id) => onDelete(id)}
        />
      ))}
    </ul>
  )

  if(id === 'root') {
    return graphMap;
  }

  const textSpan = (
    <span
      className={'focus:outline-none inline-block w-full'}
      id={id}
      ref={ref}
      contentEditable={true}
      onFocus={() => onFocus(id)}
      onBlur={(e) => onChange(id, e.currentTarget.innerText)}
      onKeyDown={(e) => {
        // this forces the text to be saved to state if we move
        if(ACTION_KEYS.includes(e.key)) { onChange(id, e.currentTarget.innerText) }
        onKeyDown(e);

        if(e.key === 'Backspace' && e.currentTarget.innerText === '') {
          onDelete(id);
        }
      }}
      onKeyUp={(e) => onKeyUp(e)}
      suppressContentEditableWarning={true} // feels a bit dangerous but tired of warnings
    >{value}</span>
  );

  return (
    <li key={id} className={'ml-10'}>
      <p className={'flex items-center mb-2'}>
        {graph[id].isExpanded && graph[id].children.length > 0 ? (
          <button className={'w-6 h-6 text-slate-400 hover:text-black'} onClick={() => onCollapse(id)}>
            <ChevronDownIcon/>
          </button>
        ) : (
          <button className={`w-6 h-6 ${graph[id].children.length > 0 ? 'text-slate-400 hover:text-black' : 'text-slate-200'}`} onClick={() => onExpand(id)}>
            <ChevronRightIcon/>
          </button>
        )}
        {textSpan}
      </p>
      {graph[id].isExpanded && graph[id].children.length > 0 && graphMap}
    </li>
  );
};

export default Task;