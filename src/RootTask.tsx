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
    id: 'root',
    value: 'root',
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

  // function findTask(path: number[]) {
  //   const newTasks = [...tasks];
  //
  //   let item: any = newTasks[path[0]];
  //
  //   for(let i = 1; i < path.length; i++) {
  //     item = item['subtasks'][path[i]];
  //   }
  //
  //   return item;
  // }

  function findTaskParent(newTasks: TaskData[], path: number[]) {

    let items: any = newTasks[path[0]];

    for(let i = 1; i < path.length - 1; i++) {
      items = items['subtasks'][path[i]];
    }

    return items;
  }


  function addTask(path: number[]) {
    const newTasks = [...tasks];
    const newPath = [...path];

    const parent: TaskData = findTaskParent(newTasks, newPath);

    // we don't want to push to end of array, we want to push in-between the current element
    const insertAfter = newPath[newPath.length - 1];
    newPath[newPath.length - 1] += 1;

    parent.subtasks.splice(insertAfter + 1, 0, {
      id: 'test1234'+Math.random(),
      value: 'dynamic'+Math.random(),
      path: newPath,
      subtasks: []
    });

    // recompute the last digit in path array to keep it up to date for new list
    for(let i = insertAfter + 1; i < parent.subtasks.length; i++) {
      let p = parent.subtasks[i].path;
      p[p.length - 1] = i;
      parent.subtasks[i].path = p;
    }

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
            isRoot={true}
            path={task?.path}
            subtasks={task?.subtasks}
            onAddTask={(path) => addTask(path)}
          />
        ))}
      </ul>
    </div>
  );
};

export default RootTask;