import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';
import { compareLostAndFound } from '../../lib/matching.js';
import { generateVerificationChallenge } from '../../lib/gemini.js';

export default async function handler(req: Request, res: Response) {
  // GET /api/matches
  if (req.method === 'GET') {
    try {
      const { lostItemId, foundItemId, status } = req.query as Record<string, string>;
      const matches = db.getMatches({ lostItemId, foundItemId, status });
      return res.status(200).json({
        success: true,
        data: matches,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message },
      });
    }
  }

  // POST /api/matches (Manual or test match creation)
  if (req.method === 'POST') {
    try {
      const { lostItemId, foundItemId, action } = req.body;

      // Handle match actions if matchId provided
      if (action === 'request_verification' && req.body.matchId) {
        const match = db.getMatch(req.body.matchId);
        if (!match) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found' } });

        const lost = match.lostItem || db.getLostItem(match.lostItemId);
        const found = match.foundItem || db.getFoundItem(match.foundItemId);

        let question = 'What specific personal items or distinguishing features are inside or marked on the item?';
        if (lost && found) {
          const gen = await generateVerificationChallenge(lost, found);
          if (gen.question) question = gen.question;
        }

        const verification = db.createVerification({
          matchId: match.id,
          userId: lost?.userId || 'user-1',
          question,
          status: 'pending',
        });

        db.updateMatch(match.id, { status: 'pending_verification' });

        return res.status(200).json({
          success: true,
          data: { match: db.getMatch(match.id), verification },
        });
      }

      if (action === 'reject' && req.body.matchId) {
        const match = db.updateMatch(req.body.matchId, { status: 'rejected' });
        if (!match) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found' } });
        return res.status(200).json({ success: true, data: match });
      }

      // Default POST creates match between lostItemId and foundItemId
      if (!lostItemId || !foundItemId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'lostItemId and foundItemId required' },
        });
      }

      const lost = db.getLostItem(lostItemId);
      const found = db.getFoundItem(foundItemId);
      if (!lost || !found) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } });
      }

      const matchResult = await compareLostAndFound(lost, found);
      const match = db.createMatch({
        lostItemId,
        foundItemId,
        score: matchResult.score,
        reasons: matchResult.reasons,
        summary: matchResult.summary,
        status: 'potential_match',
        factors: matchResult.factors,
      });

      return res.status(201).json({ success: true, data: match });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }

  // PATCH /api/matches (Update status: review, reject, request verification)
  if (req.method === 'PATCH') {
    try {
      const { id, status } = req.body;
      if (!id || !status) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'id and status required' } });
      }
      const updated = db.updateMatch(id, { status });
      if (!updated) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found' } });
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }

  return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported' } });
}
