import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { nanoid } from 'nanoid'
import Node from "./Node";
import BreadcrumbTrail from "./BreadcrumbTrail";
import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PlusIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import ShortcutsModal from "./ShortcutsModal";
import UserButton from "./UserButton";
import NodeTitleInput from "./NodeTitleInput";
import {addNode, indentLeft, indentRight, onChange, onCollapse, onDelete, onExpand} from "../lib/nodes-controller";

enum HistoryType {
  CHANGE_TEXT,
  ADD_NODE,
  EXPAND_NODE,
  COLLAPSE_NODE,
  INDENT_LEFT,
  INDENT_RIGHT,
  ZOOM_NODE,
  DELETE_NODE,
  DROP_NODE,
}

export type NodeItem = {
  value: string;
  parent: string;
  isExpanded: boolean;
  children: string[];
}

export type NodesInterface = {
  [key: string]: NodeItem
}

const DEFAULT_NODES: NodesInterface = {
  'root': {
    value: 'root',
    parent: '',
    isExpanded: true,
    children: ['']
  },
}

function findLastChild(nodes: NodesInterface, id: string): string {
  if(nodes[id].children.length === 0) {
    return id;
  }

  return findLastChild(nodes, nodes[id]?.children[nodes[id]?.children.length - 1]);
}

// function findNearestParentSibling(
//   nodes: NodesInterface,
//   id: string
// ): string {
//   // keep searching up until the parent has a sibling
//   const parent = nodes[id].parent;
//   const grandparent = nodes[parent].parent;
//
//   if(parent === 'root') {
//     return id;
//   }
//
//   const parentIndex = nodes[grandparent]?.children?.indexOf(parent);
//   const sibling = nodes[grandparent]?.children[parentIndex + 1];
//
//   if(sibling) {
//     return sibling;
//   }
//
//   return findNearestParentSibling(nodes, parent);
// }

function setCaretPosition(id: string, pos: number) {
  const el: any = document.getElementById(id);

  if(!el) {
    return;
  }

  if(el.createTextRange) {
    const range = el.createTextRange();
    range.move('character', pos);
    range.select();
    return;
  }

  if(el.selectionStart) {
    el.focus();
    el.setSelectionRange(pos, pos);
    return;
  }

  el.focus();
}

function refocusInput(id: string, pos: number) {
  setTimeout( () => {
    const element = document.getElementById(id);

    if(element) {
      element.focus();
      setCaretPosition(id, pos)
    }
  }, 10)
}

async function fetchNodesFromRemote() {
  const data = await fetch(`/api/nodes`, {
    method: 'GET',
  })

  return await data?.json();
}

function getDefaultNodes() {
  return DEFAULT_NODES;
  // if(window.localStorage.getItem('nodes')) {
  //   return JSON.parse(window.localStorage.getItem('nodes') || '')?.nodes;
  // } else {
  //   return DEFAULT_NODES;
  // }
}

// function saveState(nodes: NodesInterface) {
//   window.localStorage.setItem('nodes', JSON.stringify({
//     nodes
//   }));
// }

async function persistState(nodes: NodesInterface) {
  const data = await fetch('/api/nodes', {
    method: 'POST',
    body: JSON.stringify({
      data: nodes
    })
  })

  return await data?.json();
}

interface HistoryItem {
  type: HistoryType,
  data: any,
}

const RootNode: React.FC = () => {
  const [zoomedNode, setZoomedNode] = useState('root');
  const [draggedNode, setDraggedNode] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [nodes, setNodes] = useState<NodesInterface>(() => getDefaultNodes());
  const [isSaved, setIsSaved] = useState(false);

  // I wrote this in a rush, might want to refactor at some point
  const generateBreadcrumbTrail = useCallback((id: string): {id: string, value: string}[] => {
    let links = [{ id: 'root', value: 'root' }];

    if(id === 'root') {
      return links;
    }

    let l = [];

    let curr = id;

    while(nodes[curr].value !== 'root') {
      l.push({ id: curr, value: nodes[curr].value });
      curr = nodes[curr].parent;
    }

    return [...links, ...l.reverse()];
  }, [nodes]);

  const breadcrumbs = useMemo(() =>
    generateBreadcrumbTrail(zoomedNode), [zoomedNode, generateBreadcrumbTrail]
  );

  useEffect(() => {
    async function t() {
      const data = await fetchNodesFromRemote();
      setNodes(data.data);
    }
    t();
  }, []);

  useEffect(() => {
    setIsSaved(false);
  }, [nodes]);

  // /**
  //  * I'm not sure how this works, but somehow it's working perfectly
  //  * it saves every second, but only if you're not editing.
  //  */
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     saveState(nodes);
  //   }, 1000);
  //
  //   return () => {
  //     clearTimeout(timer);
  //   }
  // }, [nodes]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      await persistState(nodes);
      setIsSaved(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    }
  }, [nodes]);

  function updateHistory(items: {type: HistoryType, data: any}[]) {
    setHistory([...history.slice(-1000), ...items]);
  }

  // function addNode(id: string, caretOffset: number) {
  //   let parentId = nodes[id].parent;
  //   const n = { ...nodes };
  //   const nodeId = nanoid();
  //
  //   // if the cursor is at the start of the sentence, add a node BEFORE the current one
  //   if(caretOffset === 0 && n[id].value.length > 0) {
  //     n[nodeId] = { value: '', isExpanded: true, children: [], parent: parentId };
  //     let index = nodes[parentId]?.children.indexOf(id);
  //     nodes[parentId]?.children.splice(index, 0, nodeId);
  //   } else {
  //     /**
  //      * when we add a node below, we might be halfway through a word
  //      * when we hit enter, we want to split the word and create a new node with the second
  //      * half of that word.
  //      */
  //     let firstHalf = n[id].value.slice(0, caretOffset);
  //     let secondHalf = n[id].value.slice(caretOffset);
  //
  //     n[id].value = firstHalf;
  //     n[nodeId] = { value: secondHalf, isExpanded: true, children: [], parent: parentId };
  //
  //     let index = nodes[parentId]?.children.indexOf(id);
  //     nodes[parentId]?.children.splice(index + 1, 0, nodeId);
  //   }
  //
  //   updateHistory([
  //     { type: HistoryType.ADD_NODE, data: { currentNode: nodeId, previousNode: id, parentNode: parentId }}
  //   ]);
  //   setNodes(n);
  //   refocusInput(nodeId, 0);
  // }

  function addNodeAsChild(id: string) {
    const n = { ...nodes };
    const nodeId = nanoid();

    const previousNode = n[id].children[n[id].children.length - 1];
    n[nodeId] = { value: '', isExpanded: true, children: [], parent: id };
    n[id].children.push(nodeId);

    updateHistory([
      { type: HistoryType.ADD_NODE, data: { currentNode: nodeId, previousNode, parentNode: id }}
    ]);
    setNodes(n);
    refocusInput(nodeId, 0);
  }

  // function indentRight(id: string, offset: number) {
  //   const n = { ...nodes };
  //
  //   let parentId = nodes[id].parent;
  //   let subNodes = nodes[parentId]?.children;
  //
  //   let index = subNodes.indexOf(id);
  //   let previousKey = subNodes[index - 1];
  //
  //   if(!previousKey) {
  //     return;
  //   }
  //
  //   // if the new parent is collapsed, expand it first, so we can see where this node went
  //   if(!n[previousKey].isExpanded) {
  //     n[previousKey].isExpanded = true;
  //   }
  //
  //   n[previousKey]?.children.push(id);
  //   subNodes.splice(index, 1);
  //
  //   n[id].parent = previousKey;
  //
  //   updateHistory([{ type: HistoryType.INDENT_RIGHT, data: { id, offset }}]);
  //   setNodes(n);
  //   refocusInput(id, offset);
  // }


  // function indentLeft(id: string, offset: number) {
  //   const n = { ...nodes };
  //
  //   // find parent
  //   // find grandparent
  //   let parent = n[id].parent;
  //   let grandparent = n[parent].parent;
  //
  //   if(!grandparent) {
  //     return;
  //   }
  //
  //   // find index of parent in grandparent
  //   let indexOfParent = n[grandparent]?.children.indexOf(parent);
  //
  //   // insert id after index of parent in grandparent
  //   n[grandparent]?.children.splice(indexOfParent + 1, 0, id);
  //
  //   // remove id as child of parent
  //   let indexOfIdInParent = n[parent]?.children.indexOf(id);
  //   n[parent]?.children.splice(indexOfIdInParent, 1);
  //
  //   // update parent of id to be grandparent
  //   n[id].parent = grandparent;
  //
  //   updateHistory([{ type: HistoryType.INDENT_LEFT, data: { id, offset }}]);
  //   setNodes(n);
  //   refocusInput(id, offset);
  // }

  // TODO: refactor this to use DOM nodes instead of our data structure
  function findPreviousVisibleNode(id: string, offset: number, parentId: string): [id: string, offset: number ]| null {
    if(offset !== 0) {
      return null;
    }

    const parent = parentId;
    const previousSiblingIndex = nodes[parent]?.children?.indexOf(id) - 1;
    const previousSibling = nodes[parent]?.children[previousSiblingIndex];

    // if there is no previous sibling, go to parent
    if(!previousSibling) {
      return [parent, nodes[parent].value.length];
    }

    // this is likely a shared node, so we can't move to it until we refactor this function to use DOM nodes
    if(!nodes[previousSibling]) {
      return null;
    }

    // if previous sibling is collapsed, go to previous sibling
    if(!nodes[previousSibling].isExpanded) {
      return [previousSibling, nodes[previousSibling].value.length];
    }

    // if current has previous sibling and previous sibling has children, find the very last child recursively
    if(previousSibling && nodes[previousSibling].children.length > 0) {
      const lastChild = findLastChild(nodes, previousSibling);
      return [lastChild, nodes[lastChild].value.length];
    }

    // if current has previous sibling, but previous sibling has no children, move to previous sibling
    if(previousSibling && nodes[previousSibling].children.length === 0) {
      return [previousSibling, nodes[previousSibling].value.length];
    }

    return null;
  }

  // function findNextVisibleNode(id: string, offset: number): [id: string, offset: number] | null {
  //   if(offset !== nodes[id].value.length) {
  //     return null;
  //   }
  //
  //   const n = { ...nodes };
  //   const parent = n[id].parent;
  //   const currentIndex = n[parent]?.children.indexOf(id);
  //   const sibling = n[parent]?.children[currentIndex + 1];
  //
  //   // if the current item is collapsed, and has a next sibling to the next sibling
  //   if(!n[id].isExpanded && sibling) {
  //     return [sibling, 0];
  //   }
  //
  //   // if current item is collapsed, but doesn't have next sibling, go to nearest parent sibling
  //   if(!n[id].isExpanded && !sibling) {
  //     const nearestParentSibling = findNearestParentSibling(n, id);
  //     return [nearestParentSibling, 0];
  //   }
  //
  //   // if the current node has children, move to first child
  //   if(n[id].children.length > 0) {
  //     return [n[id]?.children[0], 0];
  //   }
  //
  //   // if the current node does not have children, but has a sibling, move to sibling
  //   if(n[id].children.length === 0 && sibling) {
  //     return [sibling, 0];
  //   }
  //
  //   // if the current node does not have children, and does not have a sibling
  //   // find the nearest parent with a sibling
  //   const nearestParentSibling = findNearestParentSibling(n, id);
  //   // the finalCaretPosition is so if we're on the last element the caret stays at the end
  //   let finalCaretPosition = 0;
  //
  //   if(id === nearestParentSibling) {
  //     finalCaretPosition = n[nearestParentSibling].value.length;
  //   }
  //
  //   return [nearestParentSibling, finalCaretPosition];
  // }

  // function handleDelete(id: string, startOffset: number, endOffset: number) {
  //   if(!nodes[id].isExpanded) {
  //
  //     if(nodes[id].value.length === 0) {
  //       // if you attempt to delete a collapsed node that's empty but has children,
  //       // expand the node to explain why you can't delete this node
  //       handleExpand(nodes, id);
  //     }
  //     return;
  //   }
  //
  //   if(nodes[id].children.length > 0) {
  //     return;
  //   }
  //
  //   if(startOffset !== 0) {
  //     return;
  //   }
  //
  //   if(startOffset === 0 && endOffset === nodes[id].value.length && nodes[id].value.length > 0) {
  //     return;
  //   }
  //
  //   const n = { ...nodes };
  //
  //   // remove node as child of parent
  //   const parent = n[id].parent;
  //
  //   // if the parent is root, and id is first child of root
  //
  //   if(parent === 'root' && id === nodes[parent].children[0]) {
  //     return;
  //   }
  //
  //   const indexOfCurrent = n[parent].children.indexOf(id);
  //
  //   updateHistory([{
  //     type: HistoryType.DELETE_NODE,
  //     data: {
  //       id,
  //       node: {...n[id]},
  //       indexOfNodeInParent: indexOfCurrent,
  //     }
  //   }]);
  //
  //   const moveTo = findPreviousVisibleNode(id, 0);
  //   n[parent].children.splice(indexOfCurrent, 1);
  //
  //
  //   if(startOffset === 0 && endOffset === 0 && nodes[id].value.length > 0) {
  //     // append the current value to the previous node before deleting if we're not selecting anything
  //     if(moveTo) {
  //       n[moveTo[0]].value = n[moveTo[0]].value + n[id].value;
  //     }
  //   }
  //
  //   delete n[id];
  //   setNodes(n);
  //
  //   if(moveTo) {
  //     refocusInput(moveTo[0], moveTo[1]);
  //   }
  // }

  // function handleChange(id: string, value: string) {
  //   let n = {...nodes};
  //   updateHistory([{ type: HistoryType.CHANGE_TEXT, data: { id, value: n[id].value }}]);
  //   n[id].value = value;
  //   setNodes(n);
  // }

  // function handleExpand(id: string) {
  //   const n = { ...nodes };
  //
  //   if(!n[id].isExpanded) {
  //     n[id].isExpanded = true;
  //     updateHistory([{ type: HistoryType.EXPAND_NODE, data: { id }}]);
  //     setNodes(n);
  //   }
  // }

  function handleExpand(nodes: NodesInterface, id: string) {
    const data = onExpand(nodes, id);
    updateHistory([{ type: HistoryType.EXPAND_NODE, data: { id }}]);
    setNodes(data.nodes);
  }

  function undoExpand(id: string) {
    const n = { ...nodes };

    n[id].isExpanded = false;
    setNodes(n);
  }

  function handleCollapse(nodes: NodesInterface, id: string) {
    const data = onCollapse(nodes, id);
    updateHistory([{ type: HistoryType.COLLAPSE_NODE, data: { id }}]);
    setNodes(data.nodes);
  }

  // function handleCollapse(id: string) {
  //   const n = { ...nodes };
  //
  //   if(n[id].isExpanded) {
  //     n[id].isExpanded = false;
  //     updateHistory([{ type: HistoryType.COLLAPSE_NODE, data: { id }}]);
  //     setNodes(n);
  //   }
  // }

  function undoCollapse(id: string) {
    const n = { ...nodes };
    n[id].isExpanded = true;
    setNodes(n);
  }

  function handleZoom(id: string) {
    updateHistory([{ type: HistoryType.ZOOM_NODE, data: { id: zoomedNode }}]);
    setZoomedNode(id);
  }

  function undoZoom(id: string) {
    setZoomedNode(id);
  }

  function handleDrag(id: string) {
    setDraggedNode(id);
  }

  function validateDropConditions(dropTarget: string) {
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

    updateHistory([{
      type: HistoryType.DROP_NODE,
      data: {
        previousParent: parent,
        indexOfNodeInPreviousParent: indexOfDraggedNode,
        nodeId: draggedNode,
      }
    }]);

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

    updateHistory([{
      type: HistoryType.DROP_NODE,
      data: {
        previousParent: parent,
        indexOfNodeInPreviousParent: indexOfDraggedNode,
        nodeId: draggedNode,
      }
    }]);

    n[parent].children.splice(indexOfDraggedNode, 1);

    const parentOfDropTarget = n[dropTarget].parent;
    const indexOfDropTarget = n[parentOfDropTarget].children.indexOf(dropTarget);
    n[parentOfDropTarget].children.splice(indexOfDropTarget + 1, 0, draggedNode);
    n[draggedNode].parent = parentOfDropTarget;

    setNodes(n);
  }

  function undoAddNode(currentId: string, previousId: string, parentId: string) {
    const n = { ...nodes };
    // n[previousId].value = n[previousId].value + n[currentId].value;
    n[parentId].children = n[parentId].children.filter((child) => child !== currentId);
    delete n[currentId];
    setNodes(n);
    refocusInput(previousId, n[previousId]?.value?.length);
  }

  function undoDeleteNode(nodeId: string, nodeData: NodeItem, indexOfNodeInParent: number) {
    const n = { ...nodes };

    n[nodeId] = nodeData;
    n[nodeData.parent].children.splice(indexOfNodeInParent, 0, nodeId);

    setNodes(n);
    refocusInput(nodeId, n[nodeId]?.value?.length);
  }

  function undoDropNode(previousParent: string, indexOfNodeInPreviousParent: number, nodeId: string) {
    const n = { ...nodes };

    const currentParent = n[nodeId].parent;

    n[previousParent].children.splice(indexOfNodeInPreviousParent, 0, nodeId);
    n[currentParent].children = n[currentParent].children.filter((id) => id !== nodeId);
    n[nodeId].parent = previousParent;

    setNodes(n);
    refocusInput(nodeId, n[nodeId]?.value?.length);
  }

  function undoChangeText(id: string, value: string) {
    const n = { ...nodes };
    n[id].value = value;
    setNodes(n);
  }

  function moveCursorUp(id: string, offset: number) {
    if(offset !== 0) {
      return;
    }

    const inputs = document.getElementsByTagName('input');
    const item = inputs.namedItem(id);
    let index = 0;

    for(let i = 0; i < inputs.length; i++) {
      if(inputs[i] === item) {
        index = i;
      }
    }

    const moveTo = inputs[Math.max(index - 1, 0)]

    refocusInput(moveTo.id, moveTo.value.length);
  }

  function moveCursorDown(id: string, offset: number) {
    const inputs = document.getElementsByTagName('input');

    const item = inputs.namedItem(id);

    if(!item) {
      return;
    }

    if(offset !== item.value.length) {
      return;
    }

    let index = 0;

    for(let i = 0; i < inputs.length; i++) {
      if(inputs[i] === item) {
        index = i;
      }
    }

    const moveTo = inputs[index + 1];

    refocusInput(moveTo?.id, 0);
  }

  function undo() {
    const newHistory = [...history];

    const action = newHistory[newHistory.length - 1];

    switch(action.type) {
      case HistoryType.CHANGE_TEXT:
        undoChangeText(action.data.id, action.data.value);
        break;
      case HistoryType.ADD_NODE:
        undoAddNode(action.data.currentNode, action.data.previousNode, action.data.parentNode);
        break;
      case HistoryType.DELETE_NODE:
        undoDeleteNode(action.data.id, action.data.node, action.data.indexOfNodeInParent);
        break;
      case HistoryType.EXPAND_NODE:
        undoExpand(action.data.id);
        break;
      case HistoryType.COLLAPSE_NODE:
        undoCollapse(action.data.id);
        break;
      case HistoryType.INDENT_LEFT:
        indentRight(nodes, action.data.id, action.data.offset);
        break;
      case HistoryType.INDENT_RIGHT:
        indentLeft(nodes, action.data.id, action.data.offset);
        break;
      case HistoryType.ZOOM_NODE:
        undoZoom(action.data.id);
        break;
      case HistoryType.DROP_NODE:
        undoDropNode(action.data.previousParent, action.data.indexOfNodeInPreviousParent, action.data.nodeId);
        break;
    }

    newHistory.pop();
    setHistory(newHistory);
  }

  function handleAddNode(id: string, offset: number) {
    const data = addNode(nodes, id, offset);
    updateHistory([
      { type: HistoryType.ADD_NODE, data: { currentNode: data.currentNode, previousNode: data.previousNode, parentNode: data.parentNode }}
    ]);
    setNodes(data.nodes);
    refocusInput(data.currentNode, 0);
  }

  function handleDelete(nodes: NodesInterface, id: string, startOffset: number, endOffset: number) {
    const data = onDelete(nodes, id, startOffset, endOffset);

    if(!data) {
      return null;
    }

    const moveTo = findPreviousVisibleNode(id, 0, nodes[id].parent);
    console.log(moveTo);
  }

  return (
    <div
      tabIndex={0}
      className={'outline-none'}
      onKeyDown={(e) => {
        if(e.metaKey && e.key === 'z') {
          e.preventDefault();
          if(history.length > 0) {
            undo();
          }
        }
      }}
    >
      <ShortcutsModal isOpen={isShortcutsModalOpen} onClose={() => setIsShortcutsModalOpen(false)}/>
      <div className="bg-slate-50 px-10 py-2 mb-12 border-b flex items-center justify-between">
        <div className={'flex items-center'}>
          <div className="mr-10">
            <button onClick={() => undo()} disabled={history.length <= 0}>
              <ArrowUturnLeftIcon className={`w-4 h-4 mr-5 ${history.length > 0 ? 'text-slate-500' : 'text-slate-300'}`}/>
            </button>
            <button disabled={true}>
              <ArrowUturnRightIcon className={'w-4 h-4 text-slate-300'}/>
            </button>
          </div>
          <BreadcrumbTrail zoomedNode={zoomedNode} links={breadcrumbs} onClick={(id) => handleZoom(id)} />
        </div>
        <div className={'flex items-center'}>
          {!isSaved && (
            <div className={'flex items-center text-slate-400 mr-4'}>
              <ArrowPathIcon className={'w-4 w-4 mr-2 animate-spin'}/>
              <span className={'text-sm'}>Saving...</span>
            </div>
          )}
          <span className={'mr-6 flex items-center'}>
            <button onClick={() => setIsShortcutsModalOpen(true)}>
              <QuestionMarkCircleIcon className={'w-4 w-4 text-slate-500'}/>
            </button>
          </span>
          <UserButton/>
        </div>
      </div>

      <div className="container mx-auto">
        {zoomedNode !== 'root' && (
          <div className={'px-6'}>
            <NodeTitleInput
              value={nodes[zoomedNode]?.value}
              onChange={(value) => {
                const data = onChange(nodes, zoomedNode, value);
                updateHistory([{ type: HistoryType.CHANGE_TEXT, data: { id: zoomedNode, value: data.previousValue }}]);
                setNodes(data.nodes);
              }}
              placeholder={!nodes[zoomedNode]?.value ? 'Untitled' : ''}
            />
          </div>
        )}
        <div
          className={'-ml-10'}
        >
          <Node
            id={zoomedNode}
            zoomedNode={zoomedNode}
            value={nodes[zoomedNode]?.value}
            nodes={nodes}
            onChange={(id, value) => {
              const data = onChange(nodes, id, value);
              updateHistory([{ type: HistoryType.CHANGE_TEXT, data: { id, value: data.previousValue }}]);
              setNodes(data.nodes);
            }}
            onAddNode={(id, offset) => handleAddNode(id, offset)}
            onIndentLeft={(id, offset) => {
              const data = indentLeft(nodes, id, offset);

              if(data) {
                updateHistory([{ type: HistoryType.INDENT_LEFT, data: { id, offset: data.offset }}]);
                setNodes(data.nodes);
                refocusInput(id, offset);
              }
            }}
            onIndentRight={(id, offset) => {
              const data = indentRight(nodes, id, offset);

              if(data) {
                updateHistory([{ type: HistoryType.INDENT_RIGHT, data: { id, offset: data.offset }}]);
                setNodes(data.nodes);
                refocusInput(id, offset);
              }
            }}
            onMoveCursorUp={(id, offset) => moveCursorUp(id, offset)}
            onMoveCursorDown={(id, offset) => moveCursorDown(id, offset)}
            onExpand={(id) => handleExpand(nodes, id)}
            onCollapse={(id) => handleCollapse(nodes, id)}
            onDelete={(id, startOffset, endOffset) => {
              handleDelete(nodes, id, startOffset, endOffset);
            }}
            onZoom={(id) => handleZoom(id)}
            onDrag={(id) => handleDrag(id)}
            onDropChild={(id) => handleDropChild(id)}
            onDropSibling={(id) => handleDropSibling(id)}
          />
          <div className={'ml-14 mt-2'}>
            <button onClick={() => {
              addNodeAsChild(zoomedNode);
            }}>
              <PlusIcon className={'w-6 h-6 text-slate-200 hover:text-slate-800 transition'}/>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RootNode;