import fs from 'fs';
import path from 'path';
import { User, Organization, LostItem, FoundItem, Match, Verification, DeliveryRecord } from '../src/types/index.js';

interface DatabaseSchema {
  users: User[];
  organizations: Organization[];
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: Match[];
  verifications: Verification[];
  deliveries: DeliveryRecord[];
}

const DB_PATH = path.resolve(process.cwd(), 'data', 'db.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 'user-1',
      name: 'Vijay Sharma',
      email: 'vijay.sharma@example.com',
      role: 'user',
      phone: '+91 98201 44921',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'user-2',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      role: 'user',
      phone: '+91 98200 91823',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'admin-1',
      name: 'Rajesh Sharma',
      email: 'rajesh.security@mumbaistadium.org',
      role: 'admin',
      phone: '+91 22 2840 9900',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  ],
  organizations: [
    {
      id: 'org-1',
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
        recovered: 212
      }
    },
    {
      id: 'org-2',
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
        recovered: 110
      }
    },
    {
      id: 'org-3',
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
        recovered: 45
      }
    }
  ],
  lostItems: [
    {
      id: 'lost-1',
      userId: 'user-1',
      organizationId: 'org-1',
      title: 'Black Nike Backpack',
      category: 'backpack',
      brand: 'Nike',
      color: 'black',
      description: 'I lost my black Nike backpack at Mumbai Stadium yesterday around 8 PM. It has a small red keychain on the front vertical zipper, white swoosh logo, and padded laptop sleeve inside.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtMGMstVoNjh0lB9bgp-bKg60AQX5vVgYBrtSx4eDrDKRikQWME2j4IojugyGyMVFSzh1lVurCtLOf22Xzw84-BRc0Hq6qxHdWWLZa-lmh6rK0S8_JTT_4WVLldcqrar9nf-hUylkXMUuF-ecXZ6lyAw1B7T7aUF8nVKfLx1GA24Wca_74r9MzFoc0IPbEsFsZhVuAqoAArWHhfYKkc3rjoX5g3shTMiCX4XuO8nWqEdGgJdO1zuISQg',
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
        material: 'Matte ballistic nylon'
      },
      createdAt: '2025-10-24T19:30:00.000Z',
      matchId: 'match-1'
    },
    {
      id: 'lost-2',
      userId: 'user-2',
      organizationId: 'org-3',
      title: 'Wireless Headphones',
      category: 'electronics',
      brand: 'Sony',
      color: 'silver',
      description: 'Lost Sony WH-1000XM5 headphones near Main Innovation Stage at TechFest. Has platinum silver chassis with magnetic zip case.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCet7U7UC0Dv9rPqxKymuz2KhvJ8ubmJzd1WJLK2VWjyWZ0cItbc2X6BWVUS7P5DDkvxW6mcHKm78RjOchEoHMtJud-lepqDnCpsAzKBlWxbyoyaLWikXoopprOZ6jV554zCNgZ3kye-uEDjhVkj2WLhaHPJy36F1NmmoBvooqa-xnZBlO_asMtkOZxj7LGhmd2fTCFePIb4R30gqLbfx_XkateZ7gp3RdtQ6WIphdWVF9WIf4Zf6NdSQ',
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
        confidence: 0.91
      },
      createdAt: '2025-10-22T17:00:00.000Z'
    },
    {
      id: 'lost-3',
      userId: 'user-1',
      organizationId: 'org-2',
      title: 'MacBook Pro 16" Space Black',
      category: 'electronics',
      brand: 'Apple',
      color: 'space black',
      description: 'Left my MacBook Pro 16 inch in space black at coffee lounge Level 2 Phoenix Mall.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcW1VtQnYDHoIWxkkUdtDovhHfeBz_eXDc-UIYxdEbfxaUfNy3qytrEoPooLIdI5rLnrEnd59T9aac2A_ZuGQRY63LbyOLv7zwhE7k711De-jX5ebv91i6yr_5JGSZEWk5W_aByodn7hQE5WfBkvWhyQLJIAR9oTo0c9g91TbbOzp9hCxIDCNPGQ8BSjTOH5TlUZmW93Xj2tgPhxi5Qv0cyQmLSDMcPyQ6Yz1D-qccCJrcggHu0LeCWQ',
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
        confidence: 0.98
      },
      createdAt: '2025-10-18T15:00:00.000Z'
    }
  ],
  foundItems: [
    {
      id: 'found-1',
      organizationId: 'org-1',
      title: 'Black Athletic Backpack',
      category: 'backpack',
      brand: 'Nike',
      color: 'black',
      description: 'Found black Nike backpack turned in at Gate 3 Turnstiles concourse. Distinct red braided paracord loop on front zipper pull. Clean condition.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtMGMstVoNjh0lB9bgp-bKg60AQX5vVgYBrtSx4eDrDKRikQWME2j4IojugyGyMVFSzh1lVurCtLOf22Xzw84-BRc0Hq6qxHdWWLZa-lmh6rK0S8_JTT_4WVLldcqrar9nf-hUylkXMUuF-ecXZ6lyAw1B7T7aUF8nVKfLx1GA24Wca_74r9MzFoc0IPbEsFsZhVuAqoAArWHhfYKkc3rjoX5g3shTMiCX4XuO8nWqEdGgJdO1zuISQg',
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
        condition: 'Good, sanitized'
      },
      createdAt: '2025-10-24T20:45:00.000Z'
    },
    {
      id: 'found-2',
      organizationId: 'org-1',
      title: 'Samsung Galaxy S24 Ultra',
      category: 'electronics',
      brand: 'Samsung',
      color: 'black',
      description: 'Turned in from Food Court Sec 102. Phantom black color with dark case. IMEI logged.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXx8gMIhQkOyeww32hS916GxffBukPpUF8Yq82CfreBN-_IGQ6f30ER2ZuOH94vmxs-EX7H5bB--byIirSpdj0muBEWmVBd7qBrd1xgHDC2Q9j3S_RS3coqD1jxTpsvlhWmlGOmvZkRHPbkYCgkum-TeUKisQvbKVMLw5kyyiStp_ax-SwE3fHqLZe8j6D54Eoq35dfnMH2x0IvzeO-hVZWnnfsplUBX-UO7DpiLVOJA-VbNLcfHNFYw',
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
        confidence: 0.89
      },
      createdAt: '2025-10-24T19:20:00.000Z'
    },
    {
      id: 'found-3',
      organizationId: 'org-1',
      title: 'Dell Pro 15" Laptop Bag',
      category: 'backpack',
      brand: 'Dell',
      color: 'blue',
      description: 'Navy ballistic bag found in Parking West P2. Contains Dell 65W AC charger.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ4pxgudEPMouuEFJDfXz4Zyx2SR6vk0SsSmPCi6_hUuX2U05cdv4TXAa8NaAnzo9HfqS9BAvmQLFKwjCoktmAhsIXC-IenXK45gL8JbmCEt_1-CHUKtiUAzBMeMX1FwChOsYyND9_9ntC7Cj3OaDNnorBMmdEe_ZJaWk6xyNRBBNhdbsYKTmNglydluGWAeur0_zWupjVcZmDvl3wKtr6qIs4PueCKFJMdPXhADmsejTva6INVDbEag',
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
        confidence: 0.72
      },
      createdAt: '2025-10-23T23:45:00.000Z'
    },
    {
      id: 'found-4',
      organizationId: 'org-1',
      title: 'Apple Watch Series 9',
      category: 'electronics',
      brand: 'Apple',
      color: 'midnight',
      description: 'Found on table at VIP Box 4. Midnight aluminum with dark sport band.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAN7sQVHX0zptdahBWSquZFxWOgQ59mzMWln3kUoptOSNS0zS73BcDTix5sVC5RpaQ36WouW57wwrU8O3_WEtAHVpsr7lAASYj8LlNsLC0YsRuFGetMgttEblx3SVoD5-iZqwW7LMkyJS7Td3RqNFnwy6Hn89FYcideOG5FoNk462P0BUPvHwkXAflR4PgYqWQRt-FeTVl_orW4fx6jy7ZdBMwwlxix6wm91FnMTv691AVPphkL63Xtw',
      serialNumber: 'SN-AW9-49102',
      location: 'VIP Box 4 (Mumbai Stadium)',
      foundAt: '2025-10-24T18:00:00.000Z',
      status: 'ready_for_dispatch',
      custodyLocker: 'SafeBox-01',
      custodianOfficer: 'Officer D. Fernandes',
      rfidTag: '#MUM-88185',
      aiAttributes: {
        category: 'electronics',
        brand: 'Apple',
        color: 'midnight',
        features: ['45mm case', 'sport loop', 'always-on display'],
        confidence: 0.96
      },
      createdAt: '2025-10-24T18:15:00.000Z'
    },
    {
      id: 'found-5',
      organizationId: 'org-1',
      title: 'Ray-Ban Aviator Sunglasses',
      category: 'accessories',
      brand: 'Ray-Ban',
      color: 'gold',
      description: 'Turned in from South Stand Level 3. Classic gold wire frame in brown leather case.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7w9v5rnXZYCNWoqCNVbPE0cuIHuUnxuuo3mbtZdaQp-JXTLyMRBxcLZEp_QrsR8RiMugzeyAqUInWTmc6edRTWd6hRDxjC0KV1H3NsBGZuMaRrbqKcA6-waBkuNfVYp0z9p024IJm_kh3nwKsyflRMgpt18Vw9Uq6rH9JW50ZAwYWnex1-HILgMT5zeIZBCmP18-5ynxhHvZi_hF-mjsftuwGFXEI4btWX2l6PZfoNrnr9NdWGrLarQ',
      serialNumber: 'RB-3025',
      location: 'South Stand Level 3 (Mumbai Stadium)',
      foundAt: '2025-10-24T17:30:00.000Z',
      status: 'in_custody',
      custodyLocker: 'Tray D-05',
      custodianOfficer: 'Officer T. Jenkins',
      rfidTag: '#MUM-88181',
      aiAttributes: {
        category: 'accessories',
        brand: 'Ray-Ban',
        color: 'gold',
        features: ['crystal green lenses', 'leather snap case', 'gold wire frame'],
        confidence: 0.68
      },
      createdAt: '2025-10-24T17:40:00.000Z'
    },
    {
      id: 'found-6',
      organizationId: 'org-2',
      title: 'Sony WH-1000XM5 Headphones',
      category: 'electronics',
      brand: 'Sony',
      color: 'silver',
      description: 'Found at Food Pavilion Level 2 Phoenix Mall. Platinum silver color with hard case.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaWV-TyJX9t3rxUXGkyJBiIthrkCByIstvzBLmrId9s9zY1te3HktKCRZ70g3oCtqXqF4DXIrAcUGlFnYbDaPcs2lNTEsBstruaz6EKyV_8EWySU1Ocmc3cSfm8jzfO3UvLesXOrGiuLUWYhfc9VQklRH86uK4Xfz-bjdkizg2yEXTnF-Z4bCX8G9Up5ijR6oznmchKEw43JjuLJVm67YhBIRQui-TYbNjinB_LPsv7sbeL7aGupVR1g',
      serialNumber: 'S01-492XXXX',
      location: 'Phoenix Mall Level 2 Food Pavilion',
      foundAt: '2025-10-23T18:00:00.000Z',
      status: 'in_custody',
      custodyLocker: 'Vault Locker 12',
      custodianOfficer: 'Officer R. Patel',
      rfidTag: '#PHX-88177',
      aiAttributes: {
        category: 'electronics',
        brand: 'Sony',
        color: 'silver',
        features: ['hard shell zippered case', 'platinum silver', '3.5mm coiled audio adapter inside case'],
        confidence: 0.92
      },
      createdAt: '2025-10-23T18:10:00.000Z'
    }
  ],
  matches: [
    {
      id: 'match-1',
      lostItemId: 'lost-1',
      foundItemId: 'found-1',
      score: 94,
      reasons: [
        'Same category: Backpack / Athletic Daypack',
        'Same brand: Nike verified via swoosh embroidery',
        'Same color: Matte Black fabric chroma matching',
        'Distinctive feature matched: Red paracord loop on zipper pull',
        'Compatible location: Gate 3 Turnstiles (< 35m from reported East Concourse loss)',
        'Compatible chronology: Loss at 7:15 PM, custodial intake at 8:40 PM (1h 25m delta)'
      ],
      summary: 'The uploaded found item shares identical characteristics with the user\'s reported item, including brand, color, category, spatio-temporal telemetry, and a distinctive red paracord keychain. Deep neural feature comparison indicates high algorithmic probability. Automated false-positive confidence tests passed at 99.8%.',
      status: 'pending_verification',
      factors: {
        categoryMatch: { matched: true, score: 20, detail: 'Backpack / Commuter Daypack classified identically in taxonomic tree (100% Taxon match).' },
        brandMatch: { matched: true, score: 20, detail: 'Nike Swoosh embroidery geometry and vector alignment match standard production specs.' },
        colorMatch: { matched: true, score: 10, detail: 'Matte Black fabric chroma histogram delta < 0.6 under ambient lumen normalization.' },
        featuresMatch: { matched: true, score: 20, detail: 'Red paracord loop attachment located at front pull slider satisfies anomalous user note.', matchedFeatures: ['red keychain loop', 'white swoosh logo', 'notebook compartment'] },
        locationMatch: { matched: true, score: 12, detail: 'Reported East Concourse loss is contiguous with Gate 3 Turnstile recovery point in venue mesh (< 40m radial).', distanceDelta: '< 40m' },
        timeMatch: { matched: true, score: 12, detail: 'Loss at 7:15 PM followed chronologically by custodial intake at 8:40 PM confirms seamless causality.', timeDelta: '+1h 25m' }
      },
      createdAt: '2025-10-24T20:50:00.000Z'
    }
  ],
  verifications: [
    {
      id: 'verif-1',
      matchId: 'match-1',
      userId: 'user-1',
      question: 'What specific personal items are located inside the main compartment?',
      answer: 'Inside the main compartment was a black spiral notebook, a silver Anker USB-C power bank, and a pair of blue reading glasses in a brown case.',
      status: 'submitted',
      adminNotes: 'All 3 items verified present inside bag by Officer Fernandes during intake scan.',
      submittedAt: '2025-10-25T08:52:00.000Z',
      createdAt: '2025-10-24T21:00:00.000Z'
    }
  ],
  deliveries: [
    {
      id: 'del-1',
      matchId: 'match-1',
      lostItemId: 'lost-1',
      foundItemId: 'found-1',
      method: 'delivery',
      status: 'in_transit',
      trackingNumber: 'FX-9281-9204-IN',
      courierName: 'FedEx Priority Secure Courier',
      otpCode: '792 - 410',
      destinationAddress: 'Flat 402, Sea Green Apts, Worli Sea Face, Mumbai 400030',
      recipientName: 'Vijay Sharma',
      recipientPhone: '+91 98201 44921',
      tamperSealId: '#SEC-88219',
      courierLocation: 'Dr. Annie Besant Rd, Worli, Mumbai',
      estimatedArrival: 'Today by 4:30 PM (ETA 22 min)',
      history: [
        {
          status: 'verification_complete',
          timestamp: '2025-10-25T09:15:00.000Z',
          description: 'Ownership Verified & Signed by Officer D. Fernandes.'
        },
        {
          status: 'ready_for_pickup',
          timestamp: '2025-10-25T09:40:00.000Z',
          description: 'Manifest & Tamper-Evident Bag Tag #SEC-88219 sealed in Vault Locker B-14.'
        },
        {
          status: 'courier_assigned',
          timestamp: '2025-10-25T10:30:00.000Z',
          description: 'Courier Assigned: Handover manifest #FX-9281920 signed at Mumbai Stadium Gate 3 Safe Deposit.'
        },
        {
          status: 'in_transit',
          timestamp: '2025-10-25T11:00:00.000Z',
          description: 'In Transit: Driver Van #14 out for delivery via Dr. Annie Besant Rd corridor.'
        }
      ],
      createdAt: '2025-10-25T09:15:00.000Z',
      updatedAt: '2025-10-25T11:00:00.000Z'
    }
  ]
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading db file, reinitializing default:', err);
    }
    this.save(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private save(dataToSave: DatabaseSchema = this.data) {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db file:', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }
  getUser(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  // Organizations
  getOrganizations(): Organization[] {
    return this.data.organizations;
  }
  getOrganization(id: string): Organization | undefined {
    return this.data.organizations.find(o => o.id === id);
  }

  // Lost Items
  getLostItems(filters?: { userId?: string; organizationId?: string; status?: string }): LostItem[] {
    let items = [...this.data.lostItems];
    if (filters?.userId) items = items.filter(i => i.userId === filters.userId);
    if (filters?.organizationId) items = items.filter(i => i.organizationId === filters.organizationId);
    if (filters?.status) items = items.filter(i => i.status === filters.status);
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getLostItem(id: string): LostItem | undefined {
    return this.data.lostItems.find(i => i.id === id);
  }
  createLostItem(item: Omit<LostItem, 'id' | 'createdAt'>): LostItem {
    const newItem: LostItem = {
      ...item,
      id: `lost-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.lostItems.unshift(newItem);
    this.save();
    return newItem;
  }
  updateLostItem(id: string, updates: Partial<LostItem>): LostItem | undefined {
    const idx = this.data.lostItems.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    this.data.lostItems[idx] = { ...this.data.lostItems[idx], ...updates };
    this.save();
    return this.data.lostItems[idx];
  }

  // Found Items
  getFoundItems(filters?: { organizationId?: string; status?: string; search?: string }): FoundItem[] {
    let items = [...this.data.foundItems];
    if (filters?.organizationId && filters.organizationId !== 'all') {
      items = items.filter(i => i.organizationId === filters.organizationId);
    }
    if (filters?.status && filters.status !== 'all') {
      items = items.filter(i => i.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        (i.rfidTag && i.rfidTag.toLowerCase().includes(q))
      );
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getFoundItem(id: string): FoundItem | undefined {
    return this.data.foundItems.find(i => i.id === id);
  }
  createFoundItem(item: Omit<FoundItem, 'id' | 'createdAt'>): FoundItem {
    const newItem: FoundItem = {
      ...item,
      id: `found-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.foundItems.unshift(newItem);
    this.save();
    return newItem;
  }
  updateFoundItem(id: string, updates: Partial<FoundItem>): FoundItem | undefined {
    const idx = this.data.foundItems.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    this.data.foundItems[idx] = { ...this.data.foundItems[idx], ...updates };
    this.save();
    return this.data.foundItems[idx];
  }

  // Matches
  getMatches(filters?: { lostItemId?: string; foundItemId?: string; status?: string }): Match[] {
    let matches = [...this.data.matches];
    if (filters?.lostItemId) matches = matches.filter(m => m.lostItemId === filters.lostItemId);
    if (filters?.foundItemId) matches = matches.filter(m => m.foundItemId === filters.foundItemId);
    if (filters?.status) matches = matches.filter(m => m.status === filters.status);

    return matches.map(m => ({
      ...m,
      lostItem: this.getLostItem(m.lostItemId),
      foundItem: this.getFoundItem(m.foundItemId)
    })).sort((a, b) => b.score - a.score);
  }
  getMatch(id: string): Match | undefined {
    const match = this.data.matches.find(m => m.id === id);
    if (!match) return undefined;
    return {
      ...match,
      lostItem: this.getLostItem(match.lostItemId),
      foundItem: this.getFoundItem(match.foundItemId)
    };
  }
  createMatch(match: Omit<Match, 'id' | 'createdAt'>): Match {
    const newMatch: Match = {
      ...match,
      id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.data.matches.push(newMatch);
    this.save();
    return this.getMatch(newMatch.id)!;
  }
  updateMatch(id: string, updates: Partial<Match>): Match | undefined {
    const idx = this.data.matches.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    this.data.matches[idx] = { ...this.data.matches[idx], ...updates };
    this.save();
    return this.getMatch(id);
  }

  // Verifications
  getVerifications(filters?: { matchId?: string; userId?: string }): Verification[] {
    let verifs = [...this.data.verifications];
    if (filters?.matchId) verifs = verifs.filter(v => v.matchId === filters.matchId);
    if (filters?.userId) verifs = verifs.filter(v => v.userId === filters.userId);
    return verifs.map(v => ({
      ...v,
      match: this.getMatch(v.matchId)
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getVerification(id: string): Verification | undefined {
    const v = this.data.verifications.find(verif => verif.id === id);
    if (!v) return undefined;
    return {
      ...v,
      match: this.getMatch(v.matchId)
    };
  }
  createVerification(v: Omit<Verification, 'id' | 'createdAt'>): Verification {
    const newVerif: Verification = {
      ...v,
      id: `verif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.verifications.push(newVerif);
    this.save();
    return this.getVerification(newVerif.id)!;
  }
  updateVerification(id: string, updates: Partial<Verification>): Verification | undefined {
    const idx = this.data.verifications.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    this.data.verifications[idx] = { ...this.data.verifications[idx], ...updates };
    this.save();
    return this.getVerification(id);
  }

  // Deliveries
  getDeliveries(filters?: { matchId?: string }): DeliveryRecord[] {
    let dels = [...this.data.deliveries];
    if (filters?.matchId) dels = dels.filter(d => d.matchId === filters.matchId);
    return dels.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }
  getDelivery(id: string): DeliveryRecord | undefined {
    return this.data.deliveries.find(d => d.id === id || d.matchId === id);
  }
  createDelivery(del: Omit<DeliveryRecord, 'id' | 'createdAt' | 'updatedAt'>): DeliveryRecord {
    const now = new Date().toISOString();
    const newDel: DeliveryRecord = {
      ...del,
      id: `del-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.deliveries.push(newDel);
    this.save();
    return newDel;
  }
  updateDelivery(id: string, updates: Partial<DeliveryRecord>): DeliveryRecord | undefined {
    const idx = this.data.deliveries.findIndex(d => d.id === id || d.matchId === id);
    if (idx === -1) return undefined;
    this.data.deliveries[idx] = {
      ...this.data.deliveries[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.deliveries[idx];
  }

  // Reset database back to seed demo state
  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save();
    return true;
  }
}

export const db = new Database();
