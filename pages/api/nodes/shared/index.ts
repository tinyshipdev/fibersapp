import { NextApiRequest, NextApiResponse } from 'next';
import firebase from '../../../../lib/firebase';
import {NodesInterface} from "../../../../components/RootNode";

interface SharedNodePermissions {
  owner: string,
  collaborators: {
    [name: string]: {
      permissions: string[]
    }
  }
}

function getAllNodes(data: NodesInterface, nodes: NodesInterface, id: string) {
  if(nodes[id].children.length <= 0) {
    return data;
  }

  nodes[id].children.forEach((child) => {
    data[child] = nodes[child];
    getAllNodes(data, nodes, child);
  })

  return data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  if(req.method === 'POST') {
    const doc = await firebase.db.collection('nodes').doc(req.body.owner);

    await doc.set({
      data: req.body.nodes
    }, { merge: true });

    return res.status(200).json({});
  }

  if(req.method !== 'GET') {
    return res.status(200).json({});
  }

  const nodeId = req.query.id as string;
  const parentId = req.query.parentId as string;

  try {
    const doc = await firebase.db.collection(`shared-nodes`).doc(nodeId).get();
    const data: SharedNodePermissions = doc.data();

    if(!data) {
      return res.status(401).json({ error: 'Insufficient permissions' });
    }

    // @ts-ignore
    if(!data.collaborators[token.id]) {
      return res.status(401).json({ error: 'You do not have permissions to view this node' });
    }

    // @ts-ignore
    const permissions = data.collaborators[token.id].permissions;

    if(permissions.includes('view')) {
      const doc = await firebase.db.collection('nodes').doc(data.owner).get();
      const docData = doc.data();

      let nodes: NodesInterface = {};

      // @ts-ignore
      let node = docData.data[nodeId];
      // set found node parent to the local parent
      node.parent = parentId;
      nodes[nodeId] = node;

      const n = getAllNodes({ [nodeId]: node }, docData.data, nodeId);

      return res.status(200).json({ nodes: n, permissions, owner: data.owner });
    }

  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Insufficient permissions' });
  }
}