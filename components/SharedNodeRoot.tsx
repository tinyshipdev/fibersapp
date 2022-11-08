import React, {useEffect, useState} from 'react';
import {NodesInterface} from "./RootNode";
import SharedNode from "./SharedNode";

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
  const [nodes, setNodes] = useState<NodesInterface | null>(null);

  useEffect(() => {
    async function getInitialNodes() {
      const data = await fetchSharedNodes(id, parentId);
      if(!data.error) {
        setNodes(data);
      }
    }
    getInitialNodes();
  }, [])

  if(!nodes) {
    return null;
  }


  return (
    <SharedNode id={id} nodes={nodes}/>
  );
};

export default SharedNodeRoot;