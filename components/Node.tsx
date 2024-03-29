import React from 'react';
import {NodesInterface} from "./RootNode";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/20/solid";
import {MagnifyingGlassPlusIcon} from "@heroicons/react/24/outline";
import NodeInput from "./NodeInput";
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
  onDropChild: (dragId: string, dropId: string) => void;
  onAddNode: (id: string, offset: number) => void;
  onIndentLeft: (id: string, offset: number) => void;
  onIndentRight: (id: string, offset: number) => void;
  onMoveCursorUp: (id: string, offset: number) => void;
  onMoveCursorDown: (id: string, offset: number) => void;
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
  onDropSibling,
  onDropChild,
  onAddNode,
  onIndentLeft,
  onIndentRight,
  onMoveCursorUp,
  onMoveCursorDown
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NODE',
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }), [])

  const [{ isSiblingOver }, dropSibling] = useDrop(() => ({
    accept: 'NODE',
    drop: (item: { id: string }) => {
      onDropSibling(item.id, id);
    },
    collect: monitor => ({
      isSiblingOver: !!monitor.isOver(),
    }),
  }), [nodes]) // use drop is memoized so need to add nodes so we have the most recent onDropSibling

  const [{ isChildOver }, dropChild] = useDrop(() => ({
    accept: 'NODE',
    drop: (item: { id: string }) => {
      onDropChild(item.id, id);
    },
    collect: monitor => ({
      isChildOver: !!monitor.isOver(),
    }),
  }), [nodes])

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

        return (
          <Node
            key={n}
            id={n}
            value={nodes[n].value}
            zoomedNode={zoomedNode}
            nodes={nodes}
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
            onDropSibling={(dragId, dropId) => onDropSibling(dragId, dropId)}
            onDropChild={(dragId, dropId) => onDropChild(dragId, dropId)}
          />
        )
      })}
    </ul>
  )

  if(id === zoomedNode) {
    return graphMap;
  }

  return (
    <li
      key={id}
      className={`ml-10 relative`}
      data-id={id}
      ref={drag}
    >
      <div className={`flex items-center group ${!nodes[id].isExpanded && nodes[id].children.length > 0 ? 'text-slate-800 font-bold' : ''}`}>
        <button onClick={() => onZoom(id)} className={'block ml-2'}>
          <MagnifyingGlassPlusIcon className={'w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
        </button>
        {nodes[id].isExpanded && nodes[id].children.length > 0 ? (
          <button className={`w-6 h-6 hover:text-black text-slate-400`} onClick={() => onCollapse(id)}>
            <ChevronDownIcon/>
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
            <ChevronRightIcon/>
          </button>
        )}
        <NodeInput
          id={id}
          onChange={(value) => {
            onChange(id, value);
          }}
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