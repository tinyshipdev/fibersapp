import React from 'react';
import {TaskData} from "./RootTask";

interface TaskProps {
  id: string;
  value: string;
  path: number[];
  isRoot: boolean;
  subtasks: TaskData[];
  onAddTask: (path: number[]) => void;
}

const Task: React.FC<TaskProps> = ({
  id,
  value,
  path,
  subtasks,
  onAddTask,
  isRoot,
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
          />
        ))}
      </ul>
    )
  }

  return (
    <li key={id}>
      <p>{ `${path}` } --- { value }</p>
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
          />
        ))}
      </ul>
      <button onClick={() => onAddTask(path)}>Add Task</button>
    </li>
  );
};

export default Task;