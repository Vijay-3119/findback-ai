export type ItemStatus = 'searching' | 'matched' | 'verifying' | 'recovered' | 'closed';
export type FoundItemStatus = 'in_custody' | 'potential_match' | 'awaiting_verification' | 'ready_for_dispatch' | 'in_transit' | 'released';
export type MatchStatus = 'potential_match' | 'pending_verification' | 'verification_submitted' | 'verified' | 'rejected' | 'recovered';
export type DeliveryMethod = 'pickup' | 'delivery';
export type DeliveryStatus = 'verification_complete' | 'ready_for_pickup' | 'courier_assigned' | 'in_transit' | 'delivered';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  location: string;
  code: string;
  activeLockers?: string;
  activeNodes?: string[];
  stats?: {
    totalFound: number;
    activeLost: number;
    potentialMatches: number;
    awaitingApproval: number;
    recovered: number;
  };
}

export interface AiAttributes {
  category: string;
  brand: string;
  color: string;
  features: string[];
  location?: string;
  confidence: number;
  material?: string;
  visualMarkers?: string[];
  model?: string;
  condition?: string;
}

export interface LostItem {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  category: string;
  brand: string;
  color: string;
  description: string;
  image?: string;
  serialNumber?: string;
  location: string;
  lostAt: string;
  status: ItemStatus;
  aiAttributes: AiAttributes;
  secretDetail?: string; // Private detail used for blind verification
  createdAt: string;
  matchId?: string;
}

export interface FoundItem {
  id: string;
  organizationId: string;
  title: string;
  category: string;
  brand: string;
  color: string;
  description: string;
  image?: string;
  serialNumber?: string;
  location: string;
  foundAt: string;
  status: FoundItemStatus;
  aiAttributes: AiAttributes;
  custodyLocker?: string;
  custodianOfficer?: string;
  rfidTag?: string;
  createdAt: string;
}

export interface MatchFactorBreakdown {
  categoryMatch: { matched: boolean; score: number; detail: string };
  brandMatch: { matched: boolean; score: number; detail: string };
  colorMatch: { matched: boolean; score: number; detail: string };
  featuresMatch: { matched: boolean; score: number; detail: string; matchedFeatures: string[] };
  locationMatch: { matched: boolean; score: number; detail: string; distanceDelta?: string };
  timeMatch: { matched: boolean; score: number; detail: string; timeDelta?: string };
}

export interface Match {
  id: string;
  lostItemId: string;
  foundItemId: string;
  score: number; // 0 - 100
  reasons: string[];
  summary: string;
  status: MatchStatus;
  factors: MatchFactorBreakdown;
  createdAt: string;
  lostItem?: LostItem;
  foundItem?: FoundItem;
}

export interface Verification {
  id: string;
  matchId: string;
  userId: string;
  question: string;
  answer?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'needs_info';
  adminNotes?: string;
  submittedAt?: string;
  createdAt: string;
  match?: Match;
}

export interface DeliveryRecord {
  id: string;
  matchId: string;
  lostItemId: string;
  foundItemId: string;
  method: DeliveryMethod;
  status: DeliveryStatus;
  trackingNumber: string;
  courierName: string;
  otpCode: string;
  destinationAddress: string;
  recipientName: string;
  recipientPhone: string;
  tamperSealId: string;
  courierLocation?: string;
  estimatedArrival?: string;
  history: Array<{
    status: DeliveryStatus;
    timestamp: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
