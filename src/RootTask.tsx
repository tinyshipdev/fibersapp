import React, {useState} from 'react';
import Task from "./Task";

export interface TaskData {
  id: string;
  value: string;
  path: number[];
  subtasks: TaskData[];
}

const DEFAULT_TASKS: TaskData[] = [
  {
    id: 'test',
    value: 'test',
    path: [0],
    subtasks: [
      {
        id: 'test2',
        value: 'test2',
        path: [0,0],
        subtasks: [
          {
            id: 'test3',
            value: 'test3',
            path:[0,0,0],
            subtasks: []
          },
          {
            id: 'test4',
            value: 'test4',
            path: [0,0,1],
            subtasks: []
          }
        ]
      }
    ]
  }
]

const RootTask: React.FC = () => {
  const [tasks, setTasks] = useState<TaskData[]>(DEFAULT_TASKS);

  function addTask(path: number[]) {
    const newTasks = [...tasks];

    let item: any = newTasks[path[0]];

    for(let i = 1; i < path.length; i++) {
      item = item['subtasks'][path[i]];
    }

    item['subtasks'].push({
      id: 'test1234'+Math.random(),
      value: 'dynamic'+Math.random(),
      path: [...path, 0],
      subtasks: []
    });

    setTasks(newTasks);
  }

  return (
    <div>
      <ul>
        {tasks?.map((task) => (
          <Task
            key={task?.id}
            id={task?.value}
            value={task?.value}
            path={task?.path}
            subtasks={task?.subtasks}
            onAddSubTask={(id) => addTask(id)}
          />
        ))}
      </ul>
    </div>
  );
};

export default RootTask;