import React, {useEffect, useRef} from 'react';

interface TaskNodeProps {
  id: string;
  value: string;
  graph: any;
  nodes: any;
  onAddTask: (id: string) => void;
  onIndentRight: (id: string) => void;
  onIndentLeft: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onKeyUp: (e: React.KeyboardEvent) => void;
  onFocus: (id: string) => void;
}

function setCaret(id: string, pos: number) {
  const el: any = document.getElementById(id)
  const range: any = document.createRange()
  const sel: any = window.getSelection()

  // TODO: this needs to keep the same caret position, not just go to the end.
  if(el.childNodes[0]) {
    range.setStart(el.childNodes[0], pos)
    range.collapse(true)

    sel.removeAllRanges()
    sel.addRange(range)
  }
}

const Task: React.FC<TaskNodeProps> = ({
  id,
  value,
  graph,
  nodes,
  onAddTask,
  onIndentRight,
  onIndentLeft,
  onChange,
  onKeyDown,
  onKeyUp,
  onFocus,
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  let caretPos = 0;

  // find the position of the cursor within this task
  if(document?.getSelection()?.anchorNode?.parentNode === document.activeElement) {
    caretPos = document?.getSelection()?.anchorOffset || 0;
  }

  useEffect(() => {
    setCaret(id, caretPos)
  }, [])

  const graphMap = (
    <ul className={'list-disc'}>
      {graph[id]?.map((n: any) => (
        <Task
          key={n}
          id={n}
          value={nodes[n].value}
          graph={graph}
          nodes={nodes}
          onAddTask={(id) => onAddTask(id)}
          onIndentRight={(id) => onIndentRight(id)}
          onIndentLeft={(id) => onIndentLeft(id)}
          onChange={(id, value) => onChange(id, value)}
          onKeyDown={(e) => onKeyDown(e)}
          onKeyUp={(e) => onKeyUp(e)}
          onFocus={(id) => onFocus(id)}
        />
      ))}
    </ul>
  )

  if(id === 'root') {
    return graphMap;
  }

  return (
    <li key={id} className={'ml-10'}>
      <p>
        <span
          className={'focus:outline-none'}
          id={id}
          style={{ width: 100, display: 'inline-block'}}
          ref={ref}
          contentEditable={true}
          onFocus={() => onFocus(id)}
          onInput={(e) => {
            onChange(id, e.currentTarget.innerText);
          }}
          onKeyDown={(e) => onKeyDown(e)}
          onKeyUp={(e) => onKeyUp(e)}
          suppressContentEditableWarning={true} // feels a bit dangerous but tired of warnings
        >{value}</span>
      </p>
      {graphMap}
    </li>
  );
};

export default Task;