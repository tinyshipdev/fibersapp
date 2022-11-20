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
import {
  addNode,
  indentLeft,
  indentRight,
  onChange,
  onCollapse,
  onDelete,
  onExpand,
  refocusInput
} from "../lib/nodes-controller";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";

import firebase from "../lib/firebase-client";
import {cloneDeep} from "lodash";

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
  shared?: boolean;
}

export type NodesInterface = {
  [key: string]: NodeItem
}

const DEFAULT_NODES: NodesInterface = {
  'root': {
    value: 'root',
    parent: '',
    isExpanded: true,
    children: [],
  },
}

function generateTree(curr: string, nodes: NodesInterface, tree: string[]) {
  if(nodes[curr].children.length === 0) {
    return tree;
  }

  for(let i = 0; i < nodes[curr].children.length; i++) {
    tree.push(nodes[curr].children[i]);
    generateTree(nodes[curr].children[i], nodes, tree);
  }

  return tree;
}

async function persistState(nodes: NodesInterface, userId: string) {
  await setDoc(doc(firebase.db, "nodes", userId), {
    data: nodes
  });
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
  const [nodes, setNodes] = useState<NodesInterface>(DEFAULT_NODES);
  const [isSaved, setIsSaved] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const user = firebase.auth.currentUser;

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
    if(user) {
      onSnapshot(doc(firebase.db, "nodes", user.uid), (doc) => {
        const data = doc?.data();
        if(data?.data) {
          setNodes(data.data);
        }
        setHasFetched(true);
      });
    }
  }, []);

  useEffect(() => {
    setIsSaved(false);
  }, [nodes]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if(user && hasFetched) {
        await persistState(nodes, user.uid);
        setIsSaved(true);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
    }
  }, [nodes, hasFetched]);

  function updateHistory(items: {type: HistoryType, data: any}[]) {
    setHistory([...history.slice(-1000), ...items]);
  }

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

    if(!n[draggedNode]) {
      // this is a shared node
      return;
    }

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

    if(!n[draggedNode]) {
      // this is a shared node
      return;
    }

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
    const data = onDelete({ ...nodes }, id, startOffset, endOffset);

    if(!data) {
      return null;
    }

    if(data.isCollapsed) {
      handleExpand({ ...nodes }, id);
      return null;
    }

    if(data.nodes) {
      setNodes(data.nodes);
      moveCursorUp(id, 0);
    }
  }

  async function handleShare(id: string) {

    if(!user) {
      return null;
    }

    const userId = user.uid;

    const updatedNodes = cloneDeep(nodes);
    // need to get all the nodes under id
    // we will send this array of ids to the backend,
    // the backend will then move the ids from nodes, to shared-nodes (or whatever we call it) along with permissions
    const tree = [id, ...generateTree(id, updatedNodes, [])];

    // get all the nodes from the tree

    // add these nodes to the shared-nodes collection
    // remove these nodes from the current users collection

    const nodesToShare: NodesInterface = {};
    for(let i = 0; i < tree.length; i++) {
      nodesToShare[tree[i]] = updatedNodes[tree[i]];
    }

    await setDoc(doc(firebase.db, 'shared-nodes', id), {
      owner: userId,
      collaborators: {
        'adam.g@miro.com': {
          permissions: ['view', 'edit', 'delete']
        }
      },
      nodes: nodesToShare
    });

    // delete these nodes from the current users private nodes
    for(let i = 0; i < tree.length; i++) {
      delete updatedNodes[tree[i]];
    }

    updatedNodes[id] = {
      shared: true,
      parent: nodes[id].parent,
      children: [],
      isExpanded: true,
      value: ''
    };

    setNodes(updatedNodes);
  }

  async function removeSharedRoot(sharedRootId: string) {
    if(!user) {
      return;
    }

    const updatedNodes = cloneDeep(nodes);

    updatedNodes[nodes[sharedRootId].parent].children = updatedNodes[nodes[sharedRootId].parent].children.filter((node) => node !== sharedRootId);
    delete updatedNodes[sharedRootId];

    setNodes(updatedNodes);

    await deleteDoc(doc(firebase.db, 'shared-nodes', sharedRootId))
  }

  if(!nodes || !user) {
    return null;
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
                setTimeout(() => {
                  refocusInput(id, offset);
                }, 0)
              }
            }}
            onIndentRight={(id, offset) => {
              const data = indentRight(nodes, id, offset);

              if(data) {
                updateHistory([{ type: HistoryType.INDENT_RIGHT, data: { id, offset: data.offset }}]);
                setNodes(data.nodes);
                setTimeout(() => {
                  refocusInput(id, offset);
                }, 0)
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
            userId={user.uid}
            onShare={(id) => handleShare(id)}
          onRemoveSharedRoot={(sharedRootId) => removeSharedRoot(sharedRootId)}
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