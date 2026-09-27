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
  ShieldCheck,
  ArrowRight,
  Loader2,
  Boxes,
  Lock,
} from 'lucide-react';
import { FoundItem, Organization, Match } from '../types/index.js';
import { createFoundItem } from '../api.js';

interface RegisterFoundItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  currentOrg: Organization | null;
  onItemRegistered: (item: FoundItem, matches: Match[]) => void;
}

const FOUND_PRESET_SAMPLES = [
  {
    title: 'Found Nike Backpack (Black)',
    notes: 'Turned in by stadium usher at West Pavilion Gate 4 after the match. Black backpack with white swoosh, red key fob attached to zipper.',
    category: 'backpack',
    brand: 'Nike',
    color: 'black',
    location: 'Mumbai Stadium, West Pavilion Gate 4',
    serialNumber: 'NK-882910',
    custodyLocker: 'Vault-B, Locker 14',
    custodianOfficer: 'Rajesh Sharma (Badge #884)',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    orgCode: 'ST-MUM-04',
  },
  {
    title: 'Found Gold-frame Aviator Glasses',
    notes: 'Found on table at Phoenix Mall Food Court near Juice Bar. Black leather protective case with Ray-Ban imprint.',
    category: 'eyewear',
    brand: 'Ray-Ban',
    color: 'gold / black case',
    location: 'Phoenix Mall, Food Court Table 19',
    serialNumber: 'RB-3025-AVI',
    custodyLocker: 'Sec-A, Drawer 03',
    custodianOfficer: 'Priya Mehta (Badge #312)',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    orgCode: 'ML-PHX-12',
  },
  {
    title: 'Found Wireless Earbuds in Blue Case',
    notes: 'Handed over by event volunteer at TechFest Main Stage. Apple AirPods Pro inside matte dark navy silicone case with metallic clip.',
    category: 'electronics',
    brand: 'Apple',
    color: 'white / navy blue case',
    location: 'TechFest 2026, Main Stage Sound Console',
    serialNumber: 'A2084-4X9Q',
    custodyLocker: 'Tech-Vault-1, Bin 09',
    custodianOfficer: 'Vikram Joshi (Badge #501)',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    orgCode: 'EV-TCF-88',
  },
];

export const RegisterFoundItemModal: React.FC<RegisterFoundItemModalProps> = ({
  isOpen,
  onClose,
  organizations,
  currentOrg,
  onItemRegistered,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [location, setLocation] = useState(currentOrg?.name ? `${currentOrg.name}, Gate 4` : 'Mumbai Stadium, Gate 4');
  const [organizationId, setOrganizationId] = useState(currentOrg?.id || organizations[0]?.id || 'org-mumbai-stadium');
  const [serialNumber, setSerialNumber] = useState('');
  const [custodyLocker, setCustodyLocker] = useState('Vault-B, Locker 14');
  const [custodianOfficer, setCustodianOfficer] = useState('Rajesh Sharma (Admin)');
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [registeredItem, setRegisteredItem] = useState<FoundItem | null>(null);
  const [generatedMatches, setGeneratedMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (sample: typeof FOUND_PRESET_SAMPLES[0]) => {
    setTitle(sample.title);
    setDescription(sample.notes);
    setCategory(sample.category);
    setBrand(sample.brand);
    setColor(sample.color);
    setLocation(sample.location);
    setSerialNumber(sample.serialNumber);
    setCustodyLocker(sample.custodyLocker);
    setCustodianOfficer(sample.custodianOfficer);
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
      setError('Please provide a description or item title.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await createFoundItem({
        organizationId,
        title: title.trim() || 'Found Item',
        category,
        brand,
        color,
        description: description.trim(),
        image: imageUrl || undefined,
        location,
        serialNumber,
        custodyLocker,
        custodianOfficer,
        foundAt: new Date().toISOString(),
      });

      setAnalysisResult(res.aiAttributes);
      setRegisteredItem(res.item);
      setGeneratedMatches(res.matches);
      onItemRegistered(res.item, res.matches);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to register found item.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setBrand('');
    setColor('');
    setSerialNumber('');
    setImageUrl('');
    setAnalysisResult(null);
    setRegisteredItem(null);
    setGeneratedMatches([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-md flex items-center justify-center border border-blue-400/30">
              <Boxes className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight">Register Found Item (Custody Intake)</h2>
              <p className="text-xs text-slate-300">
                AI attribute extraction & automatic cross-venue matching against active lost reports
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
                <p className="font-semibold">Registration Error</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!analysisResult && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Quick-Fill Demo Found Items:
              </p>
              <div className="flex flex-wrap gap-2">
                {FOUND_PRESET_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(sample)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 font-medium transition-colors flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{sample.title}</span>
                    <span className="text-[10px] text-indigo-500 font-mono">({sample.orgCode})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {analysisResult && registeredItem ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-slate-50 to-white border-2 border-indigo-200 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold uppercase tracking-wider mb-1">
                        Cataloged in Vault
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{registeredItem.title}</h3>
                      <p className="text-xs text-slate-500">
                        Custody Location: {registeredItem.custodyLocker || 'Main Vault'} • Tag: #{registeredItem.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-medium">AI Confidence</span>
                    <span className="text-2xl font-extrabold text-indigo-700 font-display">
                      {Math.round((analysisResult.confidence || 0.94) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-indigo-100 mb-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Category</span>
                    <span className="text-slate-800 font-bold capitalize">{analysisResult.category || registeredItem.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Brand</span>
                    <span className="text-slate-800 font-bold capitalize">{analysisResult.brand || registeredItem.brand || 'Unbranded'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Color</span>
                    <span className="text-slate-800 font-bold capitalize">{analysisResult.color || registeredItem.color}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Location Found</span>
                    <span className="text-slate-800 font-bold truncate block">{registeredItem.location}</span>
                  </div>
                </div>

                {analysisResult.features && analysisResult.features.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-2">
                      Extracted Visual Markers:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.features.map((feat: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-900 text-xs font-medium shadow-xs"
                        >
                          ✦ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Automatic Match results */}
              {generatedMatches.length > 0 ? (
                <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-blue-700 tracking-wider bg-blue-100 px-2 py-0.5 rounded-full">
                        {generatedMatches[0].score}% High-Confidence Match Found
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-blue-950 mt-1">
                      Matched with Lost Report: {generatedMatches[0].lostItem?.title || 'User Lost Report'}
                    </h4>
                    <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                      {generatedMatches[0].summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {generatedMatches[0].reasons.map((r, i) => (
                        <span key={i} className="px-2 py-1 bg-white/80 rounded-md text-blue-900 font-medium border border-blue-200">
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  No active lost reports currently match this item with high confidence. Item remains securely registered in custody.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Register Another Item
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
                >
                  View in Inventory
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Found Item Title / Brief Descriptor *</span>
                  <span className="text-xs font-normal text-indigo-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI analyzes photo & notes automatically
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Found Black Nike Backpack with red key fob"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intake Notes / Visual Details *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe where it was found, visible marks, contents visible from outside, accessories attached..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs"
                  required
                />
              </div>

              {/* Photo & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Photo of Found Item
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Photo URL or choose preset"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-3 relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={imageUrl} alt="Found Item Preview" className="w-full h-full object-cover" />
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

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization Venue *
                    </label>
                    <select
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Precise Turn-in Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. West Pavilion Gate 4 or Food Court Counter"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. backpack, eyewear"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Nike, Ray-Ban"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. black, gold"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Custody details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custody Locker / Bin
                  </label>
                  <input
                    type="text"
                    value={custodyLocker}
                    onChange={(e) => setCustodyLocker(e.target.value)}
                    placeholder="e.g. Vault-B, Locker 14"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Serial / Barcode
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Optional SN"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custodial Officer
                  </label>
                  <input
                    type="text"
                    value={custodianOfficer}
                    onChange={(e) => setCustodianOfficer(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
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
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/25 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Extracting Attributes & Searching Matches...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Intake & Cross-Match</span>
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
