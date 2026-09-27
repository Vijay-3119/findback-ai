import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'POST') {
    db.resetToDefault();
    return res.status(200).json({
      success: true,
      message: 'Database reset to initial demo seeds.',
    });
  }

  return res.status(405).json({
    success: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported' },
  });
}
