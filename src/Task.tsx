import React, {useRef} from 'react';

interface TaskNodeProps {
  id: string;
  value: string;
  graph: any;
  nodes: any;
  onAddTask: (id: string) => void;
  onIndentRight: (id: string) => void;
  onIndentLeft: (id: string) => void;
  onChange: (id: string, value: string) => void;
}


const Task: React.FC<TaskNodeProps> = ({
  id,
  value,
  graph,
  nodes,
  onAddTask,
  onIndentRight,
  onIndentLeft,
  onChange,
}) => {

  const ref = useRef<HTMLSpanElement>(null);

  const graphMap = (
    <ul>
      {graph[id]?.map((n: any) => (
        <Task
          key={n}
          id={n}
          value={nodes[n].value}
          graph={graph}
          nodes={nodes}
          onAddTask={(id) => onAddTask(id)}
          onIndentRight={(id) => onIndentRight(id)}
          onIndentLeft={(id) => onIndentLeft(id)}
          onChange={(id, value) => onChange(id, value)}
        />
      ))}
    </ul>
  )

  if(id === 'root') {
    return graphMap;
  }

  return (
    <li key={id}>
      <p>
        <button onClick={() => onIndentLeft(id)}>Indent Left</button>
        <span
          ref={ref}
          contentEditable
          onBlur={() => onChange(id, ref.current ? ref.current.innerText : value)}
          suppressContentEditableWarning={true} // feels a bit dangerous but tired of warnings
        >{value}</span>
        <button onClick={() => onAddTask(id)}>Add Task</button>
        <button onClick={() => onIndentRight(id)}>Indent Right</button>
      </p>
      {graphMap}
    </li>
  );
};

export default Task;