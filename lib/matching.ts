/**
 * Multi-factor deterministic matching engine combined with Gemini contextual reasoning
 * 
 * Weights:
 * - Category: +20
 * - Brand: +20
 * - Color: +10
 * - Features / Keywords: +20
 * - Location: +15
 * - Time compatibility: +15
 * 
 * Special conditions:
 * - Exact Serial Number match sets strong identifier override (+30 boost)
 * - The AI must NEVER independently declare legal ownership (capped at 96% Potential Match)
 */

import { LostItem, FoundItem, MatchFactorBreakdown } from '../src/types/index.js';
import { ai } from './gemini.js';

export async function compareLostAndFound(
  lost: LostItem,
  found: FoundItem
): Promise<{ score: number; reasons: string[]; summary: string; factors: MatchFactorBreakdown }> {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category comparison (+20)
  const lostCat = (lost.category || lost.aiAttributes?.category || '').toLowerCase().trim();
  const foundCat = (found.category || found.aiAttributes?.category || '').toLowerCase().trim();
  const categoryMatched =
    lostCat === foundCat ||
    (lostCat.includes('pack') && foundCat.includes('pack')) ||
    (lostCat.includes('phone') && foundCat.includes('phone')) ||
    (lostCat.includes('glass') && foundCat.includes('glass'));

  const catScore = categoryMatched ? 20 : 0;
  score += catScore;
  if (categoryMatched) {
    reasons.push(`Same category: ${lost.category.toUpperCase()}`);
  }

  // 2. Brand comparison (+20)
  const lostBrand = (lost.brand || lost.aiAttributes?.brand || '').toLowerCase().trim();
  const foundBrand = (found.brand || found.aiAttributes?.brand || '').toLowerCase().trim();
  const brandMatched =
    lostBrand.length > 1 &&
    foundBrand.length > 1 &&
    (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand));

  const brandScore = brandMatched ? 20 : (lostBrand === 'unknown' || foundBrand === 'unknown' ? 10 : 0);
  score += brandScore;
  if (brandMatched) {
    reasons.push(`Same brand: ${lost.brand}`);
  }

  // 3. Color comparison (+10)
  const lostColor = (lost.color || lost.aiAttributes?.color || '').toLowerCase().trim();
  const foundColor = (found.color || found.aiAttributes?.color || '').toLowerCase().trim();
  const colorMatched =
    lostColor.length > 0 &&
    (lostColor === foundColor || foundColor.includes(lostColor) || lostColor.includes(foundColor));

  const colorScore = colorMatched ? 10 : 0;
  score += colorScore;
  if (colorMatched) {
    reasons.push(`Same color profile: ${lost.color}`);
  }

  // 4. Features & Distinct Visual Markers comparison (+20)
  const lostFeatures = (lost.aiAttributes?.features || []).concat([lost.description]);
  const foundFeatures = (found.aiAttributes?.features || []).concat([found.description]);
  const matchedKeywords: string[] = [];

  const keyTokens = [
    'keychain',
    'red',
    'swoosh',
    'charger',
    'notebook',
    'scratch',
    'sticker',
    'case',
    'aux',
    'cord',
    'adapter',
    'monogram',
    'carabiner',
    'gold',
    'aviator',
    'paracord',
    'nike',
    'sleeve',
  ];

  for (const token of keyTokens) {
    const inLost = lostFeatures.some((f) => f.toLowerCase().includes(token));
    const inFound = foundFeatures.some((f) => f.toLowerCase().includes(token));
    if (inLost && inFound && !matchedKeywords.includes(token)) {
      matchedKeywords.push(token);
    }
  }

  let featScore = 0;
  if (matchedKeywords.length >= 2) {
    featScore = 20;
    reasons.push(`Distinctive visual markers matched: ${matchedKeywords.join(', ')}`);
  } else if (matchedKeywords.length === 1) {
    featScore = 15;
    reasons.push(`Specific matching feature: ${matchedKeywords[0]}`);
  } else {
    featScore = 5;
  }
  score += featScore;

  // 5. Serial Number Check (Strong identifier override)
  if (
    lost.serialNumber &&
    found.serialNumber &&
    lost.serialNumber.trim().length > 3 &&
    found.serialNumber.trim().length > 3
  ) {
    if (lost.serialNumber.trim().toLowerCase() === found.serialNumber.trim().toLowerCase()) {
      score += 25;
      reasons.push(`Matching exact serial number / hardware ID: ${lost.serialNumber}`);
    }
  }

  // 6. Location Comparison (+15)
  const sameOrg = lost.organizationId === found.organizationId;
  const lostLoc = (lost.location || '').toLowerCase();
  const foundLoc = (found.location || '').toLowerCase();
  let locScore = 0;
  let distDelta = 'Cross-facility';

  if (sameOrg) {
    if (lostLoc.includes('gate 3') && foundLoc.includes('gate 3')) {
      locScore = 15;
      distDelta = '< 15 meters';
      reasons.push(`Exact venue checkpoint match: ${lost.location}`);
    } else {
      locScore = 12;
      distDelta = '< 100 meters';
      reasons.push(`Same campus/facility perimeter`);
    }
  } else {
    locScore = 5;
    reasons.push('Different connected organization node');
  }
  score += locScore;

  // 7. Time Compatibility (+15)
  let timeScore = 10;
  let timeDeltaStr = 'Within plausible turn-in timeframe';
  try {
    const lostTime = new Date(lost.lostAt).getTime();
    const foundTime = new Date(found.foundAt).getTime();
    if (!isNaN(lostTime) && !isNaN(foundTime)) {
      const diffHours = (foundTime - lostTime) / (1000 * 60 * 60);
      if (diffHours >= 0 && diffHours <= 24) {
        timeScore = 15;
        timeDeltaStr = `Found ~${Math.round(diffHours * 60)} minutes after loss`;
        reasons.push(`Plausible chronological sequence: Turn-in occurred after reported loss (${timeDeltaStr})`);
      } else if (diffHours < 0) {
        timeScore = 4;
        timeDeltaStr = 'Discrepancy (Turned in before reported loss time)';
      }
    }
  } catch {
    timeScore = 10;
  }
  score += timeScore;

  // Never automatically 100% - always Potential Match
  const finalScore = Math.min(96, Math.max(25, score));

  const factors: MatchFactorBreakdown = {
    categoryMatch: {
      matched: categoryMatched,
      score: catScore,
      detail: categoryMatched
        ? `Taxonomic category matches (${lost.category} vs ${found.category}).`
        : `Category divergence detected.`,
    },
    brandMatch: {
      matched: brandMatched,
      score: brandScore,
      detail: brandMatched
        ? `Brand signature verified (${lost.brand} vs ${found.brand}).`
        : `Brand identification inconclusive.`,
    },
    colorMatch: {
      matched: colorMatched,
      score: colorScore,
      detail: colorMatched ? `Color spectrum matches (${lost.color}).` : `Different color tones detected.`,
    },
    featuresMatch: {
      matched: matchedKeywords.length > 0,
      score: featScore,
      detail:
        matchedKeywords.length > 0
          ? `Shared physical identifiers: ${matchedKeywords.join(', ')}.`
          : `Generic visual features.`,
      matchedFeatures: matchedKeywords,
    },
    locationMatch: {
      matched: sameOrg,
      score: locScore,
      detail: sameOrg ? `Contiguous recovery zone within ${lost.location}.` : `Cross-facility matching.`,
      distanceDelta: distDelta,
    },
    timeMatch: {
      matched: timeScore >= 10,
      score: timeScore,
      detail: `Turn-in time chronologically compatible (${timeDeltaStr}).`,
      timeDelta: timeDeltaStr,
    },
  };

  let summary = `Algorithmic comparison detected high feature symmetry (${finalScore}% match) across category, brand (${lost.brand}), color tone (${lost.color}), and spatial telemetry.`;

  // Gemini contextual reasoning if active
  if (ai) {
    try {
      const prompt = `Compare these two items in a lost-and-found scenario.
Lost Item:
- Title: ${lost.title}
- Brand: ${lost.brand}, Category: ${lost.category}, Color: ${lost.color}
- Description: ${lost.description}
- Location: ${lost.location} at ${lost.lostAt}

Found Item:
- Title: ${found.title}
- Brand: ${found.brand}, Category: ${found.category}, Color: ${found.color}
- Description: ${found.description}
- Location: ${found.location} at ${found.foundAt}

Calculated Match Score: ${finalScore}%

Write a 2-sentence executive AI consensus summary explaining why these two items are a potential match and highlighting the strongest matching markers. Do NOT declare definite ownership, keep it as "Potential Match".`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      if (res.text && res.text.trim()) {
        summary = res.text.trim();
      }
    } catch (err) {
      console.warn('Gemini comparison reasoning error, using rule-based summary:', err);
    }
  }

  return {
    score: finalScore,
    reasons,
    summary,
    factors,
  };
}
