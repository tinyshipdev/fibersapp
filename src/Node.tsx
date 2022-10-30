import React, {useRef, useState} from 'react';
import {ACTION_KEYS, NodesInterface} from "./RootNode";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/20/solid";
import {ArrowsPointingOutIcon, MagnifyingGlassPlusIcon} from "@heroicons/react/24/outline";

interface NodeProps {
  id: string;
  value: string;
  focusedNode: string;
  nodes: NodesInterface;
  onChange: (id: string, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onKeyUp: (e: React.KeyboardEvent) => void;
  onFocus: (id: string) => void;
  onExpand: (id: string) => void;
  onCollapse: (id: string) => void;
  onDelete: (id: string) => void;
  onZoom: (id: string) => void;
  onDrag: (id: string) => void;
  onDrop: (id: string) => void;
}

const Node: React.FC<NodeProps> = ({
  id,
  value,
  focusedNode,
  nodes,
  onChange,
  onKeyDown,
  onKeyUp,
  onFocus,
  onExpand,
  onCollapse,
  onDelete,
  onZoom,
  onDrag,
  onDrop,
}) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const graphMap = (
    <ul className={'list-none'}>
      {nodes[id]?.children?.map((n: any) => (
        <Node
          key={n}
          id={n}
          value={nodes[n].value}
          focusedNode={focusedNode}
          nodes={nodes}
          onChange={(id, value) => onChange(id, value)}
          onKeyDown={(e) => onKeyDown(e)}
          onKeyUp={(e) => onKeyUp(e)}
          onFocus={(id) => onFocus(id)}
          onExpand={(id) => onExpand(id)}
          onCollapse={(id) => onCollapse(id)}
          onDelete={(id) => onDelete(id)}
          onZoom={(id) => onZoom(id)}
          onDrag={(id) => onDrag(id)}
          onDrop={(id) => onDrop(id)}
        />
      ))}
    </ul>
  )

  if(id === focusedNode) {
    return graphMap;
  }

  const textSpan = (
    <span
      className={'focus:outline-none inline-block w-full'}
      id={id}
      ref={ref}
      contentEditable={true}
      onFocus={() => onFocus(id)}
      onBlur={(e) => onChange(id, e.currentTarget.innerText)}
      onKeyDown={(e) => {
        // this forces the text to be saved to state if we move
        if(ACTION_KEYS.includes(e.key)) { onChange(id, e.currentTarget.innerText) }
        onKeyDown(e);

        if(e.key === 'Backspace' && e.currentTarget.innerText === '') {
          onDelete(id);
        }
      }}
      onKeyUp={(e) => onKeyUp(e)}
      suppressContentEditableWarning={true} // feels a bit dangerous but tired of warnings
    >{value}</span>
  );

  return (
    <li
      key={id}
      className={'ml-10'}
    >
      <div
        data-id={id}
        draggable={true}
        onDrag={(e: any) => {
          e.preventDefault();
          e.stopPropagation();
          onDrag(e.target.dataset.id);
        }}
      >
        <p className={`flex items-center group ${!nodes[id].isExpanded && nodes[id].children.length > 0 && 'text-slate-800 font-bold'}`}>
          <button>
            <ArrowsPointingOutIcon className={'w-4 h-4 text-slate-400 mr-2 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
          </button>
          <button onClick={() => onZoom(id)}>
            <MagnifyingGlassPlusIcon className={'w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 ease-in duration-100'}/>
          </button>
          {nodes[id].isExpanded && nodes[id].children.length > 0 ? (
            <button className={'w-6 h-6 text-slate-400 hover:text-black'} onClick={() => onCollapse(id)}>
              <ChevronDownIcon/>
            </button>
          ) : (
            <button className={`w-6 h-6 ${nodes[id].children.length > 0 ? 'text-black hover:text-black' : 'text-slate-100'}`} onClick={() => onExpand(id)}>
              <ChevronRightIcon/>
            </button>
          )}
          {textSpan}
        </p>
      </div>
      <div
        className={`py-2 transition-spacing ease-in-out duration-100 ${isDraggedOver ? 'py-5' : ''}`}
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggedOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDraggedOver(false);
        }}
        onDrop={(e: any) => {
          e.preventDefault();
          setIsDraggedOver(false);
          onDrop(id);
        }}
      ></div>
      {nodes[id].isExpanded && nodes[id].children.length > 0 && graphMap}
    </li>
  );
};

export default Node;