import React, { useState } from 'react';
import {
  Boxes,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Lock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { FoundItem, Organization } from '../types/index.js';

interface AdminFoundItemsProps {
  foundItems: FoundItem[];
  currentOrg: Organization | null;
  onOpenRegisterModal: () => void;
  onSelectFoundItem?: (item: FoundItem) => void;
}

export const AdminFoundItems: React.FC<AdminFoundItemsProps> = ({
  foundItems,
  currentOrg,
  onOpenRegisterModal,
  onSelectFoundItem,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);

  const categories = Array.from(new Set(foundItems.map((i) => i.category).filter(Boolean)));

  const filteredItems = foundItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>Facility Custody Ledger</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Found Items Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time catalog of items in physical vault custody across connected facilities.
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Intake New Found Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by title, description, brand, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="in_custody">In Custody</option>
            <option value="potential_match">Potential Match</option>
            <option value="awaiting_verification">Awaiting Verification</option>
            <option value="ready_for_dispatch">Ready for Dispatch</option>
            <option value="released">Released / Claimed</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer"
          >
            {/* Image Preview */}
            <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                  item.status === 'released'
                    ? 'bg-emerald-600/90 text-white'
                    : item.status === 'potential_match'
                    ? 'bg-blue-600/90 text-white'
                    : 'bg-slate-900/80 text-white'
                }`}>
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="absolute bottom-2.5 right-2.5">
                <span className="px-2 py-0.5 rounded bg-white/90 text-slate-800 font-mono text-[10px] font-bold shadow-xs">
                  {item.custodyLocker || 'Vault'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="uppercase font-semibold tracking-wider">{item.category}</span>
                  <span>{new Date(item.foundAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Turned-in at:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[170px]">{item.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Brand / Color:</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {item.brand || 'Unbranded'} • {item.color}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No items match your search</h4>
          <p className="text-xs text-slate-500 mt-1">Try adjusting the filter or search query</p>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                  Custodial Record Details
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={selectedItem.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Intake Notes
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedItem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Locker Location</span>
                  <span className="font-bold text-slate-800">{selectedItem.custodyLocker || 'Vault B-14'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Custody Officer</span>
                  <span className="font-bold text-slate-800">{selectedItem.custodianOfficer || 'Rajesh Sharma'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Brand / Model</span>
                  <span className="font-bold text-slate-800">{selectedItem.brand || 'Unbranded'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Serial / Asset Tag</span>
                  <span className="font-bold text-slate-800">{selectedItem.serialNumber || 'SN-NA'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
