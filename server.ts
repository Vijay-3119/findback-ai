import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import Vercel serverless handlers directly for local Vite dev / AI Studio parity
import healthHandler from './api/health.js';
import analyzeLostHandler from './api/ai/analyze-lost-item.js';
import analyzeFoundHandler from './api/ai/analyze-found-item.js';
import matchItemsHandler from './api/ai/match-items.js';
import lostItemsHandler from './api/lost-items/index.js';
import foundItemsHandler from './api/found-items/index.js';
import matchesHandler from './api/matches/index.js';
import verificationHandler from './api/verification/index.js';
import recoveryHandler from './api/recovery/index.js';
import organizationsHandler from './api/organizations/index.js';
import usersHandler from './api/users/index.js';
import resetDemoHandler from './api/reset-demo/index.js';
import { db } from './lib/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ==========================================
// VERCEL SERVERLESS HANDLER MOUNTINGS (/api/*)
// Exactly mirror Vercel routing in local dev
// ==========================================

// Health
app.all('/api/health', (req: Request, res: Response) => healthHandler(req, res));

// AI endpoints
app.all('/api/ai/analyze-lost-item', (req: Request, res: Response) => analyzeLostHandler(req, res));
app.all('/api/ai/analyze-found-item', (req: Request, res: Response) => analyzeFoundHandler(req, res));
app.all('/api/ai/match-items', (req: Request, res: Response) => matchItemsHandler(req, res));

// Lost & Found Items
app.all('/api/lost-items', (req: Request, res: Response) => lostItemsHandler(req, res));
app.get('/api/lost-items/:id', (req: Request, res: Response) => {
  const item = db.getLostItem(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
  res.json({ success: true, data: item });
});

app.all('/api/found-items', (req: Request, res: Response) => foundItemsHandler(req, res));
app.get('/api/found-items/:id', (req: Request, res: Response) => {
  const item = db.getFoundItem(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
  res.json({ success: true, data: item });
});

// Matches
app.all('/api/matches', (req: Request, res: Response) => matchesHandler(req, res));
app.get('/api/matches/:id', (req: Request, res: Response) => {
  const match = db.getMatch(req.params.id);
  if (!match) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
  res.json({ success: true, data: match });
});
app.patch('/api/matches/:id', (req: Request, res: Response) => {
  req.body.id = req.params.id;
  return matchesHandler(req, res);
});
app.post('/api/matches/:id/request-verification', (req: Request, res: Response) => {
  req.body.action = 'request_verification';
  req.body.matchId = req.params.id;
  return matchesHandler(req, res);
});
app.post('/api/matches/:id/reject', (req: Request, res: Response) => {
  req.body.action = 'reject';
  req.body.matchId = req.params.id;
  return matchesHandler(req, res);
});

// Verifications
app.all('/api/verification', (req: Request, res: Response) => verificationHandler(req, res));
app.all('/api/verifications', (req: Request, res: Response) => verificationHandler(req, res));
app.post('/api/verifications/:id/submit-answer', (req: Request, res: Response) => {
  req.body.action = 'submit_answer';
  req.body.id = req.params.id;
  return verificationHandler(req, res);
});
app.post('/api/verifications/:id/adjudicate', (req: Request, res: Response) => {
  req.body.action = 'adjudicate';
  req.body.id = req.params.id;
  return verificationHandler(req, res);
});

// Deliveries / Recovery
app.all('/api/recovery', (req: Request, res: Response) => recoveryHandler(req, res));
app.all('/api/deliveries', (req: Request, res: Response) => recoveryHandler(req, res));
app.get('/api/deliveries/:id', (req: Request, res: Response) => {
  const deliv = db.getDelivery(req.params.id);
  if (!deliv) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
  res.json({ success: true, data: deliv });
});
app.post('/api/deliveries/:id/select-method', (req: Request, res: Response) => {
  req.body.action = 'select_method';
  req.body.id = req.params.id;
  return recoveryHandler(req, res);
});
app.post('/api/deliveries/:id/update-status', (req: Request, res: Response) => {
  req.body.action = 'update_status';
  req.body.id = req.params.id;
  return recoveryHandler(req, res);
});

// Organizations & Users
app.all('/api/organizations', (req: Request, res: Response) => organizationsHandler(req, res));
app.get('/api/organizations/:id', (req: Request, res: Response) => {
  const org = db.getOrganization(req.params.id);
  if (!org) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
  res.json({ success: true, data: org });
});

app.all('/api/users', (req: Request, res: Response) => usersHandler(req, res));
app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = db.getUser(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
  res.json({ success: true, data: user });
});

// Reset Demo Data
app.all('/api/reset-demo', (req: Request, res: Response) => resetDemoHandler(req, res));

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
    console.log(`FindBack AI local dev server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
