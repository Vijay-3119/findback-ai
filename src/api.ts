import { LostItem, FoundItem, Match, Verification, DeliveryRecord, Organization, User } from './types/index.js';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  return res.json();
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const res = await fetch('/api/organizations');
  return res.json();
}

export async function fetchLostItems(params?: { userId?: string; organizationId?: string; status?: string }): Promise<LostItem[]> {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/lost-items${q ? `?${q}` : ''}`);
  return res.json();
}

export async function fetchLostItem(id: string): Promise<LostItem> {
  const res = await fetch(`/api/lost-items/${id}`);
  return res.json();
}

export async function createLostItem(data: Partial<LostItem>): Promise<{ item: LostItem; aiAttributes: any; matches: Match[] }> {
  const res = await fetch('/api/lost-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to report lost item');
  }
  return res.json();
}

export async function fetchFoundItems(params?: { organizationId?: string; status?: string; search?: string }): Promise<FoundItem[]> {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/found-items${q ? `?${q}` : ''}`);
  return res.json();
}

export async function fetchFoundItem(id: string): Promise<FoundItem> {
  const res = await fetch(`/api/found-items/${id}`);
  return res.json();
}

export async function createFoundItem(data: Partial<FoundItem>): Promise<{ item: FoundItem; aiAttributes: any; matches: Match[] }> {
  const res = await fetch('/api/found-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to register found item');
  }
  return res.json();
}

export async function fetchMatches(params?: { lostItemId?: string; foundItemId?: string; status?: string }): Promise<Match[]> {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/matches${q ? `?${q}` : ''}`);
  return res.json();
}

export async function fetchMatch(id: string): Promise<Match> {
  const res = await fetch(`/api/matches/${id}`);
  return res.json();
}

export async function requestVerification(matchId: string): Promise<{ match: Match; verification: Verification }> {
  const res = await fetch(`/api/matches/${matchId}/request-verification`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to request verification');
  return res.json();
}

export async function rejectMatch(matchId: string): Promise<{ success: boolean; match: Match }> {
  const res = await fetch(`/api/matches/${matchId}/reject`, {
    method: 'POST',
  });
  return res.json();
}

export async function fetchVerifications(params?: { matchId?: string; userId?: string }): Promise<Verification[]> {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/verifications${q ? `?${q}` : ''}`);
  return res.json();
}

export async function submitVerificationAnswer(id: string, answer: string): Promise<Verification> {
  const res = await fetch(`/api/verifications/${id}/submit-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer }),
  });
  if (!res.ok) throw new Error('Failed to submit verification answer');
  return res.json();
}

export async function adjudicateVerification(
  id: string,
  decision: 'approve' | 'request_info' | 'reject',
  adminNotes?: string
): Promise<{ verification: Verification; match: Match | null }> {
  const res = await fetch(`/api/verifications/${id}/adjudicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, adminNotes }),
  });
  if (!res.ok) throw new Error('Failed to adjudicate verification');
  return res.json();
}

export async function fetchDeliveries(params?: { matchId?: string }): Promise<DeliveryRecord[]> {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/deliveries${q ? `?${q}` : ''}`);
  return res.json();
}

export async function fetchDelivery(id: string): Promise<DeliveryRecord> {
  const res = await fetch(`/api/deliveries/${id}`);
  return res.json();
}

export async function updateDeliveryStatus(
  id: string,
  status: string,
  description?: string,
  location?: string
): Promise<DeliveryRecord> {
  const res = await fetch(`/api/deliveries/${id}/update-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, description, location }),
  });
  if (!res.ok) throw new Error('Failed to update delivery status');
  return res.json();
}

export async function selectDeliveryMethod(
  id: string,
  method: 'pickup' | 'delivery',
  destinationAddress?: string
): Promise<DeliveryRecord> {
  const res = await fetch(`/api/deliveries/${id}/select-method`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, destinationAddress }),
  });
  if (!res.ok) throw new Error('Failed to select delivery method');
  return res.json();
}

export async function resetDemoData(): Promise<void> {
  await fetch('/api/reset-demo', { method: 'POST' });
}
