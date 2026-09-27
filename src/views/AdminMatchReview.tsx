import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Check,
  X,
  AlertCircle,
  ArrowRight,
  Clock,
  Layers,
  FileCheck,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Match, Verification } from '../types/index.js';
import { requestVerification, rejectMatch, adjudicateVerification } from '../api.js';

interface AdminMatchReviewProps {
  matches: Match[];
  verifications: Verification[];
  onRefreshData: () => void;
}

export const AdminMatchReview: React.FC<AdminMatchReviewProps> = ({
  matches,
  verifications,
  onRefreshData,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [customQuestion, setCustomQuestion] = useState('What was inside your backpack?');
  const [adminNotes, setAdminNotes] = useState('Verified against locker inspection.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const activeMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const activeVerification = verifications.find((v) => v.matchId === activeMatch?.id);

  const handleRequestVerification = async () => {
    if (!activeMatch) return;
    setIsProcessing(true);
    setActionSuccess(null);
    try {
      await requestVerification(activeMatch.id);
      setActionSuccess('Verification challenge dispatched to user! Awaiting claimant answer.');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      setActionSuccess(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectMatch = async () => {
    if (!activeMatch) return;
    setIsProcessing(true);
    setActionSuccess(null);
    try {
      await rejectMatch(activeMatch.id);
      setActionSuccess('Match rejected and dissociated.');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdjudicate = async (decision: 'approve' | 'request_info' | 'reject') => {
    if (!activeVerification) return;
    setIsProcessing(true);
    setActionSuccess(null);
    try {
      await adjudicateVerification(activeVerification.id, decision, adminNotes);
      setActionSuccess(
        decision === 'approve'
          ? 'Ownership officially approved! Item moved to ready for pickup/delivery.'
          : decision === 'request_info'
          ? 'Requested additional proof from claimant.'
          : 'Claimant verification rejected.'
      );
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      setActionSuccess(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No Matches Currently Queued</h3>
        <p className="text-sm text-slate-500 mt-2">
          New potential matches will be generated automatically when lost reports or found items are cataloged.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Adjudication Desk</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Admin Match Review</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit deterministic attribute weights & Gemini visual reasoning before requesting claimant proof.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Queue:</span>
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
            {matches.length} Matches
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-blue-600 font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Match Queue */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Matches Awaiting Review
          </h2>
          {matches.map((m) => {
            const isSelected = activeMatch?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMatchId(m.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Case #{m.id.slice(-6)}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {m.lostItem?.title} ↔ {m.foundItem?.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Turned in at: {m.foundItem?.location}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-base font-extrabold text-blue-700 font-display">
                      {m.score}%
                    </span>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Score</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    m.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : m.status === 'verification_submitted'
                      ? 'bg-amber-100 text-amber-800'
                      : m.status === 'pending_verification'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {m.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Deep Review & Adjudication Actions */}
        {activeMatch && (
          <div className="lg:col-span-8 space-y-6">
            {/* Side by side display */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-lg font-black font-display leading-none">{activeMatch.score}%</span>
                    <span className="text-[8px] uppercase tracking-wider text-blue-200">Match</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Side-by-Side Attribute Comparison
                    </h3>
                    <p className="text-xs text-slate-500">
                      Lost Claim: #{activeMatch.lostItemId.slice(-6)} • Found Custody: #{activeMatch.foundItemId.slice(-6)}
                    </p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  activeMatch.status === 'verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {activeMatch.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* 2-Column Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lost Item Details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      User Lost Report
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold uppercase">
                      Claimant
                    </span>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                    <img
                      src={activeMatch.lostItem?.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                      alt="Lost Item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeMatch.lostItem?.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{activeMatch.lostItem?.description}</p>
                  <div className="space-y-1 text-xs border-t border-slate-200 pt-2 text-slate-600">
                    <div><strong>Category:</strong> {activeMatch.lostItem?.category}</div>
                    <div><strong>Brand:</strong> {activeMatch.lostItem?.brand || 'N/A'}</div>
                    <div><strong>Color:</strong> {activeMatch.lostItem?.color}</div>
                    <div><strong>Reported Location:</strong> {activeMatch.lostItem?.location}</div>
                  </div>
                </div>

                {/* Found Item Details */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Facility Found Item
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 font-bold uppercase">
                      Custody Vault
                    </span>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 border border-blue-300">
                    <img
                      src={activeMatch.foundItem?.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                      alt="Found Item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeMatch.foundItem?.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{activeMatch.foundItem?.description}</p>
                  <div className="space-y-1 text-xs border-t border-blue-200 pt-2 text-slate-600">
                    <div><strong>Category:</strong> {activeMatch.foundItem?.category}</div>
                    <div><strong>Brand:</strong> {activeMatch.foundItem?.brand || 'N/A'}</div>
                    <div><strong>Color:</strong> {activeMatch.foundItem?.color}</div>
                    <div><strong>Found Location:</strong> {activeMatch.foundItem?.location}</div>
                  </div>
                </div>
              </div>

              {/* Reasons & Attributes Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Alignment & Reasoning
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-medium text-slate-800">{activeMatch.summary}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/80">
                    {activeMatch.reasons.map((r, i) => (
                      <div key={i} className="text-xs text-slate-700 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verification & Adjudication Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Custody Actions
                </h4>

                {/* If verification already has an answer submitted */}
                {activeVerification?.status === 'submitted' ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-900">
                        Claimant Submitted Answer for Blind Challenge:
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-amber-200 text-xs font-mono text-slate-800">
                      "{activeVerification.answer}"
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Admin Custodial Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAdjudicate('approve')}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Ownership</span>
                      </button>
                      <button
                        onClick={() => handleAdjudicate('request_info')}
                        disabled={isProcessing}
                        className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                      >
                        Request More Info
                      </button>
                      <button
                        onClick={() => handleAdjudicate('reject')}
                        disabled={isProcessing}
                        className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                      >
                        Reject Claim
                      </button>
                    </div>
                  </div>
                ) : activeMatch.status === 'verified' ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Ownership Verified</span>
                      <span className="text-[11px] text-emerald-700">
                        Item custody is authorized for in-person pickup or courier dispatch.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleRequestVerification}
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <HelpCircle className="w-4 h-4" />
                      )}
                      <span>Request Ownership Verification</span>
                    </button>

                    <button
                      onClick={handleRejectMatch}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Match</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
