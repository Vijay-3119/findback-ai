import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';
import { compareLostAndFound } from '../../lib/matching.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' },
    });
  }

  try {
    const { lostItemId, foundItemId } = req.body;

    if (!lostItemId || !foundItemId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Both lostItemId and foundItemId are required' },
      });
    }

    const lost = db.getLostItem(lostItemId);
    const found = db.getFoundItem(foundItemId);

    if (!lost) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Lost item ${lostItemId} not found` },
      });
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Found item ${foundItemId} not found` },
      });
    }

    const matchResult = await compareLostAndFound(lost, found);

    return res.status(200).json({
      success: true,
      data: {
        lostItemId,
        foundItemId,
        score: matchResult.score,
        reasons: matchResult.reasons,
        summary: matchResult.summary,
        factors: matchResult.factors,
      },
    });
  } catch (error: any) {
    console.error('Error in match-items:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'MATCHING_ERROR', message: error.message || 'Matching calculation failed' },
    });
  }
}
