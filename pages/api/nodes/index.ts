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

  if(req.method === 'GET') {
    try {
      const data = await firebase.db.collection('nodes').doc(req.query.userId).get();
      return res.status(200).json(data.data());
    } catch (err) {
      return res.status(500).json({ error: 'An error occurred' })
    }
  }

  if(req.method === 'POST') {
    try {
      const data = JSON.parse(req.body);

      const docRef = firebase.db.collection('nodes').doc(data.userId);

      await docRef.set({
        data: data.data
      });

      return res.status(200).json({});
    } catch (err) {
      return res.status(500).json({ error: 'An error occurred' })
    }
  }

  return res.status(200)
}