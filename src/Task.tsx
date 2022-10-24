import React from 'react';
import {TaskData} from "./RootTask";

interface TaskProps extends TaskData {
  isRoot: boolean;
  onAddTask: (path: number[]) => void;
  onIndentRight: (path: number[]) => void;
  onIndentLeft: (path: number[]) => void;
}

const Task: React.FC<TaskProps> = ({
  id,
  value,
  path,
  isRoot,
  subtasks,
  onAddTask,
  onIndentRight,
  onIndentLeft,
}) => {

  if(isRoot) {
    return (
      <ul>
        {subtasks?.map((task) => (
          <Task
            key={task?.id}
            id={task?.id}
            value={task?.value}
            path={task?.path}
            isRoot={false}
            subtasks={task?.subtasks}
            onAddTask={(path) => onAddTask(path)}
            onIndentRight={(path) => onIndentRight(path)}
            onIndentLeft={(path) => onIndentLeft(path)}
          />
        ))}
      </ul>
    )
  }

  return (
    <li key={id}>
      <p>
        <button onClick={() => onIndentLeft(path)}>Indent Left</button>
        <span>----{ `${path}` }--{value}----</span>
        <button onClick={() => onAddTask(path)}>Add Task</button>
        {path[path.length - 1] > 0 && (
          <button onClick={() => onIndentRight(path)}>Indent Right</button>
        )}
      </p>
      <ul>
        {subtasks?.map((task) => (
          <Task
            key={task?.id}
            id={task?.id}
            value={task?.value}
            path={task?.path}
            isRoot={false}
            subtasks={task?.subtasks}
            onAddTask={(path) => onAddTask(path)}
            onIndentRight={(path) => onIndentRight(path)}
            onIndentLeft={(path) => onIndentLeft(path)}
          />
        ))}
      </ul>
    </li>
  );
};

export default Task;