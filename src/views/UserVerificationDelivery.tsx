import React, { useState } from 'react';
import {
  ShieldCheck,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  MapPin,
  QrCode,
  ArrowRight,
  Send,
  Loader2,
  Building2,
  Lock,
  Sparkles,
  Phone,
  UserCheck,
  ChevronRight,
  Shield,
  KeyRound,
  FileCheck2,
} from 'lucide-react';
import { Verification, DeliveryRecord, Match } from '../types/index.js';
import { submitVerificationAnswer, selectDeliveryMethod, updateDeliveryStatus } from '../api.js';

interface UserVerificationDeliveryProps {
  verifications: Verification[];
  deliveries: DeliveryRecord[];
  matches: Match[];
  selectedMatchId?: string;
  onRefreshData: () => void;
}

export const UserVerificationDelivery: React.FC<UserVerificationDeliveryProps> = ({
  verifications,
  deliveries,
  matches,
  selectedMatchId,
  onRefreshData,
}) => {
  const [selectedVerifId, setSelectedVerifId] = useState<string>(
    verifications[0]?.id || ''
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('delivery');
  const [destinationAddress, setDestinationAddress] = useState('Flat 402, Sea Green Apts, Worli Sea Face, Mumbai 400030');
  const [updatingDelivery, setUpdatingDelivery] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Find active verification
  const activeVerification =
    verifications.find((v) => v.id === selectedVerifId) ||
    verifications.find((v) => v.matchId === selectedMatchId) ||
    verifications[0];

  // Associated match and delivery
  const match = activeVerification?.match || matches.find((m) => m.id === activeVerification?.matchId);
  const delivery = deliveries.find((d) => d.matchId === activeVerification?.matchId);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVerification || !userAnswer.trim()) return;

    setIsSubmitting(true);
    setActionMessage(null);
    try {
      await submitVerificationAnswer(activeVerification.id, userAnswer.trim());
      setActionMessage('Your confidential answer has been securely submitted to the facility custodian for adjudication.');
      setUserAnswer('');
      onRefreshData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'Failed to submit answer'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDeliveryMethod = async (method: 'pickup' | 'delivery') => {
    if (!delivery) return;
    setUpdatingDelivery(true);
    try {
      await selectDeliveryMethod(delivery.id, method, method === 'delivery' ? destinationAddress : undefined);
      setActionMessage(`Handover method set to ${method === 'pickup' ? 'In-Person Vault Pickup' : 'Express Courier Dispatch'}`);
      onRefreshData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setUpdatingDelivery(false);
    }
  };

  const handleAdvanceDelivery = async () => {
    if (!delivery) return;
    const stages: Array<'verification_complete' | 'ready_for_pickup' | 'courier_assigned' | 'in_transit' | 'delivered'> = [
      'verification_complete',
      'ready_for_pickup',
      'courier_assigned',
      'in_transit',
      'delivered',
    ];
    const currentIndex = stages.indexOf(delivery.status);
    if (currentIndex < stages.length - 1) {
      const nextStatus = stages[currentIndex + 1];
      setUpdatingDelivery(true);
      try {
        await updateDeliveryStatus(delivery.id, nextStatus);
        onRefreshData();
      } catch (err) {
        console.error(err);
      } finally {
        setUpdatingDelivery(false);
      }
    }
  };

  if (!verifications || verifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 mx-auto mb-4 shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-display text-slate-900">No Verifications Currently Active</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          When an organization custodian identifies a high-confidence match with your reported lost item, a private blind challenge question will appear here to verify ownership before physical custody is released.
        </p>
      </div>
    );
  }

  const deliverySteps = [
    { key: 'verification_complete', label: 'Ownership Verified', desc: 'Custody approved by facility officer' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Item sealed in tamper-evident security bag' },
    { key: 'courier_assigned', label: 'Courier Assigned', desc: 'Secure transport agent booked' },
    { key: 'in_transit', label: 'In Transit', desc: 'Out for physical handover' },
    { key: 'delivered', label: 'Delivered / Handed Over', desc: 'Secure OTP validation complete' },
  ];

  const currentStepIndex = delivery
    ? deliverySteps.findIndex((s) => s.key === delivery.status)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-2.5 border border-purple-400/30">
            <Lock className="w-3.5 h-3.5 text-purple-300" />
            <span>Blind-Challenge Ownership Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">Ownership Verification & Custody</h1>
          <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-xl leading-relaxed">
            Protecting item integrity: Blind verification questions validate non-public characteristics so that only the genuine owner can claim physical property.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          {verifications.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVerifId(v.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeVerification?.id === v.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-purple-200'
              }`}
            >
              Case #{v.id.slice(-6)}
            </button>
          ))}
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-purple-600 font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Challenge on Left, Recovery Tracker on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Verification Challenge */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Security Verification
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Blind Challenge Question
                  </h3>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                activeVerification?.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : activeVerification?.status === 'submitted'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {activeVerification?.status === 'approved' ? 'Verified' : activeVerification?.status}
              </span>
            </div>

            {/* Match Item Preview Snippet */}
            {match && (
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <img
                  src={match.foundItem?.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80'}
                  alt="Item"
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{match.lostItem?.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">Custody Venue: {match.foundItem?.location}</p>
                  <span className="text-[10px] text-slate-400 font-mono">Case #{match.id.slice(-6)}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-black text-purple-700 font-display">{match.score}%</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Match</span>
                </div>
              </div>
            )}

            {/* The Blind Challenge Question */}
            <div className="p-4 sm:p-5 rounded-xl bg-purple-50/70 border-2 border-purple-200/90 space-y-1.5">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                Custodian Verification Challenge
              </span>
              <p className="text-sm sm:text-base font-semibold text-slate-900">
                &ldquo;{activeVerification?.question || 'What was inside your backpack?'}&rdquo;
              </p>
              <p className="text-[11px] text-purple-700/80 leading-relaxed pt-1">
                Only the genuine owner knows this unlisted detail. Your answer will be checked by facility custody staff against recorded inspection notes.
              </p>
            </div>

            {/* Form or Status */}
            {activeVerification?.status === 'approved' ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Ownership Approved & Authenticated!</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your submitted answer <span className="font-mono font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">&ldquo;{activeVerification.answer}&rdquo;</span> was matched and approved by the facility custodian officer.
                </p>
                {activeVerification.adminNotes && (
                  <p className="text-[11px] text-emerald-700 italic border-t border-emerald-200 pt-2">
                    Custody Log: {activeVerification.adminNotes}
                  </p>
                )}
              </div>
            ) : activeVerification?.status === 'submitted' ? (
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-xs">Answer Under Custodian Review</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  You submitted: <span className="font-semibold italic">&ldquo;{activeVerification.answer}&rdquo;</span>
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed pt-1">
                  The venue custodian has been alerted to cross-check this against the physical custody vault. Once confirmed, recovery and handover will unlock automatically.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Confidential Answer *
                  </label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={3}
                    placeholder='e.g. "Inside the main compartment was a blue spiral notebook with initials VR, a silver Waterman pen, and a laptop charger."'
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 leading-relaxed"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !userAnswer.trim()}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Encrypted Answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Verification Answer</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Recovery Options & Live Tracking */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Chain of Custody
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Recovery & Handover Status
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                OTP: {delivery?.otpCode || '9402'}
              </span>
            </div>

            {/* Check if ownership is verified */}
            {activeVerification?.status !== 'approved' ? (
              <div className="p-8 sm:p-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                <Lock className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">Recovery Protocol Locked</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Complete the ownership challenge question on the left. Once authenticated by the custodian, pickup scheduling and courier dispatch will unlock immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Method selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectDeliveryMethod('pickup')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      delivery?.method === 'pickup'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 mb-1.5 ${delivery?.method === 'pickup' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-900 block">In-Person Pick Up</span>
                    <span className="text-[10px] text-slate-500">Collect at Facility Lost & Found Desk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDeliveryMethod('delivery')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      delivery?.method === 'delivery'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Truck className={`w-5 h-5 mb-1.5 ${delivery?.method === 'delivery' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-900 block">Express Delivery</span>
                    <span className="text-[10px] text-slate-500">Courier dispatch to your doorstep</span>
                  </button>
                </div>

                {/* Handover Security Pass Card */}
                {delivery && (
                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">
                        Handover Security Pass
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono text-[10px] font-bold">
                        AUTHENTICATED CLAIM
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Verification Handover OTP</span>
                        <span className="font-mono text-xl font-black text-amber-400 tracking-wider">
                          {delivery.otpCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tamper Seal ID</span>
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {delivery.tamperSealId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Assigned Agent</span>
                        <span className="font-bold text-slate-200">
                          {delivery.courierName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tracking Number</span>
                        <span className="font-mono text-xs text-slate-300">
                          {delivery.trackingNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Recovery Pipeline Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recovery Progression Timeline
                    </h4>
                    <button
                      onClick={handleAdvanceDelivery}
                      disabled={updatingDelivery || delivery?.status === 'delivered'}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-40"
                    >
                      <span>Advance Stage (Demo)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {deliverySteps.map((step, idx) => {
                      const isComplete = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={step.key} className="relative flex items-start gap-3">
                          <div className={`absolute -left-6 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isComplete
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300'
                          }`}>
                            {isComplete && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : isComplete ? 'text-slate-800' : 'text-slate-400'}`}>
                              {step.label}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
