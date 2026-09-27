import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';
import { analyzeFoundItem } from '../../lib/gemini.js';
import { compareLostAndFound } from '../../lib/matching.js';
import { uploadImage } from '../../lib/storage.js';

export default async function handler(req: Request, res: Response) {
  // GET /api/found-items
  if (req.method === 'GET') {
    try {
      const { organizationId, status, search } = req.query as Record<string, string>;
      const items = db.getFoundItems({ organizationId, status, search });
      return res.status(200).json({
        success: true,
        data: items,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message },
      });
    }
  }

  // POST /api/found-items
  if (req.method === 'POST') {
    try {
      const {
        organizationId = 'org-mumbai-stadium',
        title,
        category,
        brand,
        color,
        location,
        foundAt,
        serialNumber,
        description,
        image,
        custodyLocker,
        custodianOfficer,
        rfidTag,
      } = req.body;

      const rawDesc = description || title || 'Found item in venue custody';
      const aiAttributes = await analyzeFoundItem(rawDesc, image);

      let permanentImageUrl: string | undefined = undefined;
      if (image) {
        const stored = await uploadImage(image, `found-${Date.now()}.jpg`);
        permanentImageUrl = stored.url;
      }

      const finalCategory = category || aiAttributes.category || 'other';
      const finalBrand = brand || aiAttributes.brand || 'Unknown';
      const finalColor = color || aiAttributes.color || 'black';
      const finalLocation = location || 'Mumbai Stadium Gate 3';
      const finalTitle = title || `${finalBrand !== 'Unknown' ? finalBrand : ''} ${finalCategory}`.trim();

      const createdItem = db.createFoundItem({
        organizationId,
        title: finalTitle,
        category: finalCategory,
        brand: finalBrand,
        color: finalColor,
        description: rawDesc,
        image: permanentImageUrl || (finalCategory.includes('pack') ? 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' : undefined),
        serialNumber: serialNumber || '',
        location: finalLocation,
        foundAt: foundAt || new Date().toISOString(),
        status: 'in_custody',
        custodyLocker: custodyLocker || `Locker B-${Math.floor(Math.random() * 20) + 1} (Vault 2)`,
        custodianOfficer: custodianOfficer || 'Officer D. Fernandes (#884)',
        rfidTag: rfidTag || `#MUM-${Math.floor(Math.random() * 90000) + 10000}`,
        aiAttributes,
      });

      // Compare against existing searching lost items
      const allLostItems = db.getLostItems({ status: 'searching' });
      const matchesCreated = [];

      for (const lost of allLostItems) {
        const matchResult = await compareLostAndFound(lost, createdItem);
        if (matchResult.score >= 60) {
          const matchRecord = db.createMatch({
            lostItemId: lost.id,
            foundItemId: createdItem.id,
            score: matchResult.score,
            reasons: matchResult.reasons,
            summary: matchResult.summary,
            status: 'potential_match',
            factors: matchResult.factors,
          });

          db.updateLostItem(lost.id, {
            status: 'matched',
            matchId: matchRecord.id,
          });
          db.updateFoundItem(createdItem.id, {
            status: 'potential_match',
          });

          matchesCreated.push(matchRecord);
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          item: db.getFoundItem(createdItem.id),
          aiAttributes,
          matches: matchesCreated,
        },
      });
    } catch (error: any) {
      console.error('Error creating found item:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Failed to register found item' },
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported' },
  });
}
