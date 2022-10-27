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

function findLastChild(graph: TaskGraphInterface, id: string): string {
  if(graph[id].children.length === 0) {
    return id;
  }

  return findLastChild(graph, graph[id]?.children[graph[id]?.children.length - 1]);
}

function findNearestParentSibling(
  graph: TaskGraphInterface,
  parentMap: TaskParentMapInterface,
  id: string
): string {
  // keep searching up until the parent has a sibling
  const parent = parentMap[id];
  const grandparent = parentMap[parent];

  if(parent === 'root') {
    return id;
  }

  const parentIndex = graph[grandparent]?.children?.indexOf(parent);
  const sibling = graph[grandparent]?.children[parentIndex + 1];

  if(sibling) {
    return sibling;
  }

  return findNearestParentSibling(graph, parentMap, parent);
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

export const ACTION_KEYS = ['Tab', 'Enter'];

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

  useLayoutEffect(() => {
    if(keys['Shift'] && keys['Tab']) {
      indentLeft(currentTaskId);
    } else if(keys['Tab']) {
      indentRight(currentTaskId);
    } else if(keys['Enter']) {
      addTask(currentTaskId);
    } else if(keys['ArrowUp']) {
      const moveTo = moveUp(currentTaskId);
      if(moveTo) {
        refocusInput(moveTo[0], moveTo[1]);
      }
      return;
    } else if(keys['ArrowDown']) {
      const moveTo = moveDown(currentTaskId);
      if(moveTo) {
        refocusInput(moveTo[0], moveTo[1]);
      }
      return;
    }
  }, [keys]) // TODO: fix this deps array warning, it breaks whatever i try lol

  function handleKeyDown(e:  React.KeyboardEvent) {
    if(ACTION_KEYS.includes(e.key)) {
      e.preventDefault();
    }

    if(!keys[e.key]) {
      let k = {...keys};
      k[e.key] = true;
      setKeys(k);
    }
  }

  function handleKeyUp(e:  React.KeyboardEvent) {
    if(ACTION_KEYS.includes(e.key)) {
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

    let index = tg[parentId]?.children.indexOf(id);
    tg[parentId]?.children.splice(index + 1, 0, taskId);

    setNodes(n);
    setParentMap(pg);
    setTaskGraph(tg);
    refocusInput(taskId, 0);
  }

  function indentRight(id: string) {
    let pg = { ...parentMap };
    let tg = { ...taskGraph };

    let parentId = pg[id];
    let subTasks = tg[parentId]?.children;

    let index = subTasks.indexOf(id);
    let previousKey = subTasks[index - 1];

    if(!previousKey) {
      return;
    }

    tg[previousKey]?.children.push(id);
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
    let indexOfParent = tg[grandparent]?.children.indexOf(parent);

    // insert id after index of parent in grandparent
    tg[grandparent]?.children.splice(indexOfParent + 1, 0, id);

    // remove id as child of parent
    let indexOfIdInParent = tg[parent]?.children.indexOf(id);
    tg[parent]?.children.splice(indexOfIdInParent, 1);

    // update parent of id to be grandparent
    pg[id] = grandparent;

    setParentMap(pg);
    setTaskGraph(tg);
    refocusInput(id, caretOffset);
  }

  function moveUp(id: string): [id: string, offset: number] | null {
    if(caretOffset === 0) {

      const parent = parentMap[id];
      const previousSiblingIndex = taskGraph[parent]?.children?.indexOf(id) - 1;
      const previousSibling = taskGraph[parent]?.children[previousSiblingIndex];

      // if there is no previous sibling, go to parent
      if(!previousSibling) {
        return [parent, nodes[parent].value.length];
      }

      // if previous sibling is collapsed, go to previous sibling
      if(!taskGraph[previousSibling].isExpanded) {
        return [previousSibling, nodes[previousSibling].value.length];
      }

      // if current has previous sibling and previous sibling has children, find the very last child recursively
      if(previousSibling && taskGraph[previousSibling].children.length > 0) {
        const lastChild = findLastChild(taskGraph, previousSibling);
        return [lastChild, nodes[lastChild].value.length];
      }

      // if current has previous sibling, but previous sibling has no children, move to previous sibling
      if(previousSibling && taskGraph[previousSibling].children.length === 0) {
        return [previousSibling, nodes[previousSibling].value.length];
      }
    }

    return null;
  }

  function moveDown(id: string): [id: string, offset: number] | null {
    if(caretOffset !== nodes[id].value.length) {
      return null;
    }

    const parent = parentMap[id];
    const currentIndex = taskGraph[parent]?.children.indexOf(id);
    const sibling = taskGraph[parent]?.children[currentIndex + 1];

    // if the current item is collapsed, and has a next sibling to the next sibling
    if(!taskGraph[id].isExpanded && sibling) {
      return [sibling, 0];
    }

    // if current item is collapsed, but doesn't have next sibling, go to nearest parent sibling
    if(!taskGraph[id].isExpanded && !sibling) {
      const nearestParentSibling = findNearestParentSibling(taskGraph, parentMap, id);
      return [nearestParentSibling, 0];
    }

    // if the current node has children, move to first child
    if(taskGraph[id].children.length > 0) {
      return [taskGraph[id]?.children[0], 0];
    }

    // if the current node does not have children, but has a sibling, move to sibling
    if(taskGraph[id].children.length === 0 && sibling) {
      return [sibling, 0];
    }

    // if the current node does not have children, and does not have a sibling
    // find the nearest parent with a sibling
    const nearestParentSibling = findNearestParentSibling(taskGraph, parentMap, id);
    // the finalCaretPosition is so if we're on the last element the caret stays at the end
    let finalCaretPosition = 0;

    if(id === nearestParentSibling) {
      finalCaretPosition = nodes[nearestParentSibling].value.length;
    }

    return [nearestParentSibling, finalCaretPosition];
  }

  function handleDelete(id: string) {
    console.log(taskGraph[id].children.length);

    if(!taskGraph[id].isExpanded) {
      return;
    }

    if(taskGraph[id].children.length > 0) {
      return;
    }

    let pg = { ...parentMap };
    let tg = { ...taskGraph };
    let n = { ...nodes };

    // remove task as child of parent
    const parent = pg[id];

    if(parent === 'root') {
      return;
    }

    const indexOfCurrent = tg[parent].children.indexOf(id);

    const moveTo = moveUp(currentTaskId);
    tg[parent].children.splice(indexOfCurrent, 1);

    // delete node
    delete n[id];
    delete tg[id];
    delete pg[id];

    setParentMap(pg);
    setTaskGraph(tg);
    setNodes(n);

    if(moveTo) {
      refocusInput(moveTo[0], moveTo[1]);
    }
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
      onDelete={(id) => handleDelete(id)}
    />
  );
};

export default RootTask;