import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    service: 'FindBack AI',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    databaseConfigured: !!process.env.DATABASE_URL,
    blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
  });
}
