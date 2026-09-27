import React from 'react';
import {
  Boxes,
  FileText,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Building2,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  RefreshCw,
  Search,
  Lock,
  Layers,
} from 'lucide-react';
import { Organization, FoundItem, LostItem, Match, Verification } from '../types/index.js';

interface AdminOverviewProps {
  currentOrg: Organization | null;
  organizations: Organization[];
  foundItems: FoundItem[];
  lostItems: LostItem[];
  matches: Match[];
  verifications: Verification[];
  onOpenRegisterModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  currentOrg,
  organizations,
  foundItems,
  lostItems,
  matches,
  verifications,
  onOpenRegisterModal,
  onNavigateTab,
}) => {
  // Stats
  const totalFound = foundItems.length;
  const activeLost = lostItems.length;
  const potentialMatches = matches.filter((m) => m.status === 'potential_match' || m.status === 'pending_verification').length;
  const awaitingVerification = verifications.filter((v) => v.status === 'submitted' || v.status === 'pending').length;
  const recoveredItems = lostItems.filter((i) => i.status === 'recovered').length + foundItems.filter((f) => f.status === 'released').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-8 text-white shadow-xl overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-400/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>{currentOrg?.name || 'Mumbai Stadium'} Organization Command</span>
              <span className="font-mono text-blue-400">#{currentOrg?.code || 'ST-MUM-04'}</span>
            </div>
            <h1 className="text-3xl font-extrabold font-display tracking-tight">
              Lost & Found Operations Center
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              AI-automated turn-in cataloging, continuous deterministic cross-matching, and custody verification pipeline across connected venues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenRegisterModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Found Item</span>
            </button>
            <button
              onClick={() => onNavigateTab('ai-matches')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>Review AI Matches</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI 5 Cards as specified in the prompt:
          1. Found Items
          2. Lost Reports
          3. Potential Matches
          4. Awaiting Verification
          5. Recovered Items
      */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Found Items */}
        <div
          onClick={() => onNavigateTab('found-items')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Found Items</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">{totalFound}</div>
          <p className="text-[11px] text-slate-500 mt-1">Logged in vault custody</p>
        </div>

        {/* Lost Reports */}
        <div
          onClick={() => onNavigateTab('lost-reports')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lost Reports</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">{activeLost}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active claims filed</p>
        </div>

        {/* Potential Matches */}
        <div
          onClick={() => onNavigateTab('ai-matches')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Potential Matches</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-display">{potentialMatches}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">High-confidence links</p>
        </div>

        {/* Awaiting Verification */}
        <div
          onClick={() => onNavigateTab('verifications')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Verification</span>
            <HelpCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-display">{awaitingVerification}</div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Blind questions pending</p>
        </div>

        {/* Recovered Items */}
        <div
          onClick={() => onNavigateTab('deliveries')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Recovered Items</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-display">{recoveredItems}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Verified handovers</p>
        </div>
      </div>

      {/* Connected Organizations Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connected Organizations Network
              </h3>
              <p className="text-xs text-slate-500">
                FindBack AI connects multiple venues so lost items can be recovered across stadiums, malls, and conferences.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('connected-orgs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Network Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {organizations.map((org) => {
            const orgFound = foundItems.filter((f) => f.organizationId === org.id).length;
            const orgLost = lostItems.filter((l) => l.organizationId === org.id).length;

            return (
              <div
                key={org.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{org.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    {org.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{org.location}</p>
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
                  <span className="text-slate-600">
                    <strong className="text-slate-900">{orgFound}</strong> Found in Vault
                  </span>
                  <span className="text-slate-600">
                    <strong className="text-slate-900">{orgLost}</strong> Lost Reports
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Matches Review Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              High-Confidence Potential Matches Awaiting Admin Review
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated by Gemini reasoning & multi-factor verification scoring
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('ai-matches')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {matches.slice(0, 3).map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  <img
                    src={match.foundItem?.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80'}
                    alt="Item"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {match.lostItem?.title} ↔ {match.foundItem?.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {match.score}% Score
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {match.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('ai-matches')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  Review Match
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
