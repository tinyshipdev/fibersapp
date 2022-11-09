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
  let parentId: string;

  if(!nodes[id]) {
    parentId = 'root';
  } else {
    parentId = nodes[id].parent;
  }

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

    if(n[id]) {
      let firstHalf = n[id].value.slice(0, offset);
      let secondHalf = n[id].value.slice(offset);

      n[id].value = firstHalf;
      n[nodeId] = { value: secondHalf, isExpanded: true, children: [], parent: parentId };

      let index = nodes[parentId]?.children.indexOf(id);
      nodes[parentId]?.children.splice(index + 1, 0, nodeId);
    } else {
      n[nodeId] = { value: '', isExpanded: true, children: [], parent: parentId };
      let index = nodes[parentId]?.children.indexOf(id);
      nodes[parentId]?.children.splice(index + 1, 0, nodeId);
    }
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