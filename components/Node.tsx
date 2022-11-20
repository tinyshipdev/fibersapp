import React from 'react';
import {NodesInterface} from "./RootNode";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/20/solid";
import {MagnifyingGlassPlusIcon} from "@heroicons/react/24/outline";
import NodeInput from "./NodeInput";
import SharedNodeRoot from "./SharedNodeRoot";
import ShareModal from "./ShareModal";
import {useDrag, useDrop} from "react-dnd";

interface NodeProps {
  id: string;
  value: string;
  zoomedNode: string;
  nodes: NodesInterface;
  onChange: (id: string, value: string) => void;
  onExpand: (id: string) => void;
  onCollapse: (id: string) => void;
  onDelete: (id: string, startOffset: number, endOffset: number) => void;
  onZoom: (id: string) => void;
  onDropSibling: (dragId: string, dropId: string) => void;
  onDropChild:(dragId: string, dropId: string) => void;
  onAddNode: (id: string, offset: number) => void;
  onIndentLeft: (id: string, offset: number) => void;
  onIndentRight: (id: string, offset: number) => void;
  onMoveCursorUp: (id: string, offset: number) => void;
  onMoveCursorDown: (id: string, offset: number) => void;
  isShared?: boolean;
  userId: string;
  onShare: (newNodes: NodesInterface) => void;
  onRemoveSharedRoot: (sharedRootId: string) => void;
  onSharedNodeFetchError: (rootId: string) => void;
}

const Node: React.FC<NodeProps> = ({
  id,
  value,
  zoomedNode,
  nodes,
  onChange,
  onExpand,
  onCollapse,
  onDelete,
  onZoom,
  onDropChild,
  onDropSibling,
  onAddNode,
  onIndentLeft,
  onIndentRight,
  onMoveCursorUp,
  onMoveCursorDown,
  isShared= false,
  userId,
  onShare,
  onRemoveSharedRoot,
  onSharedNodeFetchError
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NODE',
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }))

  const [{ isSiblingOver }, dropSibling] = useDrop(() => ({
    accept: 'NODE',
    drop: (item: { id: string }) => {
      onDropSibling(item.id, id);
    },
    collect: monitor => ({
      isSiblingOver: !!monitor.isOver(),
    }),
  }))

  const [{ isChildOver }, dropChild] = useDrop(() => ({
    accept: 'NODE',
    drop: (item: { id: string }) => {
      onDropChild(item.id, id);
    },
    collect: monitor => ({
      isChildOver: !!monitor.isOver(),
    }),
  }))

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const startOffset = e.currentTarget.selectionStart || 0;
    const endOffset = e.currentTarget.selectionEnd || 0;

    if(e.shiftKey) {
      switch(e.key) {
        case 'Tab':
          e.preventDefault();
          onIndentLeft(id, startOffset);
          break;
      }
      return;
    }

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        onIndentRight(id, startOffset);
        break;
      case 'Enter':
        if(value === '') {
          onIndentLeft(id, startOffset);
        } else {
          onAddNode(id, startOffset)
        }
        break;
      case 'Backspace':
        onDelete(id, startOffset, endOffset);
        break;
      case 'ArrowUp':
        onMoveCursorUp(id, startOffset);
        break;
      case 'ArrowDown':
        onMoveCursorDown(id, startOffset);
        break;
    }
  }

  const graphMap = (
    <ul className={'list-none'}>
      {nodes[id]?.children?.map((n: any) => {
        if(!nodes[n]) {
          return null;
        }

        if(!nodes[n]?.shared) {
          return (
            <Node
              key={n}
              id={n}
              value={nodes[n].value}
              zoomedNode={zoomedNode}
              isShared={isShared}
              nodes={nodes}
              userId={userId}
              onChange={(id, value) => onChange(id, value)}
              onAddNode={(id, offset) => onAddNode(id, offset)}
              onIndentLeft={(id, offset) => onIndentLeft(id, offset)}
              onIndentRight={(id, offset) => onIndentRight(id, offset)}
              onMoveCursorUp={(id, offset) => onMoveCursorUp(id, offset)}
              onMoveCursorDown={(id, offset) => onMoveCursorDown(id, offset)}
              onExpand={(id) => onExpand(id)}
              onCollapse={(id) => onCollapse(id)}
              onDelete={(id, startOffset, endOffset) => onDelete(id, startOffset, endOffset)}
              onZoom={(id) => onZoom(id)}
              onDropChild={(dragId, dropId) => onDropChild(dragId, dropId)}
              onDropSibling={(dragId, dropId) => onDropSibling(dragId, dropId)}
              onShare={(newNodes) => onShare(newNodes)}
              onRemoveSharedRoot={(sharedRootId) => onRemoveSharedRoot(sharedRootId)}
              onSharedNodeFetchError={(sharedRootId) => onSharedNodeFetchError(sharedRootId)}
            />
          )
        } else if(nodes[n]?.shared) {
          return (
            <SharedNodeRoot
              key={n}
              rootId={n}
              parentId={id}
              onMoveCursorUp={(id, offset) => onMoveCursorUp(id, offset)}
              onMoveCursorDown={(id, offset) => onMoveCursorDown(id, offset)}
              onIndentRight={(id, offset) => onIndentRight(id, offset)}
              onIndentLeft={(id, offset) => onIndentLeft(id, offset)}
              onRemoveSharedRoot={(sharedRootId) => onRemoveSharedRoot(sharedRootId)}
              onSharedNodeFetchError={(sharedRootId) => onSharedNodeFetchError(sharedRootId)}
            />
          )
        }
      })}
    </ul>
  )

  if(id === zoomedNode) {
    return graphMap;
  }

  // if(nodes[id]?.shared) {
  //   return (
  //     <SharedNodeRoot
  //       key={id}
  //       id={id}
  //       parentId={id}
  //       onMoveCursorUp={(id, offset) => onMoveCursorUp(id, offset)}
  //       onMoveCursorDown={(id, offset) => onMoveCursorDown(id, offset)}
  //     />
  //   )
  // }

  return (
    <li
      key={id}
      className={`ml-10 relative`}
      data-id={id}
      ref={drag}
    >
      <div className={`flex items-center group ${isShared ? 'ml-6' : ''} ${!nodes[id].isExpanded && nodes[id].children.length > 0 ? 'text-slate-800 font-bold' : ''}`}>
        {!isShared && (
          <span className={'mr-2'}>
            <ShareModal rootId={id} nodes={nodes} userId={userId} onShare={(newNodes) => onShare(newNodes)}/>
          </span>
        )}
        <button onClick={() => onZoom(id)}>
          <MagnifyingGlassPlusIcon className={'w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
        </button>
        <span>
        {nodes[id].isExpanded && nodes[id].children.length > 0 ? (
          <button className={`w-6 h-6 hover:text-black ${isShared ? 'text-green-400' : 'text-slate-400'}`} onClick={() => onCollapse(id)}>
            <ChevronDownIcon className={`${isShared ? 'text-teal-500' : ''}`}/>
          </button>
        ) : (
          <button
            className={`w-6 h-6 ${nodes[id].children.length > 0 ? 'text-black hover:text-black' : 'text-slate-300 hover:text-slate-300'}`}
            onClick={() => {
              if(nodes[id].children.length > 0) {
                onExpand(id)
              }
            }}
          >
            <ChevronRightIcon className={`${isShared ? 'text-teal-500' : ''}`}/>
          </button>
        )}
        </span>
        <NodeInput
          id={id}
          onChange={(value) => onChange(id, value)}
          onKeyDown={(e) => handleKeyDown(e)}
          value={value}
        />
      </div>
      {!isDragging && (
        <div className={'relative ml-10'}>
          <div className="flex">
            <div
              className={`w-10 py-1 transition ease-in-out duration-100 ${isSiblingOver ? 'bg-slate-300' : ''}`}
              ref={dropSibling}
            />
            <div
              className={`w-10 py-1 transition ease-in-out duration-100 ${isChildOver ? 'bg-slate-300' : ''}`}
              ref={dropChild}
            />
          </div>
        </div>
      )}
      {nodes[id].isExpanded && nodes[id].children.length > 0 && !isDragging && graphMap}
    </li>
  );
};

export default Node;