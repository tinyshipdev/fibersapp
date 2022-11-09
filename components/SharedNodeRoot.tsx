import React, {useEffect, useState} from 'react';
import {NodesInterface} from "./RootNode";
import Node from "./Node";
import {addNode, indentLeft, indentRight, onChange, onCollapse, onDelete, onExpand} from "../lib/nodes-controller";

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
}

const SharedNodeRoot: React.FC<Props> = ({
  id,
  parentId,
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


  function handleDelete(nodes: NodesInterface, id: string, startOffset: number, endOffset: number) {
    const data = onDelete(nodes, id, startOffset, endOffset);

    if(!data) {
      return null;
    }

    setNodes(data.nodes);
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
        }
      }}
      onIndentRight={(id, offset) => {
        if(!nodes[id]) {
          // call indent right on parent instead
          return;
        }

        const data = indentRight(nodes, id, offset);
        if(data) {
          setNodes(data.nodes);
        }
      }}
      onMoveCursorUp={() => {
        // call parent
        console.log('test')
      }}
      onMoveCursorDown={() => {
        // call parent
        console.log('test')
      }}
    />
  );
};

export default SharedNodeRoot;