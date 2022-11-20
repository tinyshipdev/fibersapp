import React, {useEffect, useState} from 'react';
import {NodesInterface} from "./RootNode";
import Node from "./Node";
import {
  addNode, addNodeAsChild,
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
  onRemoveSharedRoot: (rootId: string) => void;
  onSharedNodeFetchError: (rootId: string) => void;
}

const SharedNodeRoot: React.FC<Props> = ({
  rootId,
  parentId,
  onMoveCursorUp,
  onMoveCursorDown,
  onIndentRight,
  onIndentLeft,
  onRemoveSharedRoot,
  onSharedNodeFetchError,
}) => {
  const [owner, setOwner] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [nodes, setNodes] = useState<NodesInterface | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const user = firebase.auth.currentUser;

  useEffect(() => {
    if(!user) {
      return;
    }

    const unsub = onSnapshot(doc(firebase.db, "shared-nodes", rootId), (doc) => {
      const data = doc?.data();
      if(data?.nodes) {
        setNodes(data.nodes);

        if(data.owner === user.uid) {
          setOwner(data.owner);
        } else if(user.email) {
          setPermissions(data.collaborators[user.email].permissions);
        }
      }
      setHasFetched(true);
    }, () => {
      // handle automatically removing this shared node from the users tree
      onSharedNodeFetchError(rootId);
    });

    return () => unsub();
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

  function canEdit() {
    if(!user) {
      return false;
    }

    return permissions.includes('edit') || owner === user.uid;
  }

  function canDelete() {
    if(!user) {
      return false;
    }

    return permissions.includes('delete') || owner === user.uid;
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
        if(canEdit()) {
          const data = onChange(nodes, id, value);
          setNodes(data.nodes);
        }
      }}
      onExpand={(id) => {
        if (canEdit()) {
          const data = onExpand(nodes, id);
          setNodes(data.nodes);
        }
      }}
      onCollapse={(id) => {
        if(canEdit()) {
          const data = onCollapse(nodes, id);
          setNodes(data.nodes);
        }
      }}
      onDelete={async (id, startOffset, endOffset) => {
        if(id === rootId) {
          if(owner === user.uid && nodes[id].value.length === 0) {
            onRemoveSharedRoot(rootId);
          }
          return;
        }

        if(canDelete()) {
          handleDelete(nodes, id, startOffset, endOffset);
        }
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
          if(canEdit()) {
            const data = addNodeAsChild(nodes, id, offset);
            if (data) {
              setNodes(data.nodes);
              setTimeout(() => {
                refocusInput(data.currentNode, offset);
              }, 0)
            }
          }
          return;
        }

        if(canEdit()) {
          const data = addNode(nodes, id, offset);

          if (data) {
            setNodes(data.nodes);
            setTimeout(() => {
              refocusInput(data.currentNode, offset);
            }, 0)
          }
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

        if(canEdit()) {
          const data = indentLeft(nodes, id, offset);
          if (data) {
            setNodes(data.nodes);
            refocusInput(id, offset);
          }
        }
      }}
      onIndentRight={(id, offset) => {
        if(id === rootId) {
          onIndentRight(id, offset);
          return;
        }

        if(canEdit()) {
          const data = indentRight(nodes, id, offset);
          if (data) {
            setNodes(data.nodes);
            refocusInput(id, offset);
          }
        }
      }}
      onMoveCursorUp={(id, offset) => {
        onMoveCursorUp(id, offset)
      }}
      onMoveCursorDown={(id, offset) => {
        onMoveCursorDown(id, offset)
      }}
      onRemoveSharedRoot={(id) => onRemoveSharedRoot(id)}
      onSharedNodeFetchError={(id) => onSharedNodeFetchError(id)}
    />
  );
};

export default SharedNodeRoot;