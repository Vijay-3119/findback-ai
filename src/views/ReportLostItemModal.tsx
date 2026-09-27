import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
  ShieldAlert,
  ArrowRight,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { LostItem, Organization, Match } from '../types/index.js';
import { createLostItem } from '../api.js';

interface ReportLostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  userId: string;
  onItemReported: (item: LostItem, matches: Match[]) => void;
}

const PRESET_SAMPLES = [
  {
    title: 'Nike Elemental Backpack',
    text: 'I lost my black Nike backpack at Mumbai Stadium yesterday around 8 PM near West Pavilion Gate 4. It has a small red keychain and white Nike swoosh.',
    category: 'backpack',
    brand: 'Nike',
    color: 'black',
    location: 'Mumbai Stadium, Gate 4',
    secretDetail: 'Contains blue spiral notebook with initials VR and a silver Waterman pen.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    orgCode: 'ST-MUM-04',
  },
  {
    title: 'Ray-Ban Aviator Sunglasses',
    text: 'Lost my classic gold-rimmed Ray-Ban Aviators with dark green polarized lenses at Phoenix Mall Food Court around 3 PM today. Left them in a black leather snap case.',
    category: 'eyewear',
    brand: 'Ray-Ban',
    color: 'gold / black case',
    location: 'Phoenix Mall, Food Court Level 3',
    secretDetail: 'Case has faint scratch on bottom corner and cleaning cloth inside with Ray-Ban logo.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    orgCode: 'ML-PHX-12',
  },
  {
    title: 'Apple AirPods Pro 2nd Gen',
    text: 'Left my Apple AirPods Pro in a navy blue silicone protective case near the Main Stage sound booth at TechFest 2026.',
    category: 'electronics',
    brand: 'Apple',
    color: 'white / navy blue case',
    location: 'TechFest 2026, Main Stage Sound Booth',
    secretDetail: 'Serial number inside lid ends in 4X9Q, case has a carabiner clip attached.',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    orgCode: 'EV-TCF-88',
  },
];

export const ReportLostItemModal: React.FC<ReportLostItemModalProps> = ({
  isOpen,
  onClose,
  organizations,
  userId,
  onItemReported,
}) => {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [location, setLocation] = useState('Mumbai Stadium, West Pavilion');
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id || 'org-mumbai-stadium');
  const [serialNumber, setSerialNumber] = useState('');
  const [secretDetail, setSecretDetail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [createdItem, setCreatedItem] = useState<LostItem | null>(null);
  const [matchesFound, setMatchesFound] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (sample: typeof PRESET_SAMPLES[0]) => {
    setDescription(sample.text);
    setTitle(sample.title);
    setCategory(sample.category);
    setBrand(sample.brand);
    setColor(sample.color);
    setLocation(sample.location);
    setSecretDetail(sample.secretDetail);
    setImageUrl(sample.image);
    const org = organizations.find((o) => o.code === sample.orgCode);
    if (org) setOrganizationId(org.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !title.trim()) {
      setError('Please provide a natural language description or item title.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await createLostItem({
        userId,
        organizationId,
        title: title.trim() || 'Lost Item',
        category,
        brand,
        color,
        description: description.trim(),
        image: imageUrl || undefined,
        location,
        serialNumber,
        secretDetail,
        lostAt: new Date().toISOString(),
      });

      setAnalysisResult(res.aiAttributes);
      setCreatedItem(res.item);
      setMatchesFound(res.matches);
      onItemReported(res.item, res.matches);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze item. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setTitle('');
    setCategory('');
    setBrand('');
    setColor('');
    setSerialNumber('');
    setSecretDetail('');
    setImageUrl('');
    setAnalysisResult(null);
    setCreatedItem(null);
    setMatchesFound([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight">Report Lost Item with Gemini AI</h2>
              <p className="text-xs text-blue-100">
                Describe in plain words or snap a photo — our AI extracts features & searches connected venues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Submission Error</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Quick preset chips */}
          {!analysisResult && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Quick-Test Sample Scenarios:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(sample)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-blue-200/80 bg-blue-50/60 hover:bg-blue-100/80 text-blue-800 font-medium transition-colors flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{sample.title}</span>
                    <span className="text-[10px] text-blue-500 font-mono">({sample.orgCode})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {analysisResult && createdItem ? (
            /* AI Analysis Result Card */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white border-2 border-blue-300/80 shadow-md">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-1">
                        Gemini Neural Extraction
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{createdItem.title}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-medium">Confidence Score</span>
                    <span className="text-2xl font-extrabold text-blue-700 font-display">
                      {Math.round((analysisResult.confidence || 0.92) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-blue-100 mb-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Category</span>
                    <span className="text-slate-800 font-bold capitalize">{analysisResult.category || createdItem.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Brand</span>
                    <span className="text-slate-800 font-bold capitalize">{analysisResult.brand || createdItem.brand || 'Unbranded'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Color</span>
                    <span className="text-slate-800 font-bold capitalize">{analysisResult.color || createdItem.color}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Venue Location</span>
                    <span className="text-slate-800 font-bold truncate block">{analysisResult.location || createdItem.location}</span>
                  </div>
                </div>

                {/* Features Pill tags */}
                {analysisResult.features && analysisResult.features.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-slate-600 block mb-2">
                      Extracted Visual & Semantic Features:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.features.map((feat: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-900 text-xs font-medium shadow-xs"
                        >
                          ✦ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON disclosure */}
                <details className="mt-4 pt-3 border-t border-blue-100 text-xs">
                  <summary className="cursor-pointer text-blue-700 font-semibold hover:underline">
                    View Structured Gemini JSON Output
                  </summary>
                  <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-emerald-400 overflow-x-auto text-[11px] font-mono leading-relaxed">
                    {JSON.stringify(analysisResult, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Match Notification */}
              {matchesFound.length > 0 ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                        Instant Match Detected
                      </span>
                      <span className="text-xs text-emerald-800 font-medium">
                        Score: {matchesFound[0].score}%
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-emerald-950 mt-1">
                      {matchesFound.length} Potential Match found in Connected Vault!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      {matchesFound[0].summary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs text-blue-900">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>
                    Report registered! The neural matching engine is continuously scanning new found item turn-ins across all connected venues.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Report Another Item
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
                >
                  View in Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Natural language description */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Natural Language Description *</span>
                  <span className="text-xs font-normal text-blue-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Gemini will auto-extract all fields
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder='e.g. "I lost my black Nike backpack at Mumbai Stadium yesterday around 8 PM. It has a small red keychain."'
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm placeholder:text-slate-400 transition-all"
                  required
                />
              </div>

              {/* Photo preview or URL input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload or Paste Photo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... or choose preset"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>

                  {imageUrl && (
                    <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={imageUrl} alt="Item Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lost at Venue / Organization *
                  </label>
                  <select
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.location})
                      </option>
                    ))}
                  </select>

                  <div className="mt-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specific Venue Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. West Pavilion Gate 4 or Food Court Level 3"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Collapsible Specific Manual Overrides */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title / Item Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Black Nike Backpack"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Auto-detected if blank"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Auto-detected if blank"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Serial Number / Unique ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-892104 or IMEI"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Secret Item Detail (Blind Verification)</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Kept Private</span>
                  </label>
                  <input
                    type="text"
                    value={secretDetail}
                    onChange={(e) => setSecretDetail(e.target.value)}
                    placeholder="e.g. Contains red keychain & notebook with initials 'VR'"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Gemini AI Analyzing & Matching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>Submit & Analyze Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
