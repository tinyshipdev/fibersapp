import React, {useState} from 'react';
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

const RootTask: React.FC = () => {
  const [taskGraph, setTaskGraph] = useState(DEFAULT_GRAPH);
  const [parentGraph, setParentGraph] = useState(DEFAULT_PARENT_GRAPH);
  const [nodes, setNodes] = useState(DEFAULT_NODES);

  function addTask(id: string) {
    let parentId = parentGraph[id];

    let pg = { ...parentGraph };
    let tg = { ...taskGraph };
    let n = { ...nodes };

    n['six'] = { value: 'six' };
    pg['six'] = parentId;
    tg['six'] = [];

    let index = tg[parentId].indexOf(id);
    tg[parentId].splice(index + 1, 0, 'six');

    setNodes(n);
    setParentGraph(pg);
    setTaskGraph(tg);
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
  }

  return (
    <div>
      <ul>
        <Task
          id={'root'}
          value={nodes['root']?.value}
          graph={taskGraph}
          nodes={nodes}
          onAddTask={(id) => addTask(id)}
          onIndentRight={(id) => indentRight(id)}
          onIndentLeft={(id) => indentLeft(id)}
        />
      </ul>
    </div>
  );
};

export default RootTask;