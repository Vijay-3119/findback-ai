import React from 'react';
import { Search, Bell, Shield, User as UserIcon, RefreshCw, Plus, Building2, ChevronDown } from 'lucide-react';
import { Organization, User } from '../types/index.js';

interface HeaderProps {
  currentRole: 'user' | 'admin';
  onRoleChange: (role: 'user' | 'admin') => void;
  currentUser: User | null;
  currentOrg: Organization | null;
  organizations: Organization[];
  onOrgChange: (org: Organization) => void;
  onOpenReportModal: () => void;
  onOpenRegisterModal: () => void;
  onResetDemo: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  currentUser,
  currentOrg,
  organizations,
  onOrgChange,
  onOpenReportModal,
  onOpenRegisterModal,
  onResetDemo,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(15,23,42,0.03)] z-40 flex items-center justify-between px-4 sm:px-6 transition-all">
      {/* Left: Mobile hamburger + Organization / Breadcrumb info */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {currentRole === 'admin' ? (
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition-colors">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 max-w-[110px] sm:max-w-none truncate">
                  {currentOrg?.name || 'Mumbai Stadium'}
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">{currentOrg?.location?.split(',')[0]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold font-mono hidden xs:inline">
                  #{currentOrg?.code || 'ST-MUM-04'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Dropdown list of connected organizations */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 hidden group-hover:block z-50 animate-in fade-in">
              <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Connected Organizations
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => onOrgChange(org)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                    currentOrg?.id === org.id
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{org.name}</div>
                    <div className="text-[10px] text-slate-500">{org.type}</div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600">{org.code}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Neural Radar</span> Active
            </span>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span className="font-medium text-slate-700 hidden md:inline">User Recovery Portal</span>
          </div>
        )}
      </div>

      {/* Center: Global Search Bar with ⌘K (Hidden on small mobile) */}
      <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-6">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              currentRole === 'admin'
                ? 'Search custody inventory, RFID tags, lockers...'
                : 'Search lost reports, claim IDs, or venues...'
            }
            className="w-full h-9 pl-9 pr-11 rounded-xl bg-slate-100/80 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all border border-slate-200/60 focus:border-blue-400"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 rounded bg-white text-slate-400 text-[10px] font-semibold border border-slate-200 pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Role Switcher & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          title="Reset Demo Data"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications Icon with Ping */}
        <div className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        {/* Role Toggle Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onRoleChange('user')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'user'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">User Portal</span>
            <span className="sm:hidden">User</span>
          </button>
          <button
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'admin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Quick Action Button */}
        {currentRole === 'user' ? (
          <button
            onClick={onOpenReportModal}
            className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </button>
        ) : (
          <button
            onClick={onOpenRegisterModal}
            className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Found</span>
          </button>
        )}

        {/* Profile Card */}
        <div className="flex items-center gap-2 pl-1">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {currentRole === 'admin' ? 'Rajesh Sharma' : currentUser?.name || 'Vijay Sharma'}
            </div>
            <div className="text-[10px] text-slate-500">
              {currentRole === 'admin' ? 'Chief Custodian' : 'Claimant'}
            </div>
          </div>
          <img
            src={
              currentRole === 'admin'
                ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt="Profile Avatar"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 shadow-xs"
          />
        </div>
      </div>
    </header>
  );
};
