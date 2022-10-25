import React, {useEffect, useRef, useState} from 'react';

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

const OVERRIDDEN_KEYS = ['Tab', 'Enter'];

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
  const [keys, setKeys] = useState<{ [key: string]: boolean}>({});

  useEffect(() => {
    console.log(keys);
    if(keys['Shift'] && keys['Tab']) {
      onIndentLeft(id);
    } else if(keys['Tab']) {
      onIndentRight(id);
      return;
    } else if(keys['Enter']) {
      onAddTask(id);
      return;
    }
  }, [keys])

  function handleKeyDown(e:  React.KeyboardEvent<HTMLSpanElement>) {
    let k = {...keys};
    k[e.key] = true;
    setKeys(k);
  }

  function handleKeyUp(e:  React.KeyboardEvent<HTMLSpanElement>) {
    let k = {...keys};
    delete k[e.key];
    setKeys(k);
  }

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
        {/*<button onClick={() => onIndentLeft(id)}>Indent Left</button>*/}
        <span
          id={id}
          style={{ width: 100, display: 'inline-block'}}
          ref={ref}
          contentEditable={true}
          onBlur={() => {onChange(id, ref.current ? ref.current.innerText : value)}}
          onKeyDown={(e) => handleKeyDown(e)}
          onKeyUp={(e) => handleKeyUp(e)}
          suppressContentEditableWarning={true} // feels a bit dangerous but tired of warnings
        >{value}</span>
        {/*<button onClick={() => onAddTask(id)}>Add Task</button>*/}
        {/*<button onClick={() => onIndentRight(id)}>Indent Right</button>*/}
      </p>
      {graphMap}
    </li>
  );
};

export default Task;