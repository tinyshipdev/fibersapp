import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { nanoid } from 'nanoid'
import Node from "./Node";
import BreadcrumbTrail from "./BreadcrumbTrail";

type KeyMapInterface = { [key: string]: boolean };

export type NodesInterface = {
  [key: string]: {
    value: string,
    parent: string,
    isExpanded: boolean,
    children: string[],
  }
}

const DEFAULT_NODES: NodesInterface = {
  'root': {
    value: 'root',
    parent: '',
    isExpanded: true,
    children: ['one']
  },
  'one': {
    value: 'one',
    parent: 'root',
    isExpanded: true,
    children: ['two', 'three']
  },
  'two': {
    value: 'two',
    parent: 'one',
    isExpanded: false,
    children: ['five']
  },
  'three': {
    value: 'three',
    parent: 'one',
    isExpanded: true,
    children: [],
  },
  'five': {
    value: 'five',
    parent: 'two',
    isExpanded: true,
    children: [],
  }
}

function findLastChild(nodes: NodesInterface, id: string): string {
  if(nodes[id].children.length === 0) {
    return id;
  }

  return findLastChild(nodes, nodes[id]?.children[nodes[id]?.children.length - 1]);
}

function findNearestParentSibling(
  nodes: NodesInterface,
  id: string
): string {
  // keep searching up until the parent has a sibling
  const parent = nodes[id].parent;
  const grandparent = nodes[parent].parent;

  if(parent === 'root') {
    return id;
  }

  const parentIndex = nodes[grandparent]?.children?.indexOf(parent);
  const sibling = nodes[grandparent]?.children[parentIndex + 1];

  if(sibling) {
    return sibling;
  }

  return findNearestParentSibling(nodes, parent);
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

function getDefaultNodes() {
  if(window.localStorage.getItem('nodes')) {
    return JSON.parse(window.localStorage.getItem('nodes') || '')?.nodes;
  } else {
    return DEFAULT_NODES;
  }
}

function saveState(nodes: NodesInterface) {
  window.localStorage.setItem('nodes', JSON.stringify({
    nodes
  }));
}

export const ACTION_KEYS = ['Tab', 'Enter'];

const RootNode: React.FC = () => {
  const [nodes, setNodes] = useState<NodesInterface>(() => getDefaultNodes());
  const [keys, setKeys] = useState<KeyMapInterface>({});
  const [currentNodeId, setCurrentNodeId] = useState('');
  const [focusedNode, setFocusedNode] = useState('root');
  const [draggedNode, setDraggedNode] = useState('');

  // I wrote this in a rush, might want to refactor at some point
  const generateBreadcrumbTrail = useCallback((id: string): {id: string, value: string}[] => {
    let links = [{ id: 'root', value: 'root' }];

    if(id === 'root') {
      return links;
    }

    let l = [];

    let curr = id;

    while(nodes[curr].parent !== 'root') {
      l.push({ id: curr, value: nodes[curr].value });
      curr = nodes[curr].parent;
    }

    return [...links, ...l.reverse()];
  }, [nodes]);

  const breadcrumbs = useMemo(() =>
    generateBreadcrumbTrail(focusedNode), [focusedNode, generateBreadcrumbTrail]
  );

  /**
   * I'm not sure how this works, but somehow it's working perfectly
   * it saves every second, but only if you're not editing.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      saveState(nodes);
    }, 1000);

    return () => {
      clearTimeout(timer);
    }
  }, [nodes]);

  function handleActions(keys: KeyMapInterface) {
    if(keys['Shift'] && keys['Tab']) {
      indentLeft(currentNodeId);
    } else if(keys['Tab']) {
      indentRight(currentNodeId);
    } else if(keys['Enter']) {
      addNode(currentNodeId);
    } else if(keys['ArrowUp']) {
      const moveTo = findPreviousVisibleNode(currentNodeId);
      if(moveTo) {
        refocusInput(moveTo[0], moveTo[1]);
      }
    } else if(keys['ArrowDown']) {
      const moveTo = findNextVisibleNode(currentNodeId);
      if(moveTo) {
        refocusInput(moveTo[0], moveTo[1]);
      }
    }
  }

  function handleKeyDown(e:  React.KeyboardEvent) {
    if(ACTION_KEYS.includes(e.key)) {
      e.preventDefault();
    }

    if(!keys[e.key]) {
      let k = {...keys};
      k[e.key] = true;
      setKeys(k);
      handleActions(k);
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

  function addNode(id: string) {
    const caretOffset = window?.getSelection()?.anchorOffset || 0;
    /**
     * when we add a node, we might be halfway through a word
     * when we hit enter, we want to split the word and create a new node with the second
     * half of that word.
     */
    let parentId = nodes[id].parent;
    const n = { ...nodes };

    let firstHalf = n[id].value.slice(0, caretOffset);
    let secondHalf = n[id].value.slice(caretOffset);

    const nodeId = nanoid();

    n[id].value = firstHalf;
    n[nodeId] = { value: secondHalf, isExpanded: true, children: [], parent: parentId };

    let index = nodes[parentId]?.children.indexOf(id);
    nodes[parentId]?.children.splice(index + 1, 0, nodeId);

    setNodes(n);

    refocusInput(nodeId, 0);
  }

  function indentRight(id: string) {
    const caretOffset = window?.getSelection()?.anchorOffset || 0;
    const n = { ...nodes };

    let parentId = nodes[id].parent;
    let subNodes = nodes[parentId]?.children;

    let index = subNodes.indexOf(id);
    let previousKey = subNodes[index - 1];

    if(!previousKey) {
      return;
    }

    n[previousKey]?.children.push(id);
    subNodes.splice(index, 1);

    n[id].parent = previousKey;

    setNodes(n);
    refocusInput(id, caretOffset);
  }

  function indentLeft(id: string) {
    const caretOffset = window?.getSelection()?.anchorOffset || 0;
    const n = { ...nodes };

    // find parent
    // find grandparent
    let parent = n[id].parent;
    let grandparent = n[parent].parent;


    if(!grandparent) {
      return;
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

    setNodes(n);
    refocusInput(id, caretOffset);
  }

  function findPreviousVisibleNode(id: string): [id: string, offset: number] | null {
    const caretOffset = window?.getSelection()?.anchorOffset || 0;
    if(caretOffset === 0) {

      const n = { ...nodes };

      const parent = n[id].parent;
      const previousSiblingIndex = n[parent]?.children?.indexOf(id) - 1;
      const previousSibling = n[parent]?.children[previousSiblingIndex];

      // if there is no previous sibling, go to parent
      if(!previousSibling) {
        return [parent, n[parent].value.length];
      }

      // if previous sibling is collapsed, go to previous sibling
      if(!n[previousSibling].isExpanded) {
        return [previousSibling, n[previousSibling].value.length];
      }

      // if current has previous sibling and previous sibling has children, find the very last child recursively
      if(previousSibling && n[previousSibling].children.length > 0) {
        const lastChild = findLastChild(n, previousSibling);
        return [lastChild, n[lastChild].value.length];
      }

      // if current has previous sibling, but previous sibling has no children, move to previous sibling
      if(previousSibling && n[previousSibling].children.length === 0) {
        return [previousSibling, n[previousSibling].value.length];
      }
    }

    return null;
  }

  function findNextVisibleNode(id: string): [id: string, offset: number] | null {
    const caretOffset = window?.getSelection()?.anchorOffset || 0;
    if(caretOffset !== nodes[id].value.length) {
      return null;
    }

    const n = { ...nodes };
    const parent = n[id].parent;
    const currentIndex = n[parent]?.children.indexOf(id);
    const sibling = n[parent]?.children[currentIndex + 1];

    // if the current item is collapsed, and has a next sibling to the next sibling
    if(!n[id].isExpanded && sibling) {
      return [sibling, 0];
    }

    // if current item is collapsed, but doesn't have next sibling, go to nearest parent sibling
    if(!n[id].isExpanded && !sibling) {
      const nearestParentSibling = findNearestParentSibling(n, id);
      return [nearestParentSibling, 0];
    }

    // if the current node has children, move to first child
    if(n[id].children.length > 0) {
      return [n[id]?.children[0], 0];
    }

    // if the current node does not have children, but has a sibling, move to sibling
    if(n[id].children.length === 0 && sibling) {
      return [sibling, 0];
    }

    // if the current node does not have children, and does not have a sibling
    // find the nearest parent with a sibling
    const nearestParentSibling = findNearestParentSibling(n, id);
    // the finalCaretPosition is so if we're on the last element the caret stays at the end
    let finalCaretPosition = 0;

    if(id === nearestParentSibling) {
      finalCaretPosition = n[nearestParentSibling].value.length;
    }

    return [nearestParentSibling, finalCaretPosition];
  }

  function handleDelete(id: string) {

    if(!nodes[id].isExpanded) {
      return;
    }

    if(nodes[id].children.length > 0) {
      return;
    }

    const n = { ...nodes };

    // remove node as child of parent
    const parent = n[id].parent;

    // if the parent is root, and id is first child of root

    if(parent === 'root' && id === nodes[parent].children[0]) {
      return;
    }

    const indexOfCurrent = n[parent].children.indexOf(id);

    const moveTo = findPreviousVisibleNode(currentNodeId);
    n[parent].children.splice(indexOfCurrent, 1);

    // delete node
    delete n[id];

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
    const n = { ...nodes };

    if(!n[id].isExpanded) {
      n[id].isExpanded = true;
      setNodes(n);
    }
  }

  function handleCollapse(id: string) {
    const n = { ...nodes };

    if(n[id].isExpanded) {
      n[id].isExpanded = false;
      setNodes(n);
    }
  }

  function handleZoom(id: string) {
    setFocusedNode(id);
  }

  function handleDrag(id: string) {
    setDraggedNode(id);
  }

  function validateDropConditions(dropTarget: string) {
    if(nodes['root'].children[0] === draggedNode) {
      return false;
    }

    return dropTarget !== draggedNode;
  }

  function handleDropChild(dropTarget: string) {
    if(!validateDropConditions(dropTarget)) {
      return;
    }

    const n = { ...nodes };

    // remove dragged node from child of it's parent
    const parent = n[draggedNode].parent;
    const indexOfDraggedNode = n[parent].children.indexOf(draggedNode);
    n[parent].children.splice(indexOfDraggedNode, 1);

    n[dropTarget].children.splice(0, 0, draggedNode);
    n[draggedNode].parent = dropTarget;

    setNodes(n);
  }

  function handleDropSibling(dropTarget: string) {
    if(!validateDropConditions(dropTarget)) {
      return;
    }

    const n = {...nodes};

    // remove dragged node from child of it's parent
    const parent = n[draggedNode].parent;
    const indexOfDraggedNode = n[parent].children.indexOf(draggedNode);
    n[parent].children.splice(indexOfDraggedNode, 1);

    const parentOfDropTarget = n[dropTarget].parent;
    const indexOfDropTarget = n[parentOfDropTarget].children.indexOf(dropTarget);
    n[parentOfDropTarget].children.splice(indexOfDropTarget + 1, 0, draggedNode);
    n[draggedNode].parent = parentOfDropTarget;

    setNodes(n);
  }

  return (
    <div>
      <BreadcrumbTrail focusedNode={focusedNode} links={breadcrumbs} onClick={(id) => handleZoom(id)} />
      {focusedNode !== 'root' && (
        <input
          className={'text-xl font-bold mb-6 focus:outline-none'}
          value={nodes[focusedNode]?.value}
          placeholder={!nodes[focusedNode]?.value ? 'Untitled' : ''}
          onChange={(e) => handleChange(focusedNode, e.target.value)}
        />
      )}
      <div className={'-ml-10'}>
        <Node
          id={focusedNode}
          focusedNode={focusedNode}
          value={nodes[focusedNode]?.value}
          nodes={nodes}
          onChange={(id, value) => handleChange(id, value)}
          onKeyUp={(e) => handleKeyUp(e)}
          onKeyDown={(e) => handleKeyDown(e)}
          onFocus={(id) => setCurrentNodeId(id)}
          onExpand={(id) => handleExpand(id)}
          onCollapse={(id) => handleCollapse(id)}
          onDelete={(id) => handleDelete(id)}
          onZoom={(id) => handleZoom(id)}
          onDrag={(id) => handleDrag(id)}
          onDropChild={(id) => handleDropChild(id)}
          onDropSibling={(id) => handleDropSibling(id)}
        />
      </div>
    </div>
  );
};

export default RootNode;