import React, { useState } from 'react';
import { LostItem, Match } from '../types/index.js';
import {
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Radio,
  FileQuestion,
  HelpCircle,
  Tag,
  AlertCircle,
  PlusCircle,
  Eye,
} from 'lucide-react';

interface UserDashboardProps {
  lostItems: LostItem[];
  matches: Match[];
  onOpenReportModal: () => void;
  onSelectMatch: (matchId: string) => void;
  onOpenDiscoveryHub: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  lostItems,
  matches,
  onOpenReportModal,
  onSelectMatch,
  onOpenDiscoveryHub,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'matches' | 'recovered'>('all');
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const activeReportsCount = lostItems.filter((i) => i.status === 'searching' || i.status === 'matched').length;
  const potentialMatchesCount = matches.filter((m) => m.status === 'potential_match' || m.status === 'pending_verification').length;
  const recoveredCount = lostItems.filter((i) => i.status === 'recovered').length;

  const topMatch = matches.find((m) => m.status === 'potential_match' || m.status === 'pending_verification') || matches[0];

  const filteredItems = lostItems.filter((item) => {
    if (filter === 'active') return item.status === 'searching' || item.status === 'matched';
    if (filter === 'matches') return item.status === 'matched';
    if (filter === 'recovered') return item.status === 'recovered';
    return true;
  });

  const handleImageError = (id: string) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="flex flex-col w-full gap-8 max-w-7xl mx-auto">
      {/* Top Hero Atmosphere */}
      <section className="relative w-full rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 p-6 sm:p-8 md:p-10 shadow-[0_1px_6px_rgba(15,23,42,0.04)] border border-slate-200/80 overflow-hidden">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 shadow-xs border border-blue-200/70 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Multi-Venue Neural Radar Active
              </span>
              <span className="text-slate-300 font-light">|</span>
              <span className="text-[11px] font-semibold text-slate-600">1,420+ Hubs Connected</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
              Recover what you <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">lost</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mb-6 leading-relaxed font-normal">
              Describe in plain language or snap a photo. Our vision AI continuously cross-references intake manifests across connected stadiums, shopping centers, and transit terminals.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenReportModal}
                className="group inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-all duration-200 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Report Lost Item</span>
                <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenDiscoveryHub}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-white text-slate-800 text-xs sm:text-sm font-semibold shadow-xs border border-slate-200/80 hover:bg-slate-50 transition-colors"
              >
                <Search className="w-4 h-4 text-blue-600" />
                <span>Explore Registry</span>
              </button>
            </div>
          </div>

          {/* Quick AI Live Telemetry Box */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/90 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Autonomous Radar</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                100% Synced
              </span>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">3 Multi-Venue Nodes Online</div>
                <div className="text-[11px] text-slate-500 truncate">Mumbai Stadium · Phoenix · TechFest</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Neural matching accuracy</span>
                <span className="font-semibold text-slate-900 font-mono">98.4%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: '98.4%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Modern KPI Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Reports */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Reports</span>
              <div className="font-display text-3xl sm:text-4xl font-black text-slate-900 mt-1">{activeReportsCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 text-blue-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Live radar tracking
            </span>
            <span className="text-[11px]">Auto-refreshing</span>
          </div>
        </div>

        {/* Potential Matches (Hero Highlight) */}
        <div
          onClick={() => topMatch && onSelectMatch(topMatch.id)}
          className={`p-6 rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
            potentialMatchesCount > 0
              ? 'bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white border-2 border-indigo-200/90 shadow-sm hover:border-indigo-400 hover:shadow-md'
              : 'bg-white border border-slate-200/80 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Potential Matches</span>
              </span>
              <div className="font-display text-3xl sm:text-4xl font-black text-indigo-950 mt-1">{potentialMatchesCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs">
            {potentialMatchesCount > 0 ? (
              <>
                <span className="font-bold text-indigo-700 text-xs">
                  {topMatch?.score || 94}% Top Match Score
                </span>
                <span className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </>
            ) : (
              <span className="text-slate-400 text-xs">Scanning across hubs</span>
            )}
          </div>
        </div>

        {/* Recovered Items */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recovered Items</span>
              <div className="font-display text-3xl sm:text-4xl font-black text-emerald-600 mt-1">{recoveredCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified handovers
            </span>
            <span className="text-[11px] font-mono">100% Rate</span>
          </div>
        </div>
      </section>

      {/* Featured AI Match Spotlight (If there are active matches) */}
      {topMatch && (
        <section className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                <span className="text-xl font-black font-display leading-none">{topMatch.score}%</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-blue-200 mt-0.5">Match</span>
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
                  <Sparkles className="w-3 h-3 text-blue-300" />
                  <span>AI Match Spotlight</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  High-confidence match detected for your &ldquo;{topMatch.lostItem?.title}&rdquo;
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1 max-w-2xl">
                  {topMatch.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onSelectMatch(topMatch.id)}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-blue-50 transition-colors shadow-md flex items-center gap-2 active:scale-95"
              >
                <span>Review & Verify Ownership</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Section: "Your Lost Items" */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Your Lost Items</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live status, detected matches, and custody verification progress across connected facilities.
            </p>
          </div>

          {/* Filter Tabs Segmented Control with Horizontal Scroll for Mobile */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 self-start sm:self-auto border border-slate-200/80 overflow-x-auto max-w-full">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({lostItems.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === 'active'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeReportsCount})
            </button>
            <button
              onClick={() => setFilter('matches')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === 'matches'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matches ({potentialMatchesCount})
            </button>
            <button
              onClick={() => setFilter('recovered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === 'recovered'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recovered ({recoveredCount})
            </button>
          </div>
        </div>

        {/* Empty State when no items match the filter */}
        {filteredItems.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center max-w-xl mx-auto w-full my-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Items Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              {filter === 'all'
                ? "You haven't reported any lost items yet. Report your missing item to initiate cross-venue neural matching."
                : `There are no lost reports matching the "${filter}" filter criteria at this time.`}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Clear Filter
                </button>
              )}
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Lost Item</span>
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const itemMatch = matches.find((m) => m.lostItemId === item.id);
              const isMatched = item.status === 'matched';
              const isRecovered = item.status === 'recovered';
              const isSearching = item.status === 'searching';
              const hasImageError = imageErrorMap[item.id];

              return (
                <article
                  key={item.id}
                  className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
                >
                  {/* Item Image Header with sleek 16/10 aspect ratio */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    {!hasImageError && item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={() => handleImageError(item.id)}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4">
                        <Tag className="w-8 h-8 mb-1 text-slate-300" />
                        <span className="text-[11px] font-medium text-slate-400">Photo not provided</span>
                      </div>
                    )}

                    {/* Dark gradient overlay for bottom legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Status Badge Pin (Top Left) */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {isMatched && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-indigo-900 text-[11px] font-bold shadow-sm backdrop-blur-md border border-indigo-200/60">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                          </span>
                          <span>Match Found ({itemMatch?.score || 94}%)</span>
                        </span>
                      )}
                      {isRecovered && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 text-emerald-800 text-[11px] font-bold shadow-sm backdrop-blur-md border border-emerald-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Handover Complete</span>
                        </span>
                      )}
                      {isSearching && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-blue-800 text-[11px] font-semibold shadow-sm backdrop-blur-md border border-blue-200/60">
                          <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                          <span>Scanning Hubs</span>
                        </span>
                      )}
                    </div>

                    {/* Category pill on top right */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-900/70 text-white font-medium text-[10px] uppercase tracking-wider backdrop-blur-md border border-white/20">
                        {item.category}
                      </span>
                    </div>

                    {/* Bottom Image Overlay Details */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-1 truncate max-w-[190px]">
                        <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                        <span className="truncate text-[11px] font-medium text-slate-100">{item.location}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 shrink-0">
                        {new Date(item.lostAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Brand and Category Line */}
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
                        <span className="text-blue-600 uppercase tracking-wider text-[11px]">{item.brand || 'Unbranded'}</span>
                        <span>·</span>
                        <span className="capitalize text-slate-500">{item.color}</span>
                        {item.serialNumber && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[10px] text-slate-400">SN: {item.serialNumber}</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* AI-Extracted Attributes Pill tags */}
                      {item.aiAttributes?.features && item.aiAttributes.features.length > 0 && (
                        <div className="mb-4">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Extracted Visual Markers
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.aiAttributes.features.slice(0, 3).map((feat, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200/80"
                              >
                                ✦ {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-3 border-t border-slate-100">
                      {isMatched && itemMatch ? (
                        <button
                          onClick={() => onSelectMatch(itemMatch.id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98]"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>View Potential Match ({itemMatch.score}%)</span>
                        </button>
                      ) : isRecovered ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200/80 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Custody Released & Verified</span>
                        </div>
                      ) : (
                        <button
                          onClick={onOpenDiscoveryHub}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          <Search className="w-3.5 h-3.5 text-slate-500" />
                          <span>Scan Facility Registry</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom SaaS Feature Spotlight: How AI Matching Works */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/60 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-200/80">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-base sm:text-lg font-bold text-slate-900">
              Deterministic & Gemini Multi-Modal Verification
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
              Live Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            Our multi-attribute matching compares Category (+20 pts), Brand (+20 pts), Color (+10 pts), Visual Features (+20 pts), Location proximity (+15 pts), and Turn-in time (+15 pts). Blind challenge questions ensure private details remain completely confidential.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={onOpenDiscoveryHub}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 text-xs font-bold border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
          >
            Explore Public Hub
          </button>
        </div>
      </section>
    </div>
  );
};
