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

  // we need to find the owner of this shared node
  const [permissions, setPermissions] = useState<string[]>([]);
  const [nodes, setNodes] = useState<NodesInterface | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const user = firebase.auth.currentUser;

  useEffect(() => {
    if(!user) {
      return;
    }

    onSnapshot(doc(firebase.db, "shared-nodes", id), (doc) => {
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
        await persistState(nodes, id);
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

  function canDelete(currentId: string) {
    return permissions.includes('delete') && currentId !== id;
  }

  if(!nodes || !user) {
    return null;
  }

  return (
    <Node
      id={id}
      value={nodes[id].value}
      zoomedNode={parentId}
      isShared={true}
      onShare={() => console.log('maybe do not share this lol')}
      userId={user.uid}
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
        if(canDelete(id)) {
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