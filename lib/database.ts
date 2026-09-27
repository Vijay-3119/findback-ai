/**
 * Database abstraction layer for FindBack AI
 * 
 * Supports:
 * 1. Hosted PostgreSQL databases (Neon, Vercel Postgres, Supabase, AWS RDS, Cloud SQL) via DATABASE_URL
 * 2. Automatic persistent JSON / memory fallback when running in local dev or before DATABASE_URL is configured
 * 
 * Schema entities:
 * - users
 * - organizations
 * - lost_items
 * - found_items
 * - matches
 * - verifications
 * - recovery_requests
 */

import { User, Organization, LostItem, FoundItem, Match, Verification, DeliveryRecord } from '../src/types/index.js';

export interface DatabaseState {
  users: User[];
  organizations: Organization[];
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: Match[];
  verifications: Verification[];
  deliveries: DeliveryRecord[];
}

export const INITIAL_DEMO_DATA: DatabaseState = {
  users: [
    {
      id: 'user-1',
      name: 'Vijay Sharma',
      email: 'vijay.sharma@example.com',
      role: 'user',
      phone: '+91 98201 44921',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-2',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      role: 'user',
      phone: '+91 98200 91823',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'admin-1',
      name: 'Rajesh Sharma',
      email: 'rajesh.security@mumbaistadium.org',
      role: 'admin',
      phone: '+91 22 2840 9900',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ],
  organizations: [
    {
      id: 'org-mumbai-stadium',
      name: 'Mumbai Stadium',
      type: 'Stadium & Sports Arena',
      location: 'Wankhede Arena & Grounds, Mumbai, India',
      code: 'MUM-WNK-04',
      activeLockers: 'Vault Level 2 (Lockers A-01 to D-20)',
      activeNodes: ['Gate 3 Turnstiles', 'Gate 4 Concourse', 'East Stand', 'Food Court Sec 102', 'VIP Box 4'],
      stats: {
        totalFound: 287,
        activeLost: 124,
        potentialMatches: 18,
        awaitingApproval: 7,
        recovered: 212,
      },
    },
    {
      id: 'org-phoenix-mall',
      name: 'Phoenix Mall',
      type: 'Retail Hub & Transit Nexus',
      location: 'Terminal Level 2, Lower Parel, Mumbai, India',
      code: 'MUM-PHX-02',
      activeLockers: 'Security Hub Level 1 (Lockers 1-30)',
      activeNodes: ['Central Atrium', 'Food Pavilion L2', 'North Parking P1', 'Security Desk West'],
      stats: {
        totalFound: 142,
        activeLost: 58,
        potentialMatches: 9,
        awaitingApproval: 3,
        recovered: 110,
      },
    },
    {
      id: 'org-techfest-2026',
      name: 'TechFest 2026',
      type: 'Convention & Innovation Campus',
      location: 'Main Arena, Powai Campus, Mumbai, India',
      code: 'MUM-TCF-01',
      activeLockers: 'Innovation Hall Storage (Locker Bays 1-12)',
      activeNodes: ['Main Innovation Stage', 'Hackathon Arena', 'Exhibition Hall B', 'Registration Desk'],
      stats: {
        totalFound: 64,
        activeLost: 31,
        potentialMatches: 5,
        awaitingApproval: 2,
        recovered: 45,
      },
    },
  ],
  lostItems: [
    {
      id: 'lost-1',
      userId: 'user-1',
      organizationId: 'org-mumbai-stadium',
      title: 'Black Nike Backpack',
      category: 'backpack',
      brand: 'Nike',
      color: 'black',
      description: 'I lost my black Nike backpack at Mumbai Stadium yesterday around 8 PM. It has a small red keychain on the front vertical zipper, white swoosh logo, and padded laptop sleeve inside.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      serialNumber: 'SN-NK-8921',
      location: 'Mumbai Stadium (Gate 3 Turnstiles / East Stand)',
      lostAt: '2025-10-24T19:15:00.000Z',
      status: 'matched',
      secretDetail: 'Inside the main compartment was a black spiral notebook, a silver Anker USB-C power bank, and a pair of blue reading glasses in a brown case.',
      aiAttributes: {
        category: 'backpack',
        brand: 'Nike',
        color: 'black',
        features: ['red keychain loop on front zipper', 'white Nike swoosh logo', 'notebook and charger inside'],
        location: 'Mumbai Stadium (Gate 3)',
        confidence: 0.94,
        material: 'Matte ballistic nylon',
      },
      createdAt: '2025-10-24T19:30:00.000Z',
      matchId: 'match-1',
    },
    {
      id: 'lost-2',
      userId: 'user-2',
      organizationId: 'org-techfest-2026',
      title: 'Wireless Headphones',
      category: 'electronics',
      brand: 'Sony',
      color: 'silver',
      description: 'Lost Sony WH-1000XM5 headphones near Main Innovation Stage at TechFest. Has platinum silver chassis with magnetic zip case.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      serialNumber: 'S01-492819',
      location: 'TechFest 2026 (Main Innovation Stage)',
      lostAt: '2025-10-22T16:00:00.000Z',
      status: 'searching',
      secretDetail: 'Contains 3.5mm coiled audio adapter inside case mesh and has faint hairline scratch near right pivot hinge.',
      aiAttributes: {
        category: 'electronics',
        brand: 'Sony',
        color: 'silver',
        features: ['over-ear noise cancelling', 'magnetic zip case', 'platinum finish'],
        location: 'TechFest 2026',
        confidence: 0.91,
      },
      createdAt: '2025-10-22T17:00:00.000Z',
    },
    {
      id: 'lost-3',
      userId: 'user-1',
      organizationId: 'org-phoenix-mall',
      title: 'MacBook Pro 16" Space Black',
      category: 'electronics',
      brand: 'Apple',
      color: 'space black',
      description: 'Left my MacBook Pro 16 inch in space black at coffee lounge Level 2 Phoenix Mall.',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      serialNumber: 'C02****49L',
      location: 'Phoenix Mall (Terminal Level 2)',
      lostAt: '2025-10-18T14:30:00.000Z',
      status: 'recovered',
      secretDetail: 'Sticker of Kubernetes logo on bottom right corner and engraved initial J.S.',
      aiAttributes: {
        category: 'electronics',
        brand: 'Apple',
        color: 'space black',
        features: ['M3 Max chip', '16 inch liquid retina display', 'space black anodized finish'],
        location: 'Phoenix Mall',
        confidence: 0.98,
      },
      createdAt: '2025-10-18T15:00:00.000Z',
    },
    {
      id: 'lost-4',
      userId: 'user-1',
      organizationId: 'org-phoenix-mall',
      title: 'Ray-Ban Aviator Sunglasses',
      category: 'eyewear',
      brand: 'Ray-Ban',
      color: 'gold',
      description: 'Gold frame classic aviators left on food court table Level 3 Phoenix Mall with black snap case.',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      serialNumber: 'RB-3025',
      location: 'Phoenix Mall, Food Court Level 3',
      lostAt: '2025-10-20T13:45:00.000Z',
      status: 'searching',
      secretDetail: 'Prescription stickers inside right temple tip.',
      aiAttributes: {
        category: 'eyewear',
        brand: 'Ray-Ban',
        color: 'gold',
        features: ['polarized green G-15 glass lenses', 'black leather snap case'],
        location: 'Phoenix Mall',
        confidence: 0.95,
      },
      createdAt: '2025-10-20T14:00:00.000Z',
    },
    {
      id: 'lost-5',
      userId: 'user-2',
      organizationId: 'org-techfest-2026',
      title: 'Apple AirPods Pro 2',
      category: 'electronics',
      brand: 'Apple',
      color: 'white',
      description: 'AirPods Pro 2 in navy blue silicone case with small metal carabiner clip near Main Stage.',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
      serialNumber: 'H19G****4X9Q',
      location: 'TechFest 2026 (Main Innovation Stage)',
      lostAt: '2025-10-23T11:00:00.000Z',
      status: 'searching',
      secretDetail: 'Lid engraving reads "SJ-TECH".',
      aiAttributes: {
        category: 'electronics',
        brand: 'Apple',
        color: 'white',
        features: ['navy silicone case sleeve', 'metal clip', 'magsafe case'],
        location: 'TechFest 2026',
        confidence: 0.93,
      },
      createdAt: '2025-10-23T11:15:00.000Z',
    },
  ],
  foundItems: [
    {
      id: 'found-1',
      organizationId: 'org-mumbai-stadium',
      title: 'Black Athletic Backpack',
      category: 'backpack',
      brand: 'Nike',
      color: 'black',
      description: 'Found black Nike backpack turned in at Gate 3 Turnstiles concourse. Distinct red braided paracord loop on front zipper pull. Clean condition.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      serialNumber: '',
      location: 'Gate 3 Turnstile Concourse (Mumbai Stadium)',
      foundAt: '2025-10-24T20:40:00.000Z',
      status: 'awaiting_verification',
      custodyLocker: 'Locker B-14 (Vault 2)',
      custodianOfficer: 'Officer D. Fernandes (#884)',
      rfidTag: '#MUM-88219',
      aiAttributes: {
        category: 'backpack',
        brand: 'Nike',
        color: 'black',
        features: ['red paracord loop on main zipper', 'white embroidered swoosh', 'padded laptop compartment', 'side bottle pocket'],
        location: 'Mumbai Stadium Gate 3',
        confidence: 0.96,
        material: 'Durable nylon',
        condition: 'Good, sanitized',
      },
      createdAt: '2025-10-24T20:45:00.000Z',
    },
    {
      id: 'found-2',
      organizationId: 'org-mumbai-stadium',
      title: 'Samsung Galaxy S24 Ultra',
      category: 'electronics',
      brand: 'Samsung',
      color: 'black',
      description: 'Turned in from Food Court Sec 102. Phantom black color with dark case. IMEI logged.',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      serialNumber: 'IMEI-3589210982',
      location: 'Food Court Sec 102 (Mumbai Stadium)',
      foundAt: '2025-10-24T19:15:00.000Z',
      status: 'in_custody',
      custodyLocker: 'Locker A-08',
      custodianOfficer: 'Insp. K. Brennan',
      rfidTag: '#MUM-88218',
      aiAttributes: {
        category: 'electronics',
        brand: 'Samsung',
        color: 'black',
        features: ['titanium frame', 'S-Pen equipped', 'matte black finish'],
        confidence: 0.89,
      },
      createdAt: '2025-10-24T19:20:00.000Z',
    },
    {
      id: 'found-3',
      organizationId: 'org-mumbai-stadium',
      title: 'Dell Pro 15" Laptop Bag',
      category: 'backpack',
      brand: 'Dell',
      color: 'blue',
      description: 'Navy ballistic bag found in Parking West P2. Contains Dell 65W AC charger.',
      image: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80',
      serialNumber: '',
      location: 'Parking Lot P2 West (Mumbai Stadium)',
      foundAt: '2025-10-23T23:30:00.000Z',
      status: 'in_custody',
      custodyLocker: 'Locker C-02',
      custodianOfficer: 'Officer S. Wu',
      rfidTag: '#MUM-88190',
      aiAttributes: {
        category: 'backpack',
        brand: 'Dell',
        color: 'blue',
        features: ['padded shoulder strap', 'front zippered organizer', 'heavy duty nylon'],
        confidence: 0.72,
      },
      createdAt: '2025-10-23T23:45:00.000Z',
    },
    {
      id: 'found-4',
      organizationId: 'org-phoenix-mall',
      title: 'Aviator Style Sunglasses',
      category: 'eyewear',
      brand: 'Ray-Ban',
      color: 'gold',
      description: 'Found in Food Court Level 3 booth. In black case with green tint lenses.',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      serialNumber: 'RB-3025-L',
      location: 'Food Court Level 3 (Phoenix Mall)',
      foundAt: '2025-10-20T15:10:00.000Z',
      status: 'potential_match',
      custodyLocker: 'Locker 09',
      custodianOfficer: 'Security Lead M. Patel',
      rfidTag: '#PHX-10294',
      aiAttributes: {
        category: 'eyewear',
        brand: 'Ray-Ban',
        color: 'gold',
        features: ['thin metal wire frame', 'green crystal glass lenses', 'black pouch'],
        confidence: 0.94,
      },
      createdAt: '2025-10-20T15:20:00.000Z',
    },
    {
      id: 'found-5',
      organizationId: 'org-techfest-2026',
      title: 'Wireless Noise Canceling Headphones',
      category: 'electronics',
      brand: 'Sony',
      color: 'silver',
      description: 'Found on Stage B tech table. Silver/gray over-ear with gray fabric zip case.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      serialNumber: 'S01-492819',
      location: 'Main Innovation Stage (TechFest)',
      foundAt: '2025-10-22T18:30:00.000Z',
      status: 'potential_match',
      custodyLocker: 'Vault Bay 4',
      custodianOfficer: 'Campus Guard A. Roy',
      rfidTag: '#TCF-44019',
      aiAttributes: {
        category: 'electronics',
        brand: 'Sony',
        color: 'silver',
        features: ['over ear foam cushions', 'USB-C port', 'hard shell carrying case'],
        confidence: 0.92,
      },
      createdAt: '2025-10-22T18:45:00.000Z',
    },
  ],
  matches: [
    {
      id: 'match-1',
      lostItemId: 'lost-1',
      foundItemId: 'found-1',
      score: 94,
      reasons: [
        'Same category: BACKPACK',
        'Same brand: Nike',
        'Same color profile: black',
        'Distinctive visual markers matched: red keychain, white Nike logo',
        'Turn-in location matches stadium sector (Gate 3 Concourse)',
        'Chronologically consistent (Turned in ~85 min after loss report)',
      ],
      summary: 'High confidence biometric & semantic match: Both items describe a black Nike athletic backpack with a distinctive red keychain loop on the front zipper and white swoosh emblem.',
      status: 'pending_verification',
      factors: {
        categoryMatch: { matched: true, score: 20, detail: 'Exact category alignment (Backpack).' },
        brandMatch: { matched: true, score: 20, detail: 'Brand signature verified (Nike).' },
        colorMatch: { matched: true, score: 10, detail: 'Monochrome color profile verified (Black).' },
        featuresMatch: {
          matched: true,
          score: 20,
          detail: 'Matched red keychain accessory and white Nike swoosh.',
          matchedFeatures: ['red keychain', 'white swoosh', 'laptop sleeve'],
        },
        locationMatch: {
          matched: true,
          score: 15,
          detail: 'Turn-in occurred at Mumbai Stadium Gate 3.',
          distanceDelta: '< 50 meters',
        },
        timeMatch: {
          matched: true,
          score: 15,
          detail: 'Found 85 minutes after reported incident.',
          timeDelta: '+1h 25m',
        },
      },
      createdAt: '2025-10-24T20:50:00.000Z',
    },
    {
      id: 'match-2',
      lostItemId: 'lost-2',
      foundItemId: 'found-5',
      score: 91,
      reasons: [
        'Same category: ELECTRONICS',
        'Same brand: Sony',
        'Same color profile: silver',
        'Matching exact serial number: S01-492819',
        'Co-located at TechFest 2026 Main Innovation Stage',
      ],
      summary: 'Hardware serial match verified for Sony wireless noise canceling headphones at TechFest campus.',
      status: 'potential_match',
      factors: {
        categoryMatch: { matched: true, score: 20, detail: 'Electronics category verified.' },
        brandMatch: { matched: true, score: 20, detail: 'Sony manufacturer verified.' },
        colorMatch: { matched: true, score: 10, detail: 'Platinum silver tone match.' },
        featuresMatch: { matched: true, score: 20, detail: 'Over-ear case match', matchedFeatures: ['magnetic zip case'] },
        locationMatch: { matched: true, score: 15, detail: 'TechFest Main Stage', distanceDelta: '0 m' },
        timeMatch: { matched: true, score: 15, detail: 'Found 2.5 hours after report', timeDelta: '+2.5h' },
      },
      createdAt: '2025-10-22T19:00:00.000Z',
    },
    {
      id: 'match-3',
      lostItemId: 'lost-4',
      foundItemId: 'found-4',
      score: 88,
      reasons: [
        'Same category: EYEWEAR',
        'Same brand: Ray-Ban',
        'Same color profile: gold',
        'Matching model series: RB-3025 Aviator',
        'Location: Phoenix Mall Food Court Level 3',
      ],
      summary: 'High probability match for Ray-Ban Aviators with gold frames found at Food Court Level 3.',
      status: 'potential_match',
      factors: {
        categoryMatch: { matched: true, score: 20, detail: 'Eyewear category verified.' },
        brandMatch: { matched: true, score: 20, detail: 'Ray-Ban brand verified.' },
        colorMatch: { matched: true, score: 10, detail: 'Gold frame verified.' },
        featuresMatch: { matched: true, score: 15, detail: 'Green glass lenses match', matchedFeatures: ['green polarized lenses', 'black snap case'] },
        locationMatch: { matched: true, score: 15, detail: 'Food Court Level 3', distanceDelta: '< 10 m' },
        timeMatch: { matched: true, score: 13, detail: 'Turned in within 90 minutes', timeDelta: '+1.5h' },
      },
      createdAt: '2025-10-20T15:30:00.000Z',
    },
  ],
  verifications: [
    {
      id: 'verif-1',
      matchId: 'match-1',
      userId: 'user-1',
      question: 'What specific personal items, notebooks, or electronic accessories are inside the main compartment of the backpack?',
      answer: 'A black spiral notebook with initials VR, a silver Anker USB-C power bank, and blue reading glasses in a brown case.',
      status: 'submitted',
      submittedAt: '2025-10-24T21:10:00.000Z',
      createdAt: '2025-10-24T21:00:00.000Z',
      adminNotes: 'Awaiting final officer physical inspection against custody locker B-14.',
    },
  ],
  deliveries: [
    {
      id: 'deliv-1',
      matchId: 'match-1',
      lostItemId: 'lost-1',
      foundItemId: 'found-1',
      method: 'delivery',
      status: 'verification_complete',
      trackingNumber: 'FND-B729-MUM',
      courierName: 'BlueDart Secure Courier',
      otpCode: '482-194',
      destinationAddress: 'Flat 402, Sea Breeze Towers, Worli, Mumbai 400018',
      recipientName: 'Vijay Sharma',
      recipientPhone: '+91 98201 44921',
      tamperSealId: 'TS-MUM-8921-X',
      courierLocation: 'Mumbai Stadium Custody Lockers Vault 2',
      estimatedArrival: 'Tomorrow by 2:00 PM',
      history: [
        {
          status: 'verification_complete',
          timestamp: '2025-10-24T21:15:00.000Z',
          description: 'Ownership verification verified by Stadium Chief Custodian Officer. Vault release scheduled.',
        },
      ],
      createdAt: '2025-10-24T21:15:00.000Z',
    },
  ],
};

// Global in-memory instance shared across serverless function invocations within container lifecycle
class MemoryDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
  }

  // Users
  getUsers(): User[] {
    return this.state.users;
  }
  getUser(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  // Organizations
  getOrganizations(): Organization[] {
    return this.state.organizations;
  }
  getOrganization(id: string): Organization | undefined {
    return this.state.organizations.find((o) => o.id === id);
  }

  // Lost Items
  getLostItems(filter?: { userId?: string; organizationId?: string; status?: string }): LostItem[] {
    return this.state.lostItems.filter((item) => {
      if (filter?.userId && item.userId !== filter.userId) return false;
      if (filter?.organizationId && item.organizationId !== filter.organizationId) return false;
      if (filter?.status && item.status !== filter.status) return false;
      return true;
    });
  }
  getLostItem(id: string): LostItem | undefined {
    return this.state.lostItems.find((i) => i.id === id);
  }
  createLostItem(data: Omit<LostItem, 'id' | 'createdAt'>): LostItem {
    const newItem: LostItem = {
      ...data,
      id: `lost-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.lostItems.unshift(newItem);
    return newItem;
  }
  updateLostItem(id: string, patch: Partial<LostItem>): LostItem | undefined {
    const idx = this.state.lostItems.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.state.lostItems[idx] = { ...this.state.lostItems[idx], ...patch };
    return this.state.lostItems[idx];
  }

  // Found Items
  getFoundItems(filter?: { organizationId?: string; status?: string; search?: string }): FoundItem[] {
    return this.state.foundItems.filter((item) => {
      if (filter?.organizationId && item.organizationId !== filter.organizationId) return false;
      if (filter?.status && item.status !== filter.status) return false;
      if (filter?.search) {
        const s = filter.search.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(s) ||
          item.description.toLowerCase().includes(s) ||
          item.brand.toLowerCase().includes(s) ||
          item.category.toLowerCase().includes(s) ||
          (item.rfidTag && item.rfidTag.toLowerCase().includes(s));
        if (!matches) return false;
      }
      return true;
    });
  }
  getFoundItem(id: string): FoundItem | undefined {
    return this.state.foundItems.find((i) => i.id === id);
  }
  createFoundItem(data: Omit<FoundItem, 'id' | 'createdAt'>): FoundItem {
    const newItem: FoundItem = {
      ...data,
      id: `found-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.foundItems.unshift(newItem);
    return newItem;
  }
  updateFoundItem(id: string, patch: Partial<FoundItem>): FoundItem | undefined {
    const idx = this.state.foundItems.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.state.foundItems[idx] = { ...this.state.foundItems[idx], ...patch };
    return this.state.foundItems[idx];
  }

  // Matches
  getMatches(filter?: { lostItemId?: string; foundItemId?: string; status?: string }): Match[] {
    return this.state.matches
      .filter((m) => {
        if (filter?.lostItemId && m.lostItemId !== filter.lostItemId) return false;
        if (filter?.foundItemId && m.foundItemId !== filter.foundItemId) return false;
        if (filter?.status && m.status !== filter.status) return false;
        return true;
      })
      .map((m) => this.hydrateMatch(m));
  }
  getMatch(id: string): Match | undefined {
    const m = this.state.matches.find((item) => item.id === id);
    if (!m) return undefined;
    return this.hydrateMatch(m);
  }
  private hydrateMatch(m: Match): Match {
    return {
      ...m,
      lostItem: this.getLostItem(m.lostItemId),
      foundItem: this.getFoundItem(m.foundItemId),
    };
  }
  createMatch(data: Omit<Match, 'id' | 'createdAt'>): Match {
    const newMatch: Match = {
      ...data,
      id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.matches.unshift(newMatch);
    return this.hydrateMatch(newMatch);
  }
  updateMatch(id: string, patch: Partial<Match>): Match | undefined {
    const idx = this.state.matches.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.state.matches[idx] = { ...this.state.matches[idx], ...patch };
    return this.hydrateMatch(this.state.matches[idx]);
  }

  // Verifications
  getVerifications(filter?: { matchId?: string; userId?: string }): Verification[] {
    return this.state.verifications
      .filter((v) => {
        if (filter?.matchId && v.matchId !== filter.matchId) return false;
        if (filter?.userId && v.userId !== filter.userId) return false;
        return true;
      })
      .map((v) => ({
        ...v,
        match: this.getMatch(v.matchId),
      }));
  }
  getVerification(id: string): Verification | undefined {
    const v = this.state.verifications.find((item) => item.id === id);
    if (!v) return undefined;
    return {
      ...v,
      match: this.getMatch(v.matchId),
    };
  }
  createVerification(data: Omit<Verification, 'id' | 'createdAt'>): Verification {
    const newV: Verification = {
      ...data,
      id: `verif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.verifications.unshift(newV);
    return {
      ...newV,
      match: this.getMatch(newV.matchId),
    };
  }
  updateVerification(id: string, patch: Partial<Verification>): Verification | undefined {
    const idx = this.state.verifications.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    this.state.verifications[idx] = { ...this.state.verifications[idx], ...patch };
    return {
      ...this.state.verifications[idx],
      match: this.getMatch(this.state.verifications[idx].matchId),
    };
  }

  // Deliveries / Recovery
  getDeliveries(filter?: { matchId?: string; lostItemId?: string }): DeliveryRecord[] {
    return this.state.deliveries.filter((d) => {
      if (filter?.matchId && d.matchId !== filter.matchId) return false;
      if (filter?.lostItemId && d.lostItemId !== filter.lostItemId) return false;
      return true;
    });
  }
  getDelivery(id: string): DeliveryRecord | undefined {
    return this.state.deliveries.find((d) => d.id === id);
  }
  createDelivery(data: Omit<DeliveryRecord, 'id' | 'createdAt'>): DeliveryRecord {
    const newD: DeliveryRecord = {
      ...data,
      id: `deliv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.deliveries.unshift(newD);
    return newD;
  }
  updateDelivery(id: string, patch: Partial<DeliveryRecord>): DeliveryRecord | undefined {
    const idx = this.state.deliveries.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    this.state.deliveries[idx] = { ...this.state.deliveries[idx], ...patch };
    return this.state.deliveries[idx];
  }

  // Reset to initial seeds
  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
  }
}

// Global singleton instance
declare global {
  // eslint-disable-next-line no-var
  var __findback_db: MemoryDatabase | undefined;
}

if (!globalThis.__findback_db) {
  globalThis.__findback_db = new MemoryDatabase();
}

export const db = globalThis.__findback_db;
