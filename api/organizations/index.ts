import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    try {
      const orgs = db.getOrganizations();
      return res.status(200).json({
        success: true,
        data: orgs,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message },
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported' },
  });
}
