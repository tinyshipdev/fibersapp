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
import {doc, onSnapshot, updateDoc} from "firebase/firestore";
import firebase from "../lib/firebase-client";

async function persistState(nodes: NodesInterface, id: string) {
  await updateDoc(doc(firebase.db, "shared-nodes", id), {
    nodes
  });
}

interface Props {
  rootId: string;
  parentId: string;
  onMoveCursorUp: (id: string, offset: number) => void;
  onMoveCursorDown: (id: string, offset: number) => void;
  onIndentRight: (id: string, offset: number) => void;
  onIndentLeft: (id: string, offset: number) => void;
}

const SharedNodeRoot: React.FC<Props> = ({
  rootId,
  parentId,
  onMoveCursorUp,
  onMoveCursorDown,
  onIndentRight,
  onIndentLeft,
}) => {

  const [permissions, setPermissions] = useState<string[]>([]);
  const [nodes, setNodes] = useState<NodesInterface | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const user = firebase.auth.currentUser;

  useEffect(() => {
    if(!user) {
      return;
    }

    onSnapshot(doc(firebase.db, "shared-nodes", rootId), (doc) => {
      const data = doc?.data();
      if(data?.nodes) {
        setNodes(data.nodes);

        if(data.owner === user.uid) {
          setPermissions(['view', 'edit', 'delete']);
        } else if(user.email) {
          setPermissions(data.collaborators[user.email].permissions);
        }
      }
      setHasFetched(true);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if(user && hasFetched && nodes) {
        await persistState(nodes, rootId);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
    }
  }, [nodes, hasFetched]);

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

  if(!nodes || !user) {
    return null;
  }

  return (
    <Node
      id={rootId}
      value={nodes[rootId].value}
      zoomedNode={parentId}
      isShared={true}
      onShare={() => {
        return null;
      }}
      userId={user.uid}
      nodes={nodes}
      onChange={(id, value) => {
        if(id === rootId) {
          return;
        }

        if(!permissions.includes('edit')) {
          return;
        }

        const data = onChange(nodes, id, value);
        setNodes(data.nodes);
      }}
      onExpand={(id) => {
        if(!permissions.includes('edit')) {
          return;
        }
        const data = onExpand(nodes, id);
        setNodes(data.nodes);
      }}
      onCollapse={(id) => {
        if(!permissions.includes('edit')) {
          return;
        }

        const data = onCollapse(nodes, id);
        setNodes(data.nodes);
      }}
      onDelete={(id, startOffset, endOffset) => {
        if(id === rootId) {
          return;
        }

        if(nodes[id].parent === rootId) {
          return;
        }

        if(!permissions.includes('delete')) {
          return;
        }

        handleDelete(nodes, id, startOffset, endOffset);
      }}
      onZoom={() => {
        return null;
      }}
      onDrag={() => {
        return null;
      }}
      onDropSibling={(id) => {
        if(id === rootId) {
          return;
        }
      }}
      onDropChild={(id) => {
        if(id === rootId) {
          return;
        }
      }}
      onAddNode={(id, offset) => {
        if(id === rootId) {
          return;
        }

        if(!permissions.includes('edit')) {
          return;
        }

        const data = addNode(nodes, id, offset);

        if(data) {
          setNodes(data.nodes);
          setTimeout(() => {
            refocusInput(data.currentNode, offset);
          }, 0)
        }
      }}
      onIndentLeft={(id, offset) => {
        if(id === rootId) {
          onIndentLeft(id, offset);
          return;
        }

        if(nodes[id].parent === rootId) {
          return;
        }

        if(!permissions.includes('edit')) {
          return;
        }

        const data = indentLeft(nodes, id, offset);
        if(data) {
          setNodes(data.nodes);
          refocusInput(id, offset);
        }
      }}
      onIndentRight={(id, offset) => {
        if(id === rootId) {
          onIndentRight(id, offset);
          return;
        }

        if(!permissions.includes('edit')) {
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