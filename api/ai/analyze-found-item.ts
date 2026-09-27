import type { Request, Response } from 'express';
import { analyzeFoundItem } from '../../lib/gemini.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' },
    });
  }

  try {
    const { description, image, location, foundAt } = req.body;

    if (!description && !image) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Description or image is required' },
      });
    }

    const aiAttributes = await analyzeFoundItem(description || 'Found item logged into custody', image);

    return res.status(200).json({
      success: true,
      data: {
        category: aiAttributes.category,
        brand: aiAttributes.brand,
        color: aiAttributes.color,
        features: aiAttributes.features,
        location: location || 'Venue Custody',
        foundAt: foundAt || new Date().toISOString(),
        confidence: aiAttributes.confidence,
        material: aiAttributes.material,
        condition: aiAttributes.condition,
      },
    });
  } catch (error: any) {
    console.error('Error in analyze-found-item:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ANALYSIS_FAILED', message: error.message || 'Gemini analysis failed' },
    });
  }
}
