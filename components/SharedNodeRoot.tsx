import React, {useEffect, useState} from 'react';
import {NodesInterface} from "./RootNode";
import Node from "./Node";
import {addNode} from "../lib/nodes-controller";

interface Props {
  id: string;
  parentId: string;
}

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

const SharedNodeRoot: React.FC<Props> = ({
  id,
  parentId
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
    }, 1000);

    return () => {
      clearTimeout(timer);
    }
  }, [nodes]);


  // use permissions object to determine what actions can be performed on the nodes

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
      onChange={() => console.log('test')}
      onExpand={() => console.log('test')}
      onCollapse={() => console.log('test')}
      onDelete={() => console.log('test')}
      onZoom={() => console.log('test')}
      onDrag={() => console.log('test')}
      onDropSibling={() => console.log('test')}
      onDropChild={() => console.log('test')}
      onAddNode={(id, offset) => {
        if(permissions.includes('edit')) {
          const data = addNode(nodes, id, offset);
          setNodes(data.nodes);
        }
      }}
      onIndentLeft={() => console.log('test')}
      onIndentRight={() => console.log('test')}
      onMoveCursorUp={() => console.log('test')}
      onMoveCursorDown={() => console.log('test')}
    />
  );
};

export default SharedNodeRoot;