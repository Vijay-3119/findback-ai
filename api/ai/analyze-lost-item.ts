import type { Request, Response } from 'express';
import { analyzeLostItem } from '../../lib/gemini.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' },
    });
  }

  try {
    const { description, image, category, brand, location } = req.body;

    if (!description && !category) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Description or category is required' },
      });
    }

    const aiAttributes = await analyzeLostItem(description || `${brand || ''} ${category || 'lost item'}`, image);

    return res.status(200).json({
      success: true,
      data: {
        category: category || aiAttributes.category,
        brand: brand || aiAttributes.brand,
        color: aiAttributes.color,
        features: aiAttributes.features,
        location: location || aiAttributes.location,
        confidence: aiAttributes.confidence,
        material: aiAttributes.material,
        visualMarkers: aiAttributes.visualMarkers,
      },
    });
  } catch (error: any) {
    console.error('Error in analyze-lost-item:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ANALYSIS_FAILED', message: error.message || 'Gemini analysis failed' },
    });
  }
}
