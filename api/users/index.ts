import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: db.getUsers(),
    });
  }
  return res.status(405).json({
    success: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported' },
  });
}
