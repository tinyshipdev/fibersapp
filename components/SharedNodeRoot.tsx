import React, {useEffect, useState} from 'react';
import {NodesInterface} from "./RootNode";
import Node from "./Node";
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

async function fetchSharedNodes(id: string, parentId: string) {
  const data = await fetch(`/api/nodes/shared?id=${id}&parentId=${parentId}`, {
    method: 'GET'
  });

  return await data?.json();
}

async function persistState(nodes: NodesInterface, owner: string) {
  const data = await fetch('/api/nodes/shared', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      nodes,
      owner
    })
  })

  return await data?.json();
}

interface Props {
  id: string;
  parentId: string;
  onMoveCursorUp: (id: string, offset: number) => void;
  onMoveCursorDown: (id: string, offset: number) => void;
}

const SharedNodeRoot: React.FC<Props> = ({
  id,
  parentId,
  onMoveCursorUp,
  onMoveCursorDown,
}) => {
  const [owner, setOwner] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [nodes, setNodes] = useState<NodesInterface | null>(null);

  useEffect(() => {
    async function getInitialNodes() {
      const data = await fetchSharedNodes(id, parentId);
      if(data.nodes) {
        setNodes(data.nodes);
        setPermissions(data.permissions);
        setOwner(data.owner);
      }
    }
    getInitialNodes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if(nodes) {
        await persistState(nodes, owner);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    }
  }, [nodes]);

  function handleExpand(nodes: NodesInterface, id: string) {
    const data = onExpand(nodes, id);
    setNodes(data.nodes);
  }


  function handleDelete(nodes: NodesInterface, id: string, startOffset: number, endOffset: number) {
    const data = onDelete({...nodes}, id, startOffset, endOffset);

    if(!data) {
      return null;
    }

    if(data.isCollapsed) {
      handleExpand({ ...nodes }, id);
      return null;
    }

    if(data.nodes) {
      setNodes(data.nodes);
      onMoveCursorUp(id, 0);
    }
  }

  if(!nodes) {
    return null;
  }

  return (
    <Node
      id={id}
      value={nodes[id].value}
      zoomedNode={parentId}
      isShared={true}
      nodes={nodes}
      onChange={(id, value) => {
        if(permissions.includes('edit')) {
          const data = onChange(nodes, id, value);
          setNodes(data.nodes);
        }
      }}
      onExpand={(id) => {
        const data = onExpand(nodes, id);
        setNodes(data.nodes);
      }}
      onCollapse={(id) => {
        const data = onCollapse(nodes, id);
        setNodes(data.nodes);
      }}
      onDelete={(id, startOffset, endOffset) => {
        if(permissions.includes('edit')) {
          handleDelete(nodes, id, startOffset, endOffset);
        }
      }}
      onZoom={() => console.log('test')}
      onDrag={() => console.log('test')}
      onDropSibling={(id) => {
        if(!nodes[id]) {
          // call onDropSibling on parent instead
          return;
        }
      }}
      onDropChild={() => {
        if(!nodes[id]) {
          // call onDropChild on parent instead
          return;
        }
      }}
      onAddNode={(id, offset) => {
        // if the current nodes parent doesn't exist in the shared nodes space,
        // we need to check the higher level nodes and add there
        if(!nodes[nodes[id].parent]) {
          return;
        }

        if(permissions.includes('edit')) {
          const data = addNode(nodes, id, offset);
          setNodes(data.nodes);
          refocusInput(data.currentNode, offset);
        }
      }}
      onIndentLeft={(id, offset) => {
        if(!nodes[id]) {
          // call indent left on parent instead
          return;
        }

        const data = indentLeft(nodes, id, offset);
        if(data) {
          setNodes(data.nodes);
          refocusInput(id, offset);
        }
      }}
      onIndentRight={(id, offset) => {
        if(!nodes[id]) {
          // call indent right on parent instead
          // onIndentRight(id, offset)
          return;
        }

        const data = indentRight(nodes, id, offset);
        if(data) {
          setNodes(data.nodes);
          refocusInput(id, offset);
        }
      }}
      onMoveCursorUp={(id, offset) => {
        onMoveCursorUp(id, offset)
      }}
      onMoveCursorDown={(id, offset) => {
        onMoveCursorDown(id, offset)
      }}
    />
  );
};

export default SharedNodeRoot;