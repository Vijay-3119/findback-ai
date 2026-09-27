import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';

export default async function handler(req: Request, res: Response) {
  // GET /api/recovery
  if (req.method === 'GET') {
    try {
      const { matchId, lostItemId } = req.query as Record<string, string>;
      const records = db.getDeliveries({ matchId, lostItemId });
      return res.status(200).json({
        success: true,
        data: records,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message },
      });
    }
  }

  // POST /api/recovery
  if (req.method === 'POST') {
    try {
      const { action, id, matchId, method, status, destinationAddress, description, location } = req.body;

      // 1. Select recovery method (pickup or delivery)
      if (action === 'select_method' && id) {
        const d = db.getDelivery(id);
        if (!d) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery record not found' } });

        const updated = db.updateDelivery(id, {
          method: method || 'pickup',
          destinationAddress: destinationAddress || d.destinationAddress,
          status: method === 'pickup' ? 'ready_for_pickup' : 'courier_assigned',
          history: [
            ...d.history,
            {
              status: method === 'pickup' ? 'ready_for_pickup' : 'courier_assigned',
              timestamp: new Date().toISOString(),
              description: method === 'pickup' ? 'Claimant selected on-site pickup at venue custodian desk.' : `Courier assigned for home delivery to ${destinationAddress}`,
            },
          ],
        });
        return res.status(200).json({ success: true, data: updated });
      }

      // 2. Step forward status in simulated recovery
      if (action === 'update_status' && id) {
        const d = db.getDelivery(id);
        if (!d) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery record not found' } });

        const descriptions: Record<string, string> = {
          verification_complete: 'Custody verification logged.',
          ready_for_pickup: 'Item staged in custody vault. Ready for claimant biometric pickup.',
          courier_assigned: 'BlueDart Vault Courier scheduled for dispatch.',
          in_transit: 'Item picked up by courier. Out for secure delivery.',
          delivered: 'Item delivered and recipient OTP confirmed. Case closed.',
        };

        const updated = db.updateDelivery(id, {
          status,
          courierLocation: location || d.courierLocation,
          history: [
            ...d.history,
            {
              status,
              timestamp: new Date().toISOString(),
              description: description || descriptions[status] || `Status updated to ${status}`,
            },
          ],
        });

        // Mark recovered once delivered
        if (status === 'delivered') {
          db.updateLostItem(d.lostItemId, { status: 'recovered' });
          db.updateFoundItem(d.foundItemId, { status: 'released' });
          db.updateMatch(d.matchId, { status: 'recovered' });
        }

        return res.status(200).json({ success: true, data: updated });
      }

      // 3. Create fresh recovery record
      if (!matchId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'matchId is required' },
        });
      }

      const match = db.getMatch(matchId);
      if (!match) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found' } });

      const created = db.createDelivery({
        matchId,
        lostItemId: match.lostItemId,
        foundItemId: match.foundItemId,
        method: method || 'pickup',
        status: 'verification_complete',
        trackingNumber: `FND-SEC-${Math.floor(Math.random() * 9000) + 1000}`,
        courierName: 'Express Vault Logistics',
        otpCode: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}`,
        destinationAddress: destinationAddress || 'Venue Pickup Desk',
        recipientName: 'Verified Claimant',
        recipientPhone: '+91 98201 44921',
        tamperSealId: `TS-${Math.floor(Math.random() * 90000) + 10000}`,
        history: [
          {
            status: 'verification_complete',
            timestamp: new Date().toISOString(),
            description: 'Ownership verification complete. Item ready for release.',
          },
        ],
      });

      return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }

  return res.status(405).json({
    success: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported' },
  });
}
