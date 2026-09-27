import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  FileCheck,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Building2,
  Radio,
  Share2,
} from 'lucide-react';
import { Match, LostItem, FoundItem, Verification } from '../types/index.js';

interface UserPotentialMatchesProps {
  matches: Match[];
  verifications: Verification[];
  onOpenVerificationModal: (matchId: string) => void;
  onOpenDeliveryTracker: (matchId: string) => void;
}

export const UserPotentialMatches: React.FC<UserPotentialMatchesProps> = ({
  matches,
  verifications,
  onOpenVerificationModal,
  onOpenDeliveryTracker,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');

  const activeMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  const getVerificationForMatch = (matchId: string) => {
    return verifications.find((v) => v.matchId === matchId);
  };

  const activeVerification = activeMatch ? getVerificationForMatch(activeMatch.id) : undefined;

  if (!matches || matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-display text-slate-900">No Potential Matches Yet</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-md">
          The neural radar is continuously analyzing incoming turn-ins across 1,420+ facilities. As soon as a custodian logs an item matching your attributes, it will be surfaced here immediately.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/50">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          <span>Background Matching Running 24/7</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2.5 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Deterministic & Gemini Neural Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">Potential Item Matches</h1>
          <p className="text-xs sm:text-sm text-blue-200/90 mt-1 max-w-xl leading-relaxed">
            Multi-attribute scoring cross-references Category (+20), Brand (+20), Color (+10), Visual Features (+20), Location proximity (+15), and Turn-in time (+15).
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="px-5 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <span className="text-[11px] text-blue-200 uppercase font-bold block">Active Matches</span>
            <span className="text-3xl font-black font-display text-white">{matches.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Queue on Left, Deep-Dive on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Match Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Matches Queue ({matches.length})
            </h2>
            <span className="text-[11px] text-slate-500">Sorted by Confidence</span>
          </div>

          <div className="space-y-3">
            {matches.map((match) => {
              const isSelected = activeMatch?.id === match.id;
              const verification = getVerificationForMatch(match.id);

              return (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatchId(match.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={match.foundItem?.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'}
                          alt={match.foundItem?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {match.lostItem?.title || 'Reported Lost Item'}
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Turned in at: {match.foundItem?.location || 'Connected Venue'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-blue-700 font-display">
                        {match.score}%
                      </span>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Confidence</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      match.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : match.status === 'verification_submitted'
                        ? 'bg-amber-100 text-amber-800'
                        : match.status === 'pending_verification'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {match.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(match.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Deep-Dive Comparison & Actions */}
        {activeMatch && (
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
              {/* Header with High-Impact Score Display */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  {/* Radial / Score Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                    <span className="text-2xl font-black font-display leading-none">{activeMatch.score}%</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-blue-200 mt-1">Match</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 tracking-wider">
                        High Confidence Link
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Case #{activeMatch.id.slice(-6)}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-1">
                      {activeMatch.lostItem?.title} ↔ {activeMatch.foundItem?.title}
                    </h3>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div>
                  {activeMatch.status === 'verified' ? (
                    <button
                      onClick={() => onOpenDeliveryTracker(activeMatch.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Track Pickup / Delivery</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : activeMatch.status === 'pending_verification' ? (
                    <button
                      onClick={() => onOpenVerificationModal(activeMatch.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 animate-pulse"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Answer Verification Challenge</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : activeMatch.status === 'verification_submitted' ? (
                    <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Answer Under Custodian Review</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenVerificationModal(activeMatch.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Verify Ownership</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Lost Report (Left) */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Your Lost Report
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold uppercase">
                      Claimant
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-200 border border-slate-300/60">
                    <img
                      src={activeMatch.lostItem?.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                      alt="Your reported item"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2.5 text-white text-xs font-medium">
                      Reported: {new Date(activeMatch.lostItem?.lostAt || '').toLocaleDateString()}
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{activeMatch.lostItem?.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {activeMatch.lostItem?.description}
                  </p>

                  <div className="space-y-1.5 text-xs border-t border-slate-200/80 pt-3 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-semibold text-slate-800 capitalize">{activeMatch.lostItem?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Brand:</span>
                      <span className="font-semibold text-slate-800">{activeMatch.lostItem?.brand || 'Unbranded'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Color:</span>
                      <span className="font-semibold text-slate-800 capitalize">{activeMatch.lostItem?.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Venue Location:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]">{activeMatch.lostItem?.location}</span>
                    </div>
                  </div>
                </div>

                {/* Organization Found Item (Right) */}
                <div className="p-4 sm:p-5 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                      Turned In to Facility Vault
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold uppercase">
                      Locker Secured
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-200 border border-blue-200">
                    <img
                      src={activeMatch.foundItem?.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                      alt="Custody item"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2.5 text-white text-xs font-medium">
                      Intake: {new Date(activeMatch.foundItem?.foundAt || '').toLocaleDateString()}
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{activeMatch.foundItem?.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {activeMatch.foundItem?.description}
                  </p>

                  <div className="space-y-1.5 text-xs border-t border-blue-200/80 pt-3 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-semibold text-slate-800 capitalize">{activeMatch.foundItem?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Brand:</span>
                      <span className="font-semibold text-slate-800">{activeMatch.foundItem?.brand || 'Unbranded'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Color:</span>
                      <span className="font-semibold text-slate-800 capitalize">{activeMatch.foundItem?.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Turn-in Location:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]">{activeMatch.foundItem?.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deterministic + Neural AI Match Breakdown Grid */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Match Factor Breakdown (100 Pt Model)
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-blue-600">Total: {activeMatch.score} / 100</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Category</span>
                      <span className="font-bold text-blue-600">+20 pts</span>
                    </div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="capitalize truncate">{activeMatch.lostItem?.category}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Brand</span>
                      <span className="font-bold text-blue-600">+20 pts</span>
                    </div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="capitalize truncate">{activeMatch.lostItem?.brand || 'Verified'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Color</span>
                      <span className="font-bold text-blue-600">+10 pts</span>
                    </div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="capitalize truncate">{activeMatch.lostItem?.color}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Visual Features</span>
                      <span className="font-bold text-blue-600">+20 pts</span>
                    </div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Visual alignment</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Facility Venue</span>
                      <span className="font-bold text-blue-600">+15 pts</span>
                    </div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Same Connected Hub</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Time Delta</span>
                      <span className="font-bold text-blue-600">+15 pts</span>
                    </div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Within incident window</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gemini Neural Reasoning Card */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gemini Neural Reasoning</span>
                </h4>
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-200/80 space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                    &ldquo;{activeMatch.summary}&rdquo;
                  </p>
                  <ul className="space-y-1.5 pt-2 border-t border-blue-200/60">
                    {activeMatch.reasons.map((r, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
