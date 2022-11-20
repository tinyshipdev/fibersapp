import React, {useState} from 'react';
import {NodesInterface} from "./RootNode";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/20/solid";
import {MagnifyingGlassPlusIcon} from "@heroicons/react/24/outline";
import NodeInput from "./NodeInput";
import SharedNodeRoot from "./SharedNodeRoot";
import ShareModal from "./ShareModal";

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
  onDrag: (id: string) => void;
  onDropSibling: (id: string) => void;
  onDropChild:(id: string) => void;
  onAddNode: (id: string, offset: number) => void;
  onIndentLeft: (id: string, offset: number) => void;
  onIndentRight: (id: string, offset: number) => void;
  onMoveCursorUp: (id: string, offset: number) => void;
  onMoveCursorDown: (id: string, offset: number) => void;
  isShared?: boolean;
  userId: string;
  onShare: (id: string) => void;
  onRemoveSharedRoot: (sharedRootId: string) => void;
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
  onDrag,
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
}) => {
  const [isDraggable, setIsDraggable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSiblingDraggedOver, setIsSiblingDraggedOver] = useState(false);
  const [isChildDraggedOver, setIsChildDraggedOver] = useState(false);

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
              onDrag={(id) => onDrag(id)}
              onDropChild={(id) => onDropChild(id)}
              onDropSibling={(id) => onDropSibling(id)}
              onShare={(id) => onShare(id)}
              onRemoveSharedRoot={(sharedRootId) => onRemoveSharedRoot(sharedRootId)}
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
      draggable={isDraggable}
      onDragStart={(e: any) => {
        e.stopPropagation();
        setIsDragging(true);
        onDrag(e.target.dataset.id);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        setIsDragging(false)
      }}
    >
      <div className={`flex items-center group ${isShared ? 'ml-6' : ''} ${!nodes[id].isExpanded && nodes[id].children.length > 0 ? 'text-slate-800 font-bold' : ''}`}>
        {!isShared && (
          <span className={'mr-2'}>
            <ShareModal rootId={id} nodes={nodes} userId={userId} onShare={() => onShare(id)}/>
          </span>
        )}
        <button onClick={() => onZoom(id)}>
          <MagnifyingGlassPlusIcon className={'w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
        </button>
        <span
          onMouseOver={() => setIsDraggable(true)}
          onMouseOut={() => setIsDraggable(false)}
        >
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
        <div className={'relative left-9'}>
          <div className="flex">
            <div
              className={`w-10 py-1 transition ease-in-out duration-100 ${isSiblingDraggedOver ? 'bg-slate-300' : ''}`}
              onDragEnter={() => setIsSiblingDraggedOver(true)}
              onDragLeave={() => setIsSiblingDraggedOver(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                onDropSibling(id);
                setIsSiblingDraggedOver(false)
              }}
            />
            <div
              className={`w-10 py-1 transition ease-in-out duration-100 ${isChildDraggedOver ? 'bg-slate-300' : ''}`}
              onDragEnter={() => setIsChildDraggedOver(true)}
              onDragLeave={() => setIsChildDraggedOver(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                onDropChild(id);
                setIsChildDraggedOver(false)
              }}
            />
          </div>
        </div>
      )}
      {nodes[id].isExpanded && nodes[id].children.length > 0 && !isDragging && graphMap}
    </li>
  );
};

export default Node;