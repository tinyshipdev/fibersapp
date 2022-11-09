import {nanoid} from "nanoid";

export type NodeItem = {
  value: string;
  parent: string;
  isExpanded: boolean;
  children: string[];
}

export type NodesInterface = {
  [key: string]: NodeItem
}

export function addNode(nodes: NodesInterface, id: string, offset: number) {
  let parentId = nodes[id].parent;

  const n = { ...nodes };
  const nodeId = nanoid();

  // if the cursor is at the start of the sentence, add a node BEFORE the current one
  if(offset === 0 && n[id].value.length > 0) {
    n[nodeId] = { value: '', isExpanded: true, children: [], parent: parentId };
    let index = nodes[parentId]?.children.indexOf(id);
    nodes[parentId]?.children.splice(index, 0, nodeId);
  } else {
    /**
     * when we add a node below, we might be halfway through a word
     * when we hit enter, we want to split the word and create a new node with the second
     * half of that word.
     */
    let firstHalf = n[id].value.slice(0, offset);
    let secondHalf = n[id].value.slice(offset);

    n[id].value = firstHalf;
    n[nodeId] = { value: secondHalf, isExpanded: true, children: [], parent: parentId };

    let index = nodes[parentId]?.children.indexOf(id);
    nodes[parentId]?.children.splice(index + 1, 0, nodeId);
  }

  return {
    nodes: n,
    currentNode: nodeId,
    previousNode: id,
    parentNode: parentId,
    offset: 0
  }
}

export function onChange(nodes: NodesInterface, id: string, value: string) {
  let n = {...nodes};
  let previousValue = n[id].value;

  n[id].value = value;

  return {
    previousValue,
    nodes: n
  }
}

export function onExpand(nodes: NodesInterface, id: string) {
  const n = { ...nodes };

  if(!n[id].isExpanded) {
    n[id].isExpanded = true;
  }

  return { nodes: n };
}

export function onCollapse(nodes: NodesInterface, id: string) {
  const n = { ...nodes };

  if(n[id].isExpanded) {
    n[id].isExpanded = false;
  }

  return { nodes: n }
}

export function indentLeft(nodes: NodesInterface, id: string, offset: number) {
  const n = { ...nodes };

  let parent = n[id].parent;

  let grandparent = n[parent]?.parent;

  if(!n[grandparent]) {
    return null;
  }

  // find index of parent in grandparent
  let indexOfParent = n[grandparent]?.children.indexOf(parent);

  // insert id after index of parent in grandparent
  n[grandparent]?.children.splice(indexOfParent + 1, 0, id);

  // remove id as child of parent
  let indexOfIdInParent = n[parent]?.children.indexOf(id);
  n[parent]?.children.splice(indexOfIdInParent, 1);

  // update parent of id to be grandparent
  n[id].parent = grandparent;

  return {
    offset: offset || 0,
    nodes: n,
  }
}

export function indentRight(nodes: NodesInterface, id: string, offset: number) {
  const n = { ...nodes };

  let parentId = n[id].parent;

  if(!n[parentId]) {
    return null;
  }

  let subNodes = n[parentId]?.children;

  let index = subNodes.indexOf(id);
  let previousKey = subNodes[index - 1];

  if(!n[previousKey]) {
    return null;
  }

  // if the new parent is collapsed, expand it first, so we can see where this node went
  if(!n[previousKey].isExpanded) {
    n[previousKey].isExpanded = true;
  }

  n[previousKey]?.children.push(id);
  subNodes.splice(index, 1);

  n[id].parent = previousKey;

  return {
    offset: offset || 0,
    nodes: n,
  }
}

export function onDelete(nodes: NodesInterface, id: string, startOffset: number, endOffset: number) {
  if(!nodes[id].isExpanded) {

    // if(nodes[id].value.length === 0) {
    //   // if you attempt to delete a collapsed node that's empty but has children,
    //   // expand the node to explain why you can't delete this node
    //   handleExpand(nodes, id);
    // }
    return null;
  }

  if(nodes[id].children.length > 0) {
    return null;
  }

  if(startOffset !== 0) {
    return null;
  }

  if(startOffset === 0 && endOffset === nodes[id].value.length && nodes[id].value.length > 0) {
    return null;
  }

  const n = { ...nodes };

  // remove node as child of parent
  const parent = n[id].parent;

  // if the parent is root, and id is first child of root

  if(parent === 'root' && id === nodes[parent].children[0]) {
    return null;
  }

  const indexOfCurrent = n[parent].children.indexOf(id);
  n[parent].children.splice(indexOfCurrent, 1);

  const history = {
    id,
    node: {...n[id]},
    indexOfNodeInParent: indexOfCurrent,
  };


  delete n[id];

  return {
    nodes: n,
    history,
  }

  // const moveTo = findPreviousVisibleNode(id, 0);
  // n[parent].children.splice(indexOfCurrent, 1);
  //
  //
  // if(startOffset === 0 && endOffset === 0 && nodes[id].value.length > 0) {
  //   // append the current value to the previous node before deleting if we're not selecting anything
  //   if(moveTo) {
  //     n[moveTo[0]].value = n[moveTo[0]].value + n[id].value;
  //   }
  // }
  //
  // delete n[id];
  // setNodes(n);
  //
  // if(moveTo) {
  //   refocusInput(moveTo[0], moveTo[1]);
  // }
}