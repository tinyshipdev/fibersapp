import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { nanoid } from 'nanoid'
import Node from "./Node";
import BreadcrumbTrail from "./BreadcrumbTrail";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  FolderIcon,
  PlusIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import ShortcutsModal from "./ShortcutsModal";
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

interface HistoryItem {
  type: HistoryType,
  data: any,
}

async function writeFile(fileHandle: any, contents: any) {
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
}

async function download(filename: any, text: string) {
  // @ts-ignore
  if(window.showSaveFilePicker) {
    try {
      const opts = {
        types: [
          {
            description: "Fibers File",
            accept: { "text/plain": [".fibers"] },
          },
        ],
      };
      // @ts-ignore
      const fileHandle = await window.showSaveFilePicker(opts)
    
      await writeFile(fileHandle, text);
    } catch {}
  } else {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  } 
}

const RootNode: React.FC = () => {
  const [zoomedNode, setZoomedNode] = useState('root');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [nodes, setNodes] = useState<NodesInterface>(DEFAULT_NODES);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if(localStorage.getItem('fibers-nodes')) {
      setNodes(JSON.parse(localStorage.getItem('fibers-nodes') as string) || DEFAULT_NODES)
    }
  }, [])

  useEffect(() => {
    setIsSaved(false)
    localStorage.setItem('fibers-nodes', JSON.stringify(nodes));

    const timer = setTimeout(() => {
      setIsSaved(true)
    }, 1000); 

    return () => clearTimeout(timer)
  }, [nodes])

  // I wrote this in a rush, might want to refactor at some point
  const generateBreadcrumbTrail = useCallback((id: string): {id: string, value: string}[] => {
    let links = [{ id: 'root', value: 'root' }];

    if(id === 'root') {
      return links;
    }

    let l = [];

    let curr = id;

    while(nodes[curr].value !== 'root') {
      // @ts-ignore
      l.push({ id: curr, value: nodes[curr].value });
      curr = nodes[curr].parent;
    }

    return [...links, ...l.reverse()];
  }, [nodes]);

  const breadcrumbs = useMemo(() =>
    generateBreadcrumbTrail(zoomedNode), [zoomedNode, generateBreadcrumbTrail]
  );

  function updateHistory(items: {type: HistoryType, data: any}[]) {
    setHistory([...history.slice(-1000), ...items]);
  }

  function addNodeAsChild(id: string) {
    const n = cloneDeep(nodes);
    const nodeId = nanoid();

    const previousNode = n[id].children[n[id].children.length - 1];
    n[nodeId] = { value: '', isExpanded: true, children: [], parent: id };
    n[id].children.push(nodeId);

    setNodes(n)

    updateHistory([
      { type: HistoryType.ADD_NODE, data: { currentNode: nodeId, previousNode, parentNode: id }}
    ]);

    refocusInput(nodeId, 0);
  }

  function handleExpand(nodes: NodesInterface, id: string) {
    const data = onExpand(nodes, id);
    updateHistory([{ type: HistoryType.EXPAND_NODE, data: { id }}]);
    setNodes(data.nodes)
  }

  function undoExpand(id: string) {
    const n = cloneDeep(nodes);

    n[id].isExpanded = false;

    setNodes(n)
  }

  function handleCollapse(nodes: NodesInterface, id: string) {
    const data = onCollapse(nodes, id);
    updateHistory([{ type: HistoryType.COLLAPSE_NODE, data: { id }}]);
    setNodes(data.nodes)
  }

  function undoCollapse(id: string) {
    const n = cloneDeep(nodes);
    n[id].isExpanded = true;
    setNodes(n)
  }

  function handleZoom(id: string) {
    updateHistory([{ type: HistoryType.ZOOM_NODE, data: { id: zoomedNode }}]);
    setZoomedNode(id);
  }

  function undoZoom(id: string) {
    setZoomedNode(id);
  }


  function handleDropChild(dragId: string, dropId: string) {
    if(dragId === dropId) return;

    const n = cloneDeep(nodes);

    if(!n[dragId]) return;

    // remove dragged node from child of it's parent
    const parent = n[dragId].parent;
    const indexOfDraggedNode = n[parent].children.indexOf(dragId);

    n[parent].children.splice(indexOfDraggedNode, 1);
    n[dropId].children.splice(0, 0, dragId);
    n[dragId].parent = dropId;

    updateHistory([{
      type: HistoryType.DROP_NODE,
      data: {
        previousParent: parent,
        indexOfNodeInPreviousParent: indexOfDraggedNode,
        nodeId: dragId,
      }
    }]);

    setNodes(n);
  }

  function handleDropSibling(dragId: string, dropId: string) {
    if(dragId === dropId) return;

    const n = cloneDeep(nodes);

    if(!n[dragId]) return;

    // 1. update parent to remove dragId as child
    const parent = n[dragId].parent;
    const indexOfDraggedNode = n[parent].children.indexOf(dragId);
    n[parent].children.splice(indexOfDraggedNode, 1);

    // 2. add dragged node as a child of the dropped nodes parent
    const parentOfDropTarget = n[dropId].parent;
    const indexOfDropTarget = n[parentOfDropTarget].children.indexOf(dropId);
    n[parentOfDropTarget].children.splice(indexOfDropTarget + 1, 0, dragId);

    // 3. update dragged nodes parent to be the parent of the dropped node
    n[dragId].parent = parentOfDropTarget;

    // 4. update database
    setNodes(n);

    // 5. update local undo history
    updateHistory([{
      type: HistoryType.DROP_NODE,
      data: {
        previousParent: parent,
        indexOfNodeInPreviousParent: indexOfDraggedNode,
        nodeId: dragId,
      }
    }]);

  }

  function undoAddNode(currentId: string, previousId: string, parentId: string) {
    const n = cloneDeep(nodes);
    // n[previousId].value = n[previousId].value + n[currentId].value;
    n[parentId].children = n[parentId].children.filter((child) => child !== currentId);
    delete n[currentId];

    setNodes(n)

    refocusInput(previousId, n[previousId]?.value?.length);
  }

  function undoDeleteNode(nodeId: string, nodeData: NodeItem, indexOfNodeInParent: number) {
    const n = cloneDeep(nodes);

    n[nodeId] = nodeData;
    n[nodeData.parent].children.splice(indexOfNodeInParent, 0, nodeId);

    setNodes(n)

    refocusInput(nodeId, n[nodeId]?.value?.length);
  }

  function undoDropNode(previousParent: string, indexOfNodeInPreviousParent: number, nodeId: string) {
    const n = cloneDeep(nodes);

    const currentParent = n[nodeId].parent;

    n[previousParent].children.splice(indexOfNodeInPreviousParent, 0, nodeId);
    n[currentParent].children = n[currentParent].children.filter((id) => id !== nodeId);
    n[nodeId].parent = previousParent;

    setNodes(n)

    refocusInput(nodeId, n[nodeId]?.value?.length);
  }

  function undoChangeText(id: string, value: string) {
    const n = cloneDeep(nodes);
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
      setNodes(data.nodes)
      moveCursorUp(id, 0);
    }
  }

  function handleIndentLeft(id: string, offset: number) {
    const data = indentLeft(nodes, id, offset);

    if(data) {
      updateHistory([{ type: HistoryType.INDENT_LEFT, data: { id, offset: data.offset }}]);

      setNodes(data.nodes)

      setTimeout(() => {
        refocusInput(id, offset);
      }, 0)
    }
  }

  function handleIndentRight(id: string, offset: number) {
    const data = indentRight(nodes, id, offset);

    if(data) {
      updateHistory([{ type: HistoryType.INDENT_RIGHT, data: { id, offset: data.offset }}]);

      setNodes(data.nodes)

      setTimeout(() => {
        refocusInput(id, offset);
      }, 0)
    }
  }

  function handleChange(id: string, value: string) {
    /**
     * it's okay that this function updates nodes, we're updating the DB with debounce inside Node.tsx
     */
    const data = onChange(nodes, id, value);
    setNodes(data.nodes);
    updateHistory([{ type: HistoryType.CHANGE_TEXT, data: { id, value }}]);
  }

  if(!nodes) {
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
              <ArrowUturnLeftIcon className={`w-4 h-4 mr-6 ${history.length > 0 ? 'text-slate-500' : 'text-slate-300'}`}/>
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
              <ArrowPathIcon className={'w-4 mr-2 animate-spin'}/>
            </div>
          )}
          <span className={'mr-6 flex items-center'}>
            <button onClick={() => setIsShortcutsModalOpen(true)}>
              <QuestionMarkCircleIcon className={'w-4 text-slate-500'}/>
            </button>
          </span>
          <div className="ml-12 flex items-center">
            <button className='mr-6'>
              <FolderIcon className={'w-4 h-4 text-slate-500'}/>
            </button>
            <button onClick={() => download('Untitled.fibers', JSON.stringify(nodes))}>
              <ArrowDownTrayIcon className={'w-4 h-4 text-slate-500'}/>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        {zoomedNode !== 'root' && (
          <div className={'px-6'}>
            <NodeTitleInput
              value={nodes[zoomedNode]?.value}
              onDebounceChange={(value) => {
                setIsSaved(true)
              }}
              onChange={(value) => {
                setIsSaved(false);
                const data = onChange(nodes, zoomedNode, value);
                updateHistory([{ type: HistoryType.CHANGE_TEXT, data: { id: zoomedNode, value: data.previousValue }}]);
                setNodes(data.nodes);
              }}
              placeholder={!nodes[zoomedNode]?.value ? 'Untitled' : ''}
            />
          </div>
        )}
        <div
          className={'-ml-10 whitespace-nowrap overflow-x-scroll min-h-screen'}
        >
        <Node
          id={zoomedNode}
          zoomedNode={zoomedNode}
          value={nodes[zoomedNode]?.value}
          nodes={nodes}
          onChange={(id, value) => handleChange(id, value)}
          onAddNode={(id, offset) => handleAddNode(id, offset)}
          onIndentLeft={(id, offset) => handleIndentLeft(id, offset)}
          onIndentRight={(id, offset) => handleIndentRight(id, offset)}
          onMoveCursorUp={(id, offset) => moveCursorUp(id, offset)}
          onMoveCursorDown={(id, offset) => moveCursorDown(id, offset)}
          onExpand={(id) => handleExpand(nodes, id)}
          onCollapse={(id) => handleCollapse(nodes, id)}
          onDelete={(id, startOffset, endOffset) => handleDelete(nodes, id, startOffset, endOffset)}
          onZoom={(id) => handleZoom(id)}
          onDropSibling={(dragId, dropId) => handleDropSibling(dragId, dropId)}
          onDropChild={(dragId, dropId) => handleDropChild(dragId, dropId)}
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