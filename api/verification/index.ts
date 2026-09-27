import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';

export default async function handler(req: Request, res: Response) {
  // GET /api/verification
  if (req.method === 'GET') {
    try {
      const { matchId, userId } = req.query as Record<string, string>;
      const verifications = db.getVerifications({ matchId, userId });
      return res.status(200).json({
        success: true,
        data: verifications,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message },
      });
    }
  }

  // POST /api/verification
  if (req.method === 'POST') {
    try {
      const { action, id, matchId, userId, question, answer, decision, adminNotes } = req.body;

      // 1. Submit answer from user
      if (action === 'submit_answer' && id) {
        if (!answer || !answer.trim()) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Answer is required' },
          });
        }
        const updated = db.updateVerification(id, {
          answer: answer.trim(),
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        });
        if (!updated) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Verification not found' } });
        return res.status(200).json({ success: true, data: updated });
      }

      // 2. Adjudicate verification (Admin: approve / request_info / reject)
      if (action === 'adjudicate' && id) {
        const v = db.getVerification(id);
        if (!v) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Verification not found' } });

        let newStatus: any = 'pending';
        let matchStatus: any = 'pending_verification';

        if (decision === 'approve') {
          newStatus = 'approved';
          matchStatus = 'verified';

          // Update match status to verified
          db.updateMatch(v.matchId, { status: matchStatus });
          const match = db.getMatch(v.matchId);
          if (match) {
            db.updateLostItem(match.lostItemId, { status: 'verifying' });
            db.updateFoundItem(match.foundItemId, { status: 'ready_for_dispatch' });

            // Create initial simulated delivery record
            const existingDelivs = db.getDeliveries({ matchId: v.matchId });
            if (existingDelivs.length === 0) {
              db.createDelivery({
                matchId: v.matchId,
                lostItemId: match.lostItemId,
                foundItemId: match.foundItemId,
                method: 'delivery',
                status: 'verification_complete',
                trackingNumber: `FND-SEC-${Math.floor(Math.random() * 9000) + 1000}`,
                courierName: 'Express Vault Courier',
                otpCode: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}`,
                destinationAddress: 'Claimant Verified Address',
                recipientName: 'Verified Claimant',
                recipientPhone: '+91 98201 44921',
                tamperSealId: `TS-${Math.floor(Math.random() * 90000) + 10000}`,
                history: [
                  {
                    status: 'verification_complete',
                    timestamp: new Date().toISOString(),
                    description: 'Ownership verification approved by venue custodian officer.',
                  },
                ],
              });
            }
          }
        } else if (decision === 'reject') {
          newStatus = 'rejected';
          matchStatus = 'rejected';
          db.updateMatch(v.matchId, { status: matchStatus });
        } else if (decision === 'request_info') {
          newStatus = 'needs_info';
        }

        const updated = db.updateVerification(id, {
          status: newStatus,
          adminNotes: adminNotes || v.adminNotes,
        });

        return res.status(200).json({
          success: true,
          data: {
            verification: updated,
            match: db.getMatch(v.matchId),
          },
        });
      }

      // 3. Create fresh verification request
      if (!matchId || !question) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'matchId and question required' },
        });
      }

      const created = db.createVerification({
        matchId,
        userId: userId || 'user-1',
        question,
        status: 'pending',
      });

      db.updateMatch(matchId, { status: 'pending_verification' });

      return res.status(201).json({
        success: true,
        data: created,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message },
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported' },
  });
}
