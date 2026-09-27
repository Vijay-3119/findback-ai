# FindBack AI - AI-Powered Lost & Found Platform

FindBack AI is a production-ready, full-stack Lost & Found intelligence platform built with **React**, **TypeScript**, **Tailwind CSS**, and **Google Gemini API** (`@google/genai`). It runs as a **single unified repository and single deployment** natively compatible with **Vercel** serverless functions and standard Node.js runtimes.

---

## 🚀 Key Features

1. **Dual-Role Operations**:
   - **User Portal**: Report lost items in natural language, visual analysis with Gemini, view potential matches, respond to blind-challenge ownership verification, track simulated pickup or courier delivery.
   - **Organization Admin Command**: Operational dashboard across connected venues (*Mumbai Stadium*, *Phoenix Mall*, *TechFest 2026*), register found custody items, review AI matches side-by-side, request verification, adjudicate claims.

2. **Multimodal Gemini AI Engine**:
   - Leverages the official recommended `@google/genai` SDK with `gemini-3.8-flash`.
   - Analyzes item descriptions and photos to extract structured attributes: `category`, `brand`, `color`, `features`, `location`, `confidence`, `material`, and `visualMarkers`.
   - Gemini API key is accessed exclusively server-side — never exposed to client code.

3. **Deterministic & Semantic Matching Engine**:
   - 100-point multi-factor scoring combining category (+20), brand (+20), color (+10), distinctive visual features (+20), location (+15), and chronological time compatibility (+15).
   - High-priority matching for exact hardware serial numbers.
   - Responsible AI: Never independently assigns legal ownership; yields `Potential Match` for human custodian review.

4. **Zero-Knowledge Ownership Verification**:
   - Generates non-leading challenge questions about concealed contents or markers that only the true owner would know.
   - Custodian reviews user response before approving verified status.

5. **Recovery & Custody Handover**:
   - Select on-site venue pickup or simulated express courier delivery with tracking numbers, tamper seal IDs, and 6-digit handover OTPs.

---

## 📁 Architecture (Single Repository & Single Deployment)

```
findback-ai/
├── api/                             # Vercel Serverless API Functions
│   ├── health.ts                    # GET /api/health
│   ├── ai/                          # AI specific endpoints
│   │   ├── analyze-lost-item.ts     # POST /api/ai/analyze-lost-item
│   │   ├── analyze-found-item.ts    # POST /api/ai/analyze-found-item
│   │   └── match-items.ts           # POST /api/ai/match-items
│   ├── lost-items/index.ts          # GET, POST /api/lost-items
│   ├── found-items/index.ts         # GET, POST /api/found-items
│   ├── matches/index.ts             # GET, POST, PATCH /api/matches
│   ├── verification/index.ts        # GET, POST /api/verification
│   ├── recovery/index.ts            # GET, POST /api/recovery
│   ├── organizations/index.ts       # GET /api/organizations
│   ├── users/index.ts               # GET /api/users
│   └── reset-demo/index.ts          # POST /api/reset-demo
├── lib/                             # Core Serverless Libraries
│   ├── database.ts                  # Database abstraction (PostgreSQL ready + demo seed state)
│   ├── gemini.ts                    # Google GenAI SDK integration & prompt engineering
│   ├── matching.ts                  # Deterministic + AI consensus matching engine
│   ├── storage.ts                   # Object storage abstraction (Vercel Blob / S3 / data URL fallback)
│   └── validation.ts                # Server-side validation & typed response formatters
├── src/                             # React SPA Frontend
│   ├── components/                  # Header, Sidebar, cards, navigation
│   ├── views/                       # Dashboards, modals, match reviews, verifications
│   ├── services/api.ts              # Clean typed frontend API service layer
│   ├── types/                       # Shared TypeScript models and interfaces
│   ├── App.tsx                      # Main application orchestrator
│   └── main.tsx                     # React root
├── server.ts                        # Development & full-stack server entry
├── vercel.json                      # Vercel configuration
├── .env.example                     # Environment template
└── package.json
```

---

## 🛠️ Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/). Kept strictly server-side. |
| `DATABASE_URL` | Optional | PostgreSQL connection string (Vercel Postgres, Neon, Supabase, Cloud SQL). If omitted, uses resilient in-memory storage with pre-seeded demo data. |
| `NEXT_PUBLIC_APP_URL` | Optional | Base URL of deployed application (e.g. `https://findback-ai.vercel.app`). |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel Blob token for hosted object storage. If omitted, safe data URLs are used. |

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY in .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Verify TypeScript compilation and build**:
   ```bash
   npm run build
   ```

---

## 🚀 Vercel Deployment Steps

Deploy FindBack AI directly from your GitHub repository to Vercel in 1 click:

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: FindBack AI full-stack lost and found platform"
   git remote add origin https://github.com/your-username/findback-ai.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import the `findback-ai` repository.
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `DATABASE_URL` *(Optional)*: Your hosted PostgreSQL connection URL.
5. Click **Deploy**.

Vercel automatically detects the Vite frontend, outputs to `dist/`, and serves the `api/*` directory as serverless functions on the same domain with zero configuration needed.

---

## 🧪 Demo Scenario

The application comes pre-seeded with the primary demo flow:

1. **User Scenario**:
   - Claimant: **Vijay Sharma**
   - Lost Item: **Black Nike Backpack** with red keychain at **Mumbai Stadium**.
2. **Organization Admin Scenario**:
   - Custodian: **Rajesh Sharma** at **Mumbai Stadium**.
   - Found Item: **Black Nike Backpack** turned in at **Gate 3 Turnstiles**.
3. **AI Match**:
   - Score: **94% Potential Match**.
   - Reasons: Category match, Nike brand signature, black color tone, red keychain identifier, Gate 3 spatial telemetry.
4. **Zero-Knowledge Verification**:
   - Custodian requests blind verification.
   - User answers: *"Contains black spiral notebook with initials VR, silver power bank, and blue reading glasses in brown case."*
   - Custodian approves ownership.
5. **Recovery**:
   - User selects Pickup or Courier Delivery.
   - Tracking and tamper seal IDs update live.
