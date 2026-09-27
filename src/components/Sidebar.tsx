import React from 'react';
import {
  Sparkles,
  LayoutGrid,
  Package,
  Crosshair,
  Compass,
  FileText,
  Boxes,
  CheckCircle2,
  Building2,
  HelpCircle,
  PlusCircle,
  Truck,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';

export type UserViewTab = 'dashboard' | 'my-lost-items' | 'potential-matches' | 'verification-delivery' | 'discovery-hub';
export type AdminViewTab = 'overview' | 'found-items' | 'lost-reports' | 'ai-matches' | 'verifications' | 'deliveries' | 'connected-orgs';

interface SidebarProps {
  currentRole: 'user' | 'admin';
  userTab: UserViewTab;
  adminTab: AdminViewTab;
  onSelectUserTab: (tab: UserViewTab) => void;
  onSelectAdminTab: (tab: AdminViewTab) => void;
  onOpenReportModal: () => void;
  onOpenRegisterModal: () => void;
  pendingMatchesCount: number;
  pendingVerificationsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  userTab,
  adminTab,
  onSelectUserTab,
  onSelectAdminTab,
  onOpenReportModal,
  onOpenRegisterModal,
  pendingMatchesCount,
  pendingVerificationsCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleSelectUser = (tab: UserViewTab) => {
    onSelectUserTab(tab);
    onCloseMobile?.();
  };

  const handleSelectAdmin = (tab: AdminViewTab) => {
    onSelectAdminTab(tab);
    onCloseMobile?.();
  };

  const handleReport = () => {
    onOpenReportModal();
    onCloseMobile?.();
  };

  const handleRegister = () => {
    onOpenRegisterModal();
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200/80 shadow-[0_1px_12px_rgba(15,23,42,0.04)] z-50 flex flex-col justify-between overflow-hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Branding */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 shrink-0">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => handleSelectUser('dashboard')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Sparkles className="w-4 h-4 text-blue-100" />
              </div>
              <div className="flex items-baseline">
                <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight">
                  FindBack<span className="text-blue-600 ml-0.5">AI</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {currentRole === 'admin' ? (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px] tracking-wider uppercase border border-blue-200/60">
                  Enterprise
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px] tracking-wider uppercase border border-slate-200/60">
                  Portal
                </span>
              )}

              {/* Close button for mobile */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="px-4 py-3 shrink-0">
            {currentRole === 'user' ? (
              <button
                onClick={handleReport}
                className="group w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.22)] hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-200" />
                  <span className="text-sm font-bold tracking-tight">Report Lost Item</span>
                </div>
                <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleRegister}
                className="group w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md hover:from-slate-800 hover:to-indigo-900 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-blue-300" />
                  <span className="text-sm font-bold tracking-tight">Register Found Item</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-75 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 mt-1 flex-1 overflow-y-auto">
            {currentRole === 'user' ? (
              <>
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  User Workspace
                </div>
                <button
                  onClick={() => handleSelectUser('dashboard')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    userTab === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleSelectUser('my-lost-items')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    userTab === 'my-lost-items'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>My Lost Items</span>
                </button>

                <button
                  onClick={() => handleSelectUser('potential-matches')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    userTab === 'potential-matches'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Crosshair className="w-4 h-4 text-indigo-600" />
                    <span>Potential Matches</span>
                  </div>
                  {pendingMatchesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono">
                      {pendingMatchesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectUser('verification-delivery')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    userTab === 'verification-delivery'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verification & Delivery</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>

                <button
                  onClick={() => handleSelectUser('discovery-hub')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    userTab === 'discovery-hub'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-4 h-4 text-slate-500" />
                  <span>Public Registry</span>
                </button>
              </>
            ) : (
              <>
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Command Ops
                </div>
                <button
                  onClick={() => handleSelectAdmin('overview')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'overview'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  <span>Command Center</span>
                </button>

                <button
                  onClick={() => handleSelectAdmin('found-items')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'found-items'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span>Found Custody</span>
                </button>

                <button
                  onClick={() => handleSelectAdmin('lost-reports')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'lost-reports'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Lost Reports</span>
                </button>

                <button
                  onClick={() => handleSelectAdmin('ai-matches')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'ai-matches'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Matches</span>
                  </div>
                  {pendingMatchesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                      {pendingMatchesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectAdmin('verifications')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'verifications'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Verification Requests</span>
                  </div>
                  {pendingVerificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold font-mono">
                      {pendingVerificationsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectAdmin('deliveries')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'deliveries'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Deliveries & Vault</span>
                </button>

                <button
                  onClick={() => handleSelectAdmin('connected-orgs')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    adminTab === 'connected-orgs'
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Connected Orgs</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Bottom Network & System Diagnostic Widget */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-2 bg-slate-50/60 shrink-0">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Vercel Serverless Mesh
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                PROD-READY
              </span>
            </div>
            
            {/* System Diagnostics Grid */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
              <div className="flex items-center gap-1 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Frontend: <strong className="text-slate-900 font-semibold">Active</strong></span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>API: <strong className="text-slate-900 font-semibold">Connected</strong></span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>DB: <strong className="text-slate-900 font-semibold">Connected</strong></span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Gemini: <strong className="text-blue-700 font-semibold">Configured</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-xs px-1">
            <span className="flex items-center gap-1.5 text-[11px]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Multi-Venue Radar</span>
            </span>
            <span className="font-mono text-[10px] text-blue-600 font-bold">Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
