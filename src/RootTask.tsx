import React, {useEffect, useLayoutEffect, useState} from 'react';
import { nanoid } from 'nanoid'
import Task from "./Task";

export type TaskGraphInterface = {
  [key: string]: { isExpanded: boolean, children: string[] }
}

export type TaskParentMapInterface = { [key: string]: string }

export type NodesInterface = { [key: string]: { value: string }}

const DEFAULT_GRAPH: TaskGraphInterface = {
  'root': { isExpanded: true, children: ['one'] },
  'one': { isExpanded: true, children: ['two', 'three'] },
  'two': { isExpanded: false, children: ['five'] },
  'three': { isExpanded: true, children: [] },
  'five': { isExpanded: true, children: [] }
}

const DEFAULT_PARENT_GRAPH: TaskParentMapInterface = {
  'root': '',
  'one': 'root',
  'two': 'one',
  'three': 'one',
  'five': 'two'
}

const DEFAULT_NODES: NodesInterface = {
  'root': {
    value: 'root'
  },
  'one': {
    value: 'one'
  },
  'two': {
    value: 'two'
  },
  'three': {
    value: 'three'
  },
  'five': {
    value: 'five'
  }
}

function setCaret(id: string, pos: number) {
  const el: any = document.getElementById(id);
  const range: any = document.createRange()
  const sel: any = window.getSelection()

  if(el.childNodes[0]) {
    range.setStart(el.childNodes[0], pos)
    range.collapse(true)

    sel.removeAllRanges()
    sel.addRange(range)
  }
}

function refocusInput(id: string, pos: number) {
  setTimeout( () => {
    const element = document.getElementById(id);

    if(element) {
      element.focus();
      setCaret(id, pos)
    }
  }, 10)
}

function getDefaultTaskGraph() {
  if(window.localStorage.getItem('tasks')) {
    return JSON.parse(window.localStorage.getItem('tasks') || '')?.taskGraph;
  } else {
    return DEFAULT_GRAPH;
  }
}

function getDefaultParentMap() {
  if(window.localStorage.getItem('tasks')) {
    return JSON.parse(window.localStorage.getItem('tasks') || '')?.parentMap;
  } else {
    return DEFAULT_PARENT_GRAPH;
  }
}

function getDefaultNodes() {
  if(window.localStorage.getItem('tasks')) {
    return JSON.parse(window.localStorage.getItem('tasks') || '')?.nodes;
  } else {
    return DEFAULT_NODES;
  }
}

function saveState(taskGraph: TaskGraphInterface, parentMap: TaskParentMapInterface, nodes: NodesInterface) {
  window.localStorage.setItem('tasks', JSON.stringify({
    taskGraph,
    parentMap,
    nodes
  }));
}

const OVERRIDDEN_KEYS = ['Tab', 'Enter'];

const RootTask: React.FC = () => {
  const [taskGraph, setTaskGraph] = useState<TaskGraphInterface>(() => getDefaultTaskGraph());
  const [parentMap, setParentMap] = useState<TaskParentMapInterface>(() => getDefaultParentMap());
  const [nodes, setNodes] = useState<NodesInterface>(() => getDefaultNodes());
  const [keys, setKeys] = useState<{ [key: string]: boolean}>({});
  const [currentTaskId, setCurrentTaskId] = useState('');

  const caretOffset = window?.getSelection()?.anchorOffset || 0;

  /**
   * I'm not sure how this works, but somehow it's working perfectly
   * it saves every second, but only if you're not editing.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      saveState(taskGraph, parentMap, nodes);
    }, 1000);

    return () => {
      clearTimeout(timer);
    }
  }, [nodes, parentMap, taskGraph]);

  // weird thing to handle keeping the caret and the end when typing
  useLayoutEffect(() => {
    if(currentTaskId) {
      setCaret(currentTaskId, nodes[currentTaskId].value.length)
    }
  }, [currentTaskId, nodes]);

  useLayoutEffect(() => {
    if(keys['Shift'] && keys['Tab']) {
      indentLeft(currentTaskId);
    } else if(keys['Tab']) {
      indentRight(currentTaskId);
    } else if(keys['Enter']) {
      addTask(currentTaskId);
    }
  }, [keys]) // TODO: fix this deps array warning, it breaks whatever i try lol

  function handleKeyDown(e:  React.KeyboardEvent) {
    if(OVERRIDDEN_KEYS.includes(e.key)) {
      e.preventDefault();
    }

    if(!keys[e.key]) {
      let k = {...keys};
      k[e.key] = true;
      setKeys(k);
    }
  }

  function handleKeyUp(e:  React.KeyboardEvent) {
    if(OVERRIDDEN_KEYS.includes(e.key)) {
      e.preventDefault();
    }

    let k = {...keys};
    delete k[e.key];
    setKeys(k);
  }

  function addTask(id: string) {
    /**
     * when we add a task, we might be halfway through a word
     * when we hit enter, we want to split the word and create a new task with the second
     * half of that word.
     */
    let parentId = parentMap[id];

    let pg = { ...parentMap };
    let tg = { ...taskGraph };
    let n = { ...nodes };

    let firstHalf = n[id].value.slice(0, caretOffset);
    let secondHalf = n[id].value.slice(caretOffset);

    const taskId = nanoid();

    n[id].value = firstHalf;
    n[taskId] = { value: secondHalf };
    pg[taskId] = parentId;
    tg[taskId] = { isExpanded: true, children: [] };

    let index = tg[parentId].children.indexOf(id);
    tg[parentId].children.splice(index + 1, 0, taskId);

    setNodes(n);
    setParentMap(pg);
    setTaskGraph(tg);
    refocusInput(taskId, 0);
  }

  function indentRight(id: string) {
    let pg = { ...parentMap };
    let tg = { ...taskGraph };

    let parentId = pg[id];
    let subTasks = tg[parentId].children;

    let index = subTasks.indexOf(id);
    let previousKey = subTasks[index - 1];

    if(!previousKey) {
      return;
    }

    tg[previousKey].children.push(id);
    subTasks.splice(index, 1);

    pg[id] = previousKey;

    setParentMap(pg);
    setTaskGraph(tg);
    refocusInput(id, caretOffset);
  }

  function indentLeft(id: string) {
    let pg = { ...parentMap };
    let tg = { ...taskGraph };

    // find parent
    // find grandparent
    let parent = pg[id];
    let grandparent = pg[parent];


    if(!grandparent) {
      return;
    }

    // find index of parent in grandparent
    let indexOfParent = tg[grandparent].children.indexOf(parent);

    // insert id after index of parent in grandparent
    tg[grandparent].children.splice(indexOfParent + 1, 0, id);

    // remove id as child of parent
    let indexOfIdInParent = tg[parent].children.indexOf(id);
    tg[parent].children.splice(indexOfIdInParent, 1);

    // update parent of id to be grandparent
    pg[id] = grandparent;

    setParentMap(pg);
    setTaskGraph(tg);
    refocusInput(id, caretOffset);
  }

  function handleChange(id: string, value: string) {
    let n = {...nodes};
    n[id].value = value;
    setNodes(n);
  }

  function handleExpand(id: string) {
    let tg = { ...taskGraph };

    if(!tg[id].isExpanded) {
      tg[id].isExpanded = true;
      setTaskGraph(tg);
    }
  }

  function handleCollapse(id: string) {
    let tg = { ...taskGraph };

    if(tg[id].isExpanded) {
      tg[id].isExpanded = false;
      setTaskGraph(tg);
    }
  }

  return (
    <Task
      id={'root'}
      value={nodes['root']?.value}
      graph={taskGraph}
      nodes={nodes}
      onChange={(id, value) => handleChange(id, value)}
      onKeyUp={(e) => handleKeyUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      onFocus={(id) => setCurrentTaskId(id)}
      onExpand={(id) => handleExpand(id)}
      onCollapse={(id) => handleCollapse(id)}
    />
  );
};

export default RootTask;