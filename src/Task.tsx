import React from 'react';

interface TaskNodeProps {
  id: string;
  value: string;
  graph: any;
  nodes: any;
  onAddTask: (id: string) => void;
  onIndentRight: (id: string) => void;
  onIndentLeft: (id: string) => void;
}


const Task: React.FC<TaskNodeProps> = ({
  id,
  value,
  graph,
  nodes,
  onAddTask,
  onIndentRight,
  onIndentLeft,
}) => {

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
        <span>{value}</span>
        <button onClick={() => onAddTask(id)}>Add Task</button>
        <button onClick={() => onIndentRight(id)}>Indent Right</button>
      </p>
      {graphMap}
    </li>
  );
};

export default Task;