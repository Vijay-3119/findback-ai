import type { Request, Response } from 'express';
import { db } from '../../lib/database.js';
import { analyzeLostItem } from '../../lib/gemini.js';
import { compareLostAndFound } from '../../lib/matching.js';
import { uploadImage } from '../../lib/storage.js';

export default async function handler(req: Request, res: Response) {
  // GET /api/lost-items
  if (req.method === 'GET') {
    try {
      const { userId, organizationId, status } = req.query as Record<string, string>;
      const items = db.getLostItems({ userId, organizationId, status });
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

  // POST /api/lost-items
  if (req.method === 'POST') {
    try {
      const {
        userId = 'user-1',
        organizationId = 'org-mumbai-stadium',
        title,
        description,
        image,
        category,
        brand,
        color,
        location,
        lostAt,
        serialNumber,
        secretDetail,
      } = req.body;

      if (!description && !title) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Description or title is required' },
        });
      }

      // Step 1: Gemini analyzes description & image
      const rawDesc = description || title;
      const aiAttributes = await analyzeLostItem(rawDesc, image);

      // Step 2: Resolve image upload storage
      let permanentImageUrl: string | undefined = undefined;
      if (image) {
        const stored = await uploadImage(image, `lost-${Date.now()}.jpg`);
        permanentImageUrl = stored.url;
      }

      const finalCategory = category || aiAttributes.category || 'other';
      const finalBrand = brand || aiAttributes.brand || 'Unknown';
      const finalColor = color || aiAttributes.color || 'black';
      const finalLocation = location || aiAttributes.location || 'Mumbai Stadium';
      const finalTitle = title || `${finalBrand !== 'Unknown' ? finalBrand : ''} ${finalCategory}`.trim();

      // Step 3: Save LostItem to DB
      const createdItem = db.createLostItem({
        userId,
        organizationId,
        title: finalTitle,
        category: finalCategory,
        brand: finalBrand,
        color: finalColor,
        description: rawDesc,
        image: permanentImageUrl || (finalCategory.includes('pack') ? 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' : undefined),
        serialNumber: serialNumber || '',
        location: finalLocation,
        lostAt: lostAt || new Date().toISOString(),
        status: 'searching',
        secretDetail: secretDetail || '',
        aiAttributes,
      });

      // Step 4: Compare against existing found items
      const allFoundItems = db.getFoundItems();
      const potentialMatches = [];

      for (const found of allFoundItems) {
        const matchResult = await compareLostAndFound(createdItem, found);
        if (matchResult.score >= 60) {
          const matchRecord = db.createMatch({
            lostItemId: createdItem.id,
            foundItemId: found.id,
            score: matchResult.score,
            reasons: matchResult.reasons,
            summary: matchResult.summary,
            status: 'potential_match',
            factors: matchResult.factors,
          });

          db.updateLostItem(createdItem.id, {
            status: 'matched',
            matchId: matchRecord.id,
          });
          potentialMatches.push(matchRecord);
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          item: db.getLostItem(createdItem.id),
          aiAttributes,
          matches: potentialMatches,
        },
      });
    } catch (error: any) {
      console.error('Error creating lost item:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Failed to report lost item' },
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported' },
  });
}
