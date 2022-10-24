import React from 'react';
import {TaskData} from "./RootTask";

interface TaskProps {
  id: string;
  value: string;
  path: number[];
  subtasks: TaskData[];
  onAddSubTask: (path: number[]) => void;
}

const Task: React.FC<TaskProps> = ({
  id,
  value,
  path,
  subtasks,
  onAddSubTask
}) => {
  return (
    <li key={id}>
      <p>{ value }</p>
      <ul>
        {subtasks?.map((task) => (
          <Task
            key={task?.id}
            id={task?.id}
            value={task?.value}
            path={task?.path}
            subtasks={task?.subtasks}
            onAddSubTask={(path) => onAddSubTask(path)}
          />
        ))}
      </ul>
      <button onClick={() => onAddSubTask(path)}>Add Subtask</button>
    </li>
  );
};

export default Task;