import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import {
  analyzeLostItem,
  analyzeFoundItem,
  compareLostAndFound,
  generateVerificationChallenge,
} from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'FindBack AI',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Users
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(db.getUsers());
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = db.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Organizations
app.get('/api/organizations', (_req: Request, res: Response) => {
  res.json(db.getOrganizations());
});

app.get('/api/organizations/:id', (req: Request, res: Response) => {
  const org = db.getOrganization(req.params.id);
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  res.json(org);
});

// ------------------------------------------
// Lost Items API
// ------------------------------------------
app.get('/api/lost-items', (req: Request, res: Response) => {
  const { userId, organizationId, status } = req.query as Record<string, string>;
  const items = db.getLostItems({ userId, organizationId, status });
  res.json(items);
});

app.get('/api/lost-items/:id', (req: Request, res: Response) => {
  const item = db.getLostItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'Lost item not found' });
  res.json(item);
});

/**
 * Report a Lost Item:
 * 1. Send description & image to Gemini to extract structured attributes
 * 2. Save structured information to DB
 * 3. Search existing found items and auto-match!
 */
app.post('/api/lost-items', async (req: Request, res: Response) => {
  try {
    const {
      userId = 'user-1',
      organizationId = 'org-1',
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
      return res.status(400).json({ error: 'Description or title is required' });
    }

    // Step 1: Send description & image to Gemini for neural extraction
    const rawDesc = description || title;
    const aiAttributes = await analyzeLostItem(rawDesc, image);

    // Final fields prioritizing user-explicit input over AI extraction
    const finalCategory = category || aiAttributes.category || 'other';
    const finalBrand = brand || aiAttributes.brand || 'Unknown';
    const finalColor = color || aiAttributes.color || 'neutral';
    const finalLocation = location || aiAttributes.location || 'Mumbai Stadium';
    const finalTitle = title || `${finalBrand !== 'Unknown' ? finalBrand : ''} ${finalCategory}`.trim();

    // Step 2: Save to database
    const createdItem = db.createLostItem({
      userId,
      organizationId,
      title: finalTitle,
      category: finalCategory,
      brand: finalBrand,
      color: finalColor,
      description: rawDesc,
      image: image || (aiAttributes.category === 'backpack' ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtMGMstVoNjh0lB9bgp-bKg60AQX5vVgYBrtSx4eDrDKRikQWME2j4IojugyGyMVFSzh1lVurCtLOf22Xzw84-BRc0Hq6qxHdWWLZa-lmh6rK0S8_JTT_4WVLldcqrar9nf-hUylkXMUuF-ecXZ6lyAw1B7T7aUF8nVKfLx1GA24Wca_74r9MzFoc0IPbEsFsZhVuAqoAArWHhfYKkc3rjoX5g3shTMiCX4XuO8nWqEdGgJdO1zuISQg' : undefined),
      serialNumber: serialNumber || '',
      location: finalLocation,
      lostAt: lostAt || new Date().toISOString(),
      status: 'searching',
      secretDetail: secretDetail || '',
      aiAttributes,
    });

    // Step 3: Compare against existing found items
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

        // Update item status
        db.updateLostItem(createdItem.id, {
          status: 'matched',
          matchId: matchRecord.id,
        });
        potentialMatches.push(matchRecord);
      }
    }

    res.status(201).json({
      item: db.getLostItem(createdItem.id),
      aiAttributes,
      matches: potentialMatches,
    });
  } catch (error: any) {
    console.error('Error creating lost item:', error);
    res.status(500).json({ error: error.message || 'Failed to report lost item' });
  }
});

// ------------------------------------------
// Found Items API
// ------------------------------------------
app.get('/api/found-items', (req: Request, res: Response) => {
  const { organizationId, status, search } = req.query as Record<string, string>;
  const items = db.getFoundItems({ organizationId, status, search });
  res.json(items);
});

app.get('/api/found-items/:id', (req: Request, res: Response) => {
  const item = db.getFoundItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'Found item not found' });
  res.json(item);
});

/**
 * Register a Found Item:
 * 1. Send image and description to Gemini
 * 2. Extract structured attributes
 * 3. Search existing LostItem records
 * 4. Compare found item against lost items
 * 5. Generate potential matches & store Match records
 */
app.post('/api/found-items', async (req: Request, res: Response) => {
  try {
    const {
      organizationId = 'org-1',
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
      image: image || (finalCategory.includes('pack') ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtMGMstVoNjh0lB9bgp-bKg60AQX5vVgYBrtSx4eDrDKRikQWME2j4IojugyGyMVFSzh1lVurCtLOf22Xzw84-BRc0Hq6qxHdWWLZa-lmh6rK0S8_JTT_4WVLldcqrar9nf-hUylkXMUuF-ecXZ6lyAw1B7T7aUF8nVKfLx1GA24Wca_74r9MzFoc0IPbEsFsZhVuAqoAArWHhfYKkc3rjoX5g3shTMiCX4XuO8nWqEdGgJdO1zuISQg' : undefined),
      serialNumber: serialNumber || '',
      location: finalLocation,
      foundAt: foundAt || new Date().toISOString(),
      status: 'in_custody',
      custodyLocker: custodyLocker || `Locker B-${Math.floor(Math.random() * 20) + 1} (Vault 2)`,
      custodianOfficer: custodianOfficer || 'Officer D. Fernandes (#884)',
      rfidTag: rfidTag || `#MUM-${Math.floor(Math.random() * 90000) + 10000}`,
      aiAttributes,
    });

    // Cross-match against existing lost items
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

    res.status(201).json({
      item: db.getFoundItem(createdItem.id),
      aiAttributes,
      matches: matchesCreated,
    });
  } catch (error: any) {
    console.error('Error creating found item:', error);
    res.status(500).json({ error: error.message || 'Failed to register found item' });
  }
});

// ------------------------------------------
// Matches API
// ------------------------------------------
app.get('/api/matches', (req: Request, res: Response) => {
  const { lostItemId, foundItemId, status } = req.query as Record<string, string>;
  const matches = db.getMatches({ lostItemId, foundItemId, status });
  res.json(matches);
});

app.get('/api/matches/:id', (req: Request, res: Response) => {
  const match = db.getMatch(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

/**
 * Admin action: Request Ownership Verification
 */
app.post('/api/matches/:id/request-verification', async (req: Request, res: Response) => {
  try {
    const match = db.getMatch(req.params.id);
    if (!match || !match.lostItem || !match.foundItem) {
      return res.status(404).json({ error: 'Match record invalid or not found' });
    }

    // Generate zero-knowledge challenge question
    const challenge = await generateVerificationChallenge(match.lostItem, match.foundItem);

    // Update match status
    db.updateMatch(match.id, { status: 'pending_verification' });
    db.updateFoundItem(match.foundItemId, { status: 'awaiting_verification' });
    db.updateLostItem(match.lostItemId, { status: 'verifying' });

    // Create verification record
    const verif = db.createVerification({
      matchId: match.id,
      userId: match.lostItem.userId,
      question: challenge.question,
      status: 'pending',
    });

    res.json({
      match: db.getMatch(match.id),
      verification: verif,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to request verification' });
  }
});

/**
 * Admin action: Reject Match
 */
app.post('/api/matches/:id/reject', (req: Request, res: Response) => {
  const match = db.getMatch(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  db.updateMatch(match.id, { status: 'rejected' });
  db.updateFoundItem(match.foundItemId, { status: 'in_custody' });
  db.updateLostItem(match.lostItemId, { status: 'searching' });

  res.json({ success: true, match: db.getMatch(match.id) });
});

// ------------------------------------------
// Verifications API
// ------------------------------------------
app.get('/api/verifications', (req: Request, res: Response) => {
  const { matchId, userId } = req.query as Record<string, string>;
  const verifs = db.getVerifications({ matchId, userId });
  res.json(verifs);
});

app.get('/api/verifications/:id', (req: Request, res: Response) => {
  const v = db.getVerification(req.params.id);
  if (!v) return res.status(404).json({ error: 'Verification not found' });
  res.json(v);
});

/**
 * User submits answer to verification question
 */
app.post('/api/verifications/:id/submit-answer', (req: Request, res: Response) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ error: 'Answer is required' });

  const verif = db.getVerification(req.params.id);
  if (!verif) return res.status(404).json({ error: 'Verification not found' });

  const updated = db.updateVerification(verif.id, {
    answer,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  });

  if (verif.matchId) {
    db.updateMatch(verif.matchId, { status: 'verification_submitted' });
  }

  res.json(updated);
});

/**
 * Admin approves ownership or requests more info
 */
app.post('/api/verifications/:id/adjudicate', (req: Request, res: Response) => {
  const { decision, adminNotes } = req.body; // 'approve' | 'request_info' | 'reject'
  const verif = db.getVerification(req.params.id);
  if (!verif) return res.status(404).json({ error: 'Verification not found' });

  if (decision === 'approve') {
    db.updateVerification(verif.id, {
      status: 'approved',
      adminNotes: adminNotes || 'Ownership confirmed against custody log.',
    });

    if (verif.match) {
      db.updateMatch(verif.matchId, { status: 'verified' });
      db.updateLostItem(verif.match.lostItemId, { status: 'recovered' });
      db.updateFoundItem(verif.match.foundItemId, { status: 'ready_for_dispatch' });

      // Create initial delivery record if not exists
      let del = db.getDelivery(verif.matchId);
      if (!del) {
        del = db.createDelivery({
          matchId: verif.matchId,
          lostItemId: verif.match.lostItemId,
          foundItemId: verif.match.foundItemId,
          method: 'delivery',
          status: 'verification_complete',
          trackingNumber: `FX-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}-IN`,
          courierName: 'FedEx Priority Secure Courier',
          otpCode: `${Math.floor(Math.random() * 900) + 100} - ${Math.floor(Math.random() * 900) + 100}`,
          destinationAddress: 'Flat 402, Sea Green Apts, Worli Sea Face, Mumbai 400030',
          recipientName: verif.match.lostItem?.userId === 'user-1' ? 'Vijay Sharma' : 'Sarah Jenkins',
          recipientPhone: '+91 98201 44921',
          tamperSealId: '#SEC-88219',
          courierLocation: 'Mumbai Stadium Gate 3 Safe Deposit',
          estimatedArrival: 'Today by 4:30 PM',
          history: [
            {
              status: 'verification_complete',
              timestamp: new Date().toISOString(),
              description: 'Ownership Verified & Signed by Venue Custodian.',
            },
          ],
        });
      }
    }
  } else if (decision === 'request_info') {
    db.updateVerification(verif.id, {
      status: 'needs_info',
      adminNotes: adminNotes || 'Please provide additional clarification on the contents.',
    });
  } else if (decision === 'reject') {
    db.updateVerification(verif.id, {
      status: 'rejected',
      adminNotes: adminNotes || 'Proof of ownership does not match custody records.',
    });
    if (verif.match) {
      db.updateMatch(verif.matchId, { status: 'rejected' });
      db.updateLostItem(verif.match.lostItemId, { status: 'searching' });
      db.updateFoundItem(verif.match.foundItemId, { status: 'in_custody' });
    }
  }

  res.json({
    verification: db.getVerification(verif.id),
    match: verif.matchId ? db.getMatch(verif.matchId) : null,
  });
});

// ------------------------------------------
// Deliveries & Recovery API
// ------------------------------------------
app.get('/api/deliveries', (req: Request, res: Response) => {
  const { matchId } = req.query as Record<string, string>;
  const records = db.getDeliveries({ matchId });
  res.json(records);
});

app.get('/api/deliveries/:id', (req: Request, res: Response) => {
  const d = db.getDelivery(req.params.id);
  if (!d) return res.status(404).json({ error: 'Delivery record not found' });
  res.json(d);
});

app.post('/api/deliveries/:id/select-method', (req: Request, res: Response) => {
  const { method, destinationAddress } = req.body;
  const d = db.getDelivery(req.params.id);
  if (!d) return res.status(404).json({ error: 'Delivery record not found' });

  const updated = db.updateDelivery(d.id, {
    method,
    destinationAddress: destinationAddress || d.destinationAddress,
    status: method === 'pickup' ? 'ready_for_pickup' : 'courier_assigned',
    history: [
      ...d.history,
      {
        status: method === 'pickup' ? 'ready_for_pickup' : 'courier_assigned',
        timestamp: new Date().toISOString(),
        description: method === 'pickup'
          ? 'Selected In-Person Vault Pickup at Gate 3 Custody Desk.'
          : 'Selected FedEx Priority Secure Courier Dispatch.',
      },
    ],
  });

  res.json(updated);
});

app.post('/api/deliveries/:id/update-status', (req: Request, res: Response) => {
  const { status, description, location } = req.body;
  const d = db.getDelivery(req.params.id);
  if (!d) return res.status(404).json({ error: 'Delivery record not found' });

  const descriptions: Record<string, string> = {
    verification_complete: 'Verification complete and signed by Custodian.',
    ready_for_pickup: 'Tamper-Evident Bag Tag #SEC-88219 sealed in Vault Locker B-14, ready for pickup.',
    courier_assigned: 'FedEx Express Courier Assigned. Handover manifest signed.',
    in_transit: 'In Transit: Driver Van #14 out for delivery via Dr. Annie Besant Rd.',
    delivered: 'Item delivered. Direct handover OTP passcode confirmed and signed.',
  };

  const updated = db.updateDelivery(d.id, {
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

  // If delivered, mark found and lost items as recovered
  if (status === 'delivered') {
    db.updateLostItem(d.lostItemId, { status: 'recovered' });
    db.updateFoundItem(d.foundItemId, { status: 'released' });
    db.updateMatch(d.matchId, { status: 'recovered' });
  }

  res.json(updated);
});

// Reset Demo Data
app.post('/api/reset-demo', (_req: Request, res: Response) => {
  db.resetToDefault();
  res.json({ success: true, message: 'Database reset to initial demo seeds.' });
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVE
// ==========================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FindBack AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
