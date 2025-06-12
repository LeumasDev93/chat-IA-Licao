/* eslint-disable @typescript-eslint/no-unused-vars */
// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Método não permitido');
  }

  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId e message são obrigatórios' });
  }

  try {
    await db.collection('chatMessages').add({
      userId,
      message,
      createdAt: Date.now(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar mensagem' });
  }
}
