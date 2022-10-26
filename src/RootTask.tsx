import React, {useEffect, useState} from 'react';
import { nanoid } from 'nanoid'
import Task from "./Task";

const DEFAULT_GRAPH: { [key: string]: string[] } = {
  'root': ['one'],
  'one': ['two', 'three'],
  'two': ['five'],
  'three': [],
  'five': []
}

const DEFAULT_PARENT_GRAPH: { [key: string]: string } = {
  'root': '',
  'one': 'root',
  'two': 'one',
  'three': 'one',
  'five': 'two'
}

const DEFAULT_NODES: { [key: string]: { value: string }} = {
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

function setCaret(el: HTMLElement, pos: number) {
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
      setCaret(element, pos)
    }
  }, 10)
}

const OVERRIDDEN_KEYS = ['Tab', 'Enter'];

const RootTask: React.FC = () => {
  const [taskGraph, setTaskGraph] = useState(DEFAULT_GRAPH);
  const [parentGraph, setParentGraph] = useState(DEFAULT_PARENT_GRAPH);
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [keys, setKeys] = useState<{ [key: string]: boolean}>({});
  const [currentTaskId, setCurrentTaskId] = useState('');

  const caretOffset = window?.getSelection()?.anchorOffset || 0;

  useEffect(() => {
    if(keys['Shift'] && keys['Tab']) {
      indentLeft(currentTaskId);
      return;
    }

    if(keys['Tab']) {
      indentRight(currentTaskId);
      return;
    }

    if(keys['Enter']) {
      addTask(currentTaskId);
      return;
    }
  }, [keys])

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
    let parentId = parentGraph[id];

    let pg = { ...parentGraph };
    let tg = { ...taskGraph };
    let n = { ...nodes };

    let firstHalf = n[id].value.slice(0, caretOffset);
    let secondHalf = n[id].value.slice(caretOffset);

    const taskId = nanoid();

    n[id].value = firstHalf;
    n[taskId] = { value: secondHalf };
    pg[taskId] = parentId;
    tg[taskId] = [];

    let index = tg[parentId].indexOf(id);
    tg[parentId].splice(index + 1, 0, taskId);

    setNodes(n);
    setParentGraph(pg);
    setTaskGraph(tg);
    refocusInput(taskId, 0);
  }

  function indentRight(id: string) {
    let pg = { ...parentGraph };
    let tg = { ...taskGraph };

    let parentId = pg[id];
    let subTasks = tg[parentId];

    let index = subTasks.indexOf(id);
    let previousKey = subTasks[index - 1];

    if(!previousKey) {
      return;
    }

    tg[previousKey].push(id);
    subTasks.splice(index, 1);

    pg[id] = previousKey;

    setParentGraph(pg);
    setTaskGraph(tg);
    refocusInput(id, caretOffset);
  }

  function indentLeft(id: string) {
    let pg = { ...parentGraph };
    let tg = { ...taskGraph };

    // find parent
    // find grandparent
    let parent = pg[id];
    let grandparent = pg[parent];


    if(!grandparent) {
      return;
    }

    // find index of parent in grandparent
    let indexOfParent = tg[grandparent].indexOf(parent);

    // insert id after index of parent in grandparent
    tg[grandparent].splice(indexOfParent + 1, 0, id);

    // remove id as child of parent
    let indexOfIdInParent = tg[parent].indexOf(id);
    tg[parent].splice(indexOfIdInParent, 1);

    // update parent of id to be grandparent
    pg[id] = grandparent;

    setParentGraph(pg);
    setTaskGraph(tg);
    refocusInput(id, caretOffset);
  }

  function handleChange(id: string, value: string) {
    let n = {...nodes};
    n[id].value = value;
    setNodes(n);
  }

  return (
    <div>
      <ul className={'list-disc'}>
        <Task
          id={'root'}
          value={nodes['root']?.value}
          graph={taskGraph}
          nodes={nodes}
          onChange={(id, value) => handleChange(id, value)}
          onKeyUp={(e) => handleKeyUp(e)}
          onKeyDown={(e) => handleKeyDown(e)}
          onFocus={(id) => setCurrentTaskId(id)}
        />
      </ul>
    </div>
  );
};

export default RootTask;