import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Boxes,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Share2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Organization, FoundItem, LostItem } from '../types/index.js';

interface ConnectedOrganizationsProps {
  organizations: Organization[];
  currentOrg: Organization | null;
  onSelectOrg: (org: Organization) => void;
  foundItems: FoundItem[];
  lostItems: LostItem[];
}

export const ConnectedOrganizations: React.FC<ConnectedOrganizationsProps> = ({
  organizations,
  currentOrg,
  onSelectOrg,
  foundItems,
  lostItems,
}) => {
  const [crossSearchQuery, setCrossSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCrossItems = foundItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(crossSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(crossSearchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(crossSearchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(crossSearchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/20">
          <Share2 className="w-3.5 h-3.5" /> Federated Multi-Venue Network
        </div>
        <h1 className="text-3xl font-extrabold font-display">Connected Organizations</h1>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          FindBack AI enables interoperable cross-venue recovery. Lost items misplaced at a stadium, mall, or exhibition can be discovered and reconciled across organizational boundaries without exposing private vault assets.
        </p>
      </div>

      {/* 3 Main Organizations Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {organizations.map((org) => {
          const isCurrent = currentOrg?.id === org.id;
          const orgFound = foundItems.filter((f) => f.organizationId === org.id);
          const orgLost = lostItems.filter((l) => l.organizationId === org.id);

          return (
            <div
              key={org.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                    #{org.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 capitalize">
                    {org.type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{org.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{org.location}</span>
                </p>

                <div className="grid grid-cols-2 gap-3 my-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Found in Vault</span>
                    <span className="text-lg font-black text-slate-900 font-display">{orgFound.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lost Reports</span>
                    <span className="text-lg font-black text-slate-900 font-display">{orgLost.length}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custody Lockers:</span>
                    <span className="font-semibold text-slate-800">{org.activeLockers || '16 Smart Vaults'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Neural Gateway:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Operational
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectOrg(org)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Current Workspace</span>
                    </>
                  ) : (
                    <>
                      <span>Switch to this Venue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Organization Federated Search */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Inter-Organization Cross-Search Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Search across Mumbai Stadium, Phoenix Mall, and TechFest 2026 inventories simultaneously.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Network Items:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
              {foundItems.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={crossSearchQuery}
              onChange={(e) => setCrossSearchQuery(e.target.value)}
              placeholder="Query all 3 connected organizations (e.g. Nike, Ray-Ban, AirPods)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="backpack">Backpack</option>
            <option value="eyewear">Eyewear</option>
            <option value="electronics">Electronics</option>
          </select>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {filteredCrossItems.map((item) => {
            const org = organizations.find((o) => o.id === item.organizationId);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80'}
                  alt={item.title}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                      {org?.code || 'ORG'}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{org?.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
