import React, {useEffect, useState} from 'react';
import {NodesInterface} from "./RootNode";
import Node from "./Node";

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

const SharedNodeRoot: React.FC<Props> = ({
  id,
  parentId
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [nodes, setNodes] = useState<NodesInterface | null>(null);

  useEffect(() => {
    async function getInitialNodes() {
      const data = await fetchSharedNodes(id, parentId);
      if(data.nodes) {
        setNodes(data.nodes);
        setPermissions(data.permissions);
      }
    }
    getInitialNodes();
  }, []);


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
      onAddNode={() => console.log('test')}
      onIndentLeft={() => console.log('test')}
      onIndentRight={() => console.log('test')}
      onMoveCursorUp={() => console.log('test')}
      onMoveCursorDown={() => console.log('test')}
    />
  );
};

export default SharedNodeRoot;