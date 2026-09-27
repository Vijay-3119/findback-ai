/**
 * Compatibility re-exports for existing components.
 * Delegates cleanly to src/services/api.ts
 */

import {
  healthApi,
  usersApi,
  organizationsApi,
  lostItemsApi,
  foundItemsApi,
  matchesApi,
  verificationApi,
  recoveryApi,
  demoApi,
} from './services/api.js';
import { LostItem, FoundItem, Match, Verification, DeliveryRecord, Organization, User } from './types/index.js';

export const fetchHealth = healthApi.check;
export const fetchUsers = usersApi.getAll;
export const fetchOrganizations = organizationsApi.getAll;
export const fetchLostItems = lostItemsApi.getAll;
export const fetchLostItem = lostItemsApi.getById;
export const createLostItem = lostItemsApi.create;

export const fetchFoundItems = foundItemsApi.getAll;
export const fetchFoundItem = foundItemsApi.getById;
export const createFoundItem = foundItemsApi.create;

export const fetchMatches = matchesApi.getAll;
export const fetchMatch = matchesApi.getById;
export const requestVerification = matchesApi.requestVerification;
export const rejectMatch = matchesApi.reject;

export const fetchVerifications = verificationApi.getAll;
export const submitVerificationAnswer = verificationApi.submitAnswer;
export const adjudicateVerification = verificationApi.adjudicate;

export const fetchDeliveries = recoveryApi.getAll;
export const fetchDelivery = (id: string) =>
  recoveryApi.getAll().then((list) => list.find((d) => d.id === id) || ({} as DeliveryRecord));
export const updateDeliveryStatus = verificationApi ? recoveryApi.updateStatus : (recoveryApi.updateStatus as any);
export const selectDeliveryMethod = recoveryApi.selectMethod;

export const resetDemoData = demoApi.reset;
