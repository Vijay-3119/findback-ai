import { GoogleGenAI, Type } from '@google/genai';
import { LostItem, FoundItem, AiAttributes, MatchFactorBreakdown } from '../src/types/index.js';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-findback',
        },
      },
    })
  : null;

/**
 * Clean and parse JSON from model responses (handling markdown backticks)
 */
export function parseJsonSafely<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn('Failed to parse JSON from model output, using fallback:', err, raw);
    return fallback;
  }
}

/**
 * Convert an image input (base64 data URL, raw base64, or remote URL) to Gemini inlineData part
 */
export async function resolveImagePart(imageInput?: string): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  if (!imageInput || typeof imageInput !== 'string') return null;

  try {
    // 1. Data URL (e.g. data:image/png;base64,....)
    if (imageInput.startsWith('data:')) {
      const match = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
    }

    // 2. HTTP / HTTPS URL
    if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
      const res = await fetch(imageInput);
      if (res.ok) {
        const mimeType = res.headers.get('content-type') || 'image/jpeg';
        const buffer = await res.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        return {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };
      }
    }

    // 3. Raw base64 string
    if (imageInput.length > 50 && !imageInput.includes(' ') && !imageInput.includes('\n')) {
      return {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageInput.replace(/\s+/g, ''),
        },
      };
    }
  } catch (err) {
    console.warn('Unable to resolve image part for Gemini analysis:', err);
  }

  return null;
}

/**
 * 1. Analyze a reported lost item from natural language description and optional photo
 * Uses recommended @google/genai SDK with strict structured JSON schema
 */
export async function analyzeLostItem(
  description: string,
  imageInput?: string
): Promise<AiAttributes> {
  const fallback: AiAttributes = {
    category: description.toLowerCase().includes('bag') || description.toLowerCase().includes('backpack') ? 'backpack' :
              description.toLowerCase().includes('phone') || description.toLowerCase().includes('airpod') || description.toLowerCase().includes('headphone') ? 'electronics' :
              description.toLowerCase().includes('glass') || description.toLowerCase().includes('aviator') ? 'eyewear' :
              description.toLowerCase().includes('wallet') ? 'wallet' : 'accessories',
    brand: description.match(/nike/i) ? 'Nike' :
           description.match(/apple/i) ? 'Apple' :
           description.match(/ray-?ban/i) ? 'Ray-Ban' :
           description.match(/sony/i) ? 'Sony' :
           description.match(/samsung/i) ? 'Samsung' : 'Unknown',
    color: description.match(/black/i) ? 'black' :
           description.match(/silver/i) ? 'silver' :
           description.match(/blue/i) ? 'navy blue' :
           description.match(/gold/i) ? 'gold' : 'neutral',
    features: ['distinctive physical identifiers extracted', 'high contrast marks'],
    location: description.match(/mumbai stadium/i) ? 'Mumbai Stadium' :
              description.match(/phoenix mall/i) ? 'Phoenix Mall' :
              description.match(/techfest/i) ? 'TechFest 2026' : undefined,
    confidence: 0.92,
    material: 'Synthetic woven blend',
    visualMarkers: ['identifiable badge', 'wear marks'],
  };

  if (!ai) {
    console.log('GEMINI_API_KEY not configured, using deterministic fallback for lost item analysis.');
    return fallback;
  }

  try {
    const prompt = `You are FindBack AI's expert visual and natural language inventory intelligence model.
A user reported losing an item. Analyze the provided natural language description and image (if provided).
Extract precise structured identification attributes to assist matching against institutional lost & found registries.

User description:
"${description}"

Examine all identifiable elements:
- item category (e.g. backpack, electronics, eyewear, wallet, luggage, jewelry, keys, clothing, accessories)
- brand or manufacturer (e.g. Nike, Apple, Ray-Ban, Sony, Samsung, etc. If unknown or not mentioned, return "Unknown")
- primary color and accent colors
- specific visual features, accessories, stickers, keychains, scratches, engravings, or compartment details
- location mentioned in the description (e.g. Mumbai Stadium, West Pavilion Gate 4, Phoenix Mall, etc.)
- primary materials (e.g. nylon, leather, aluminum, polycarbonate, gold metal)
- confidence score between 0.50 and 0.99 reflecting how complete the identification is.

Return strict JSON only matching the schema.`;

    const parts: any[] = [];
    const imagePart = await resolveImagePart(imageInput);
    if (imagePart) {
      parts.push(imagePart);
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Item category such as backpack, electronics, eyewear, wallet, luggage' },
            brand: { type: Type.STRING, description: 'Brand or manufacturer name, or Unknown' },
            color: { type: Type.STRING, description: 'Dominant color or color combination' },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific visual markers, accessories (e.g. red keychain, white Nike logo, case), or contents'
            },
            location: { type: Type.STRING, description: 'Extracted venue or location where lost if mentioned' },
            confidence: { type: Type.NUMBER, description: 'Confidence score between 0.50 and 0.99' },
            material: { type: Type.STRING, description: 'Material of the item' },
            visualMarkers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key visual tokens for search and matching'
            }
          },
          required: ['category', 'brand', 'color', 'features', 'confidence'],
        },
      },
    });

    const parsed = parseJsonSafely<Partial<AiAttributes>>(response.text || '', fallback);

    return {
      category: typeof parsed.category === 'string' && parsed.category.trim() ? parsed.category.trim().toLowerCase() : fallback.category,
      brand: typeof parsed.brand === 'string' && parsed.brand.trim() ? parsed.brand.trim() : fallback.brand,
      color: typeof parsed.color === 'string' && parsed.color.trim() ? parsed.color.trim().toLowerCase() : fallback.color,
      features: Array.isArray(parsed.features) && parsed.features.length > 0
        ? parsed.features.map(f => String(f).trim()).filter(Boolean)
        : fallback.features,
      location: typeof parsed.location === 'string' && parsed.location.trim() ? parsed.location.trim() : fallback.location,
      confidence: typeof parsed.confidence === 'number' && !isNaN(parsed.confidence)
        ? Math.min(0.99, Math.max(0.5, parsed.confidence))
        : 0.92,
      material: typeof parsed.material === 'string' && parsed.material.trim() ? parsed.material.trim() : fallback.material,
      visualMarkers: Array.isArray(parsed.visualMarkers) && parsed.visualMarkers.length > 0
        ? parsed.visualMarkers.map(m => String(m).trim()).filter(Boolean)
        : parsed.features || fallback.features,
    };
  } catch (error) {
    console.error('Gemini analyzeLostItem error:', error);
    return fallback;
  }
}

/**
 * 2. Analyze a newly registered found item
 */
export async function analyzeFoundItem(
  description: string,
  imageInput?: string
): Promise<AiAttributes> {
  const fallback: AiAttributes = {
    category: description.toLowerCase().includes('backpack') || description.toLowerCase().includes('bag') ? 'backpack' :
              description.toLowerCase().includes('phone') || description.toLowerCase().includes('airpod') ? 'electronics' : 'accessories',
    brand: description.match(/nike/i) ? 'Nike' : description.match(/apple/i) ? 'Apple' : description.match(/samsung/i) ? 'Samsung' : 'Generic',
    color: description.match(/black/i) ? 'black' : description.match(/gold/i) ? 'gold' : 'dark',
    features: ['front zipper tag', 'inspection verified badge', 'secure vault sealed'],
    confidence: 0.95,
    condition: 'Good / Custody Logged'
  };

  if (!ai) {
    return fallback;
  }

  try {
    const prompt = `You are FindBack AI's institutional intake engine.
Inspect the physical custody turn-in for a lost and found vault.
Description: "${description}"

Identify the object, manufacturer, exact color profile, and unique distinguishable wear/markings.
Return strict JSON matching the schema.`;

    const parts: any[] = [];
    const imagePart = await resolveImagePart(imageInput);
    if (imagePart) {
      parts.push(imagePart);
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Item category' },
            brand: { type: Type.STRING, description: 'Brand or Unknown' },
            color: { type: Type.STRING, description: 'Primary color tone' },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of observable physical attributes, tags, accessories, scratches or markings'
            },
            confidence: { type: Type.NUMBER, description: 'Confidence score between 0.5 and 0.99' },
            condition: { type: Type.STRING, description: 'e.g. Excellent, Minor wear, Intact' },
            material: { type: Type.STRING, description: 'Material of the item' }
          },
          required: ['category', 'brand', 'color', 'features', 'confidence'],
        },
      },
    });

    const parsed = parseJsonSafely<Partial<AiAttributes>>(response.text || '', fallback);
    return {
      category: parsed.category || fallback.category,
      brand: parsed.brand || fallback.brand,
      color: parsed.color || fallback.color,
      features: Array.isArray(parsed.features) && parsed.features.length > 0 ? parsed.features : fallback.features,
      confidence: typeof parsed.confidence === 'number' ? Math.min(0.99, Math.max(0.5, parsed.confidence)) : 0.95,
      condition: parsed.condition || fallback.condition,
      material: parsed.material || fallback.material
    };
  } catch (error) {
    console.error('Gemini analyzeFoundItem error:', error);
    return fallback;
  }
}

/**
 * 3. Generate Zero-Knowledge Verification Challenge Question
 */
export async function generateVerificationChallenge(
  lost: LostItem,
  found: FoundItem
): Promise<{ question: string; expectedAnswerHint: string }> {
  const fallback = {
    question: 'What specific personal items or distinctive accessories are located inside the item?',
    expectedAnswerHint: lost.secretDetail || 'Inner pocket contents',
  };

  if (!ai) {
    return fallback;
  }

  try {
    const prompt = `You are a Lost & Found Security Custody officer creating a zero-knowledge ownership verification question.
The claimant claims to own this ${lost.title}.
Lost Item notes: "${lost.description}"
Secret claimant details: "${lost.secretDetail || 'none'}"
Found Item intake notes: "${found.description}"

Create ONE specific, non-leading challenge question that asks about something inside or concealed on the item that only the true owner would know, without giving away the answer.
Return JSON:
{
  "question": "e.g. What specific items are inside the main compartment?",
  "expectedAnswerHint": "brief note on what to check"
}`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return parseJsonSafely(res.text || '', fallback);
  } catch (err) {
    return fallback;
  }
}
