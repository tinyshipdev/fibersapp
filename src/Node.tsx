import React, {useState} from 'react';
import {NodesInterface} from "./RootNode";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/20/solid";
import {MagnifyingGlassPlusIcon} from "@heroicons/react/24/outline";

interface NodeProps {
  id: string;
  value: string;
  zoomedNode: string;
  nodes: NodesInterface;
  onChange: (id: string, value: string) => void;
  onExpand: (id: string) => void;
  onCollapse: (id: string) => void;
  onDelete: (id: string, offset: number) => void;
  onZoom: (id: string) => void;
  onDrag: (id: string) => void;
  onDropSibling: (id: string) => void;
  onDropChild:(id: string) => void;
  onAddNodeBelow: (id: string, offset: number) => void;
  onIndentLeft: (id: string, offset: number) => void;
  onIndentRight: (id: string, offset: number) => void;
  onMoveCursorUp: (id: string) => void;
  onMoveCursorDown: (id: string) => void;
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
  onAddNodeBelow,
  onIndentLeft,
  onIndentRight,
  onMoveCursorUp,
  onMoveCursorDown,
}) => {
  const [isDraggable, setIsDraggable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSiblingDraggedOver, setIsSiblingDraggedOver] = useState(false);
  const [isChildDraggedOver, setIsChildDraggedOver] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const offset = e.currentTarget.selectionStart || 0;

    if(e.shiftKey) {
      switch(e.key) {
        case 'Tab':
          e.preventDefault();
          onIndentLeft(id, offset);
          break;
      }
      return;
    }

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        onIndentRight(id, offset);
        break;
      case 'Enter':
        onAddNodeBelow(id, offset)
        break;
      case 'Backspace':
        onDelete(id, offset);
        break;
      case 'ArrowUp':
        onMoveCursorUp(id);
        break;
      case 'ArrowDown':
        onMoveCursorDown(id);
        break;
    }
  }

  const graphMap = (
    <ul className={'list-none'}>
      {nodes[id]?.children?.map((n: any) => (
        <Node
          key={n}
          id={n}
          value={nodes[n].value}
          zoomedNode={zoomedNode}
          nodes={nodes}
          onChange={(id, value) => onChange(id, value)}
          onAddNodeBelow={(id, offset) => onAddNodeBelow(id, offset)}
          onIndentLeft={(id, offset) => onIndentLeft(id, offset)}
          onIndentRight={(id, offset) => onIndentRight(id, offset)}
          onMoveCursorUp={(id) => onMoveCursorUp(id)}
          onMoveCursorDown={(id) => onMoveCursorDown(id)}
          onExpand={(id) => onExpand(id)}
          onCollapse={(id) => onCollapse(id)}
          onDelete={(id, offset) => onDelete(id, offset)}
          onZoom={(id) => onZoom(id)}
          onDrag={(id) => onDrag(id)}
          onDropChild={(id) => onDropChild(id)}
          onDropSibling={(id) => onDropSibling(id)}
        />
      ))}
    </ul>
  )

  if(id === zoomedNode) {
    return graphMap;
  }

  const textSpan = (
    <input
      className={'focus:outline-none inline-block w-full bg-inherit'}
      id={id}
      onChange={(e) => onChange(id, e.target.value)}
      onKeyDown={(e) => handleKeyDown(e)}
      value={value}
      autoComplete={"off"}
    />
  );

  return (
    <li
      key={id}
      className={'ml-10 relative'}
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
      <p className={`flex items-center group ${!nodes[id].isExpanded && nodes[id].children.length > 0 && 'text-slate-800 font-bold'}`}>
        <button onClick={() => onZoom(id)}>
          <MagnifyingGlassPlusIcon className={'w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
        </button>
        {nodes[id].isExpanded && nodes[id].children.length > 0 ? (
          <button className={'w-6 h-6 text-slate-400 hover:text-black'} onClick={() => onCollapse(id)}>
            <ChevronDownIcon/>
          </button>
        ) : (
          <button
            className={`w-6 h-6 ${nodes[id].children.length > 0 ? 'text-black hover:text-black' : 'text-slate-300 hover:text-slate-300'}`}
            onClick={() => onExpand(id)}
            onMouseOver={() => setIsDraggable(true)}
            onMouseOut={() => setIsDraggable(false)}
          >
            <ChevronRightIcon/>
          </button>
        )}
        {textSpan}
      </p>
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