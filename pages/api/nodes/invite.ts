import { NextApiRequest, NextApiResponse } from 'next';
import firebase from '../../../lib/firebase';
import { getToken } from "next-auth/jwt"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const token = await getToken({ req });

  if(!token) {
    return res.status(401).json({ error: 'You are not authorized to view this page' });
  }

  // if(req.method !== 'POST') {
  //   return res.status(200).json({});
  // }

  try {
    const docRef = firebase.db.collection('shared-nodes').doc(req.query.nodeId);

    await docRef.set({
      owner: token.id,
      collaborators: {
        // hard-code the miro user for now
        '105701968516807502854': {
          permissions: ['view', 'edit', 'delete']
        }
      }
    });

    return res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(500).json({error: 'An error occurred'})
  }
}