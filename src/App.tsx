import React, { useState, useEffect } from 'react';
import {
  fetchUsers,
  fetchOrganizations,
  fetchLostItems,
  fetchFoundItems,
  fetchMatches,
  fetchVerifications,
  fetchDeliveries,
  resetDemoData,
} from './api.js';
import {
  User,
  Organization,
  LostItem,
  FoundItem,
  Match,
  Verification,
  DeliveryRecord,
} from './types/index.js';
import { Header } from './components/Header.js';
import { Sidebar, UserViewTab, AdminViewTab } from './components/Sidebar.js';
import { UserDashboard } from './views/UserDashboard.js';
import { UserPotentialMatches } from './views/UserPotentialMatches.js';
import { UserVerificationDelivery } from './views/UserVerificationDelivery.js';
import { ReportLostItemModal } from './views/ReportLostItemModal.js';
import { RegisterFoundItemModal } from './views/RegisterFoundItemModal.js';
import { AdminOverview } from './views/AdminOverview.js';
import { AdminFoundItems } from './views/AdminFoundItems.js';
import { AdminMatchReview } from './views/AdminMatchReview.js';
import { ConnectedOrganizations } from './views/ConnectedOrganizations.js';
import { Loader2, Sparkles, CheckCircle2, AlertCircle, PlusCircle, ChevronRight, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<'user' | 'admin'>('user');
  const [userTab, setUserTab] = useState<UserViewTab>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminViewTab>('overview');

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadAllData = async () => {
    try {
      const [u, o, l, f, m, v, d] = await Promise.all([
        fetchUsers(),
        fetchOrganizations(),
        fetchLostItems(),
        fetchFoundItems(),
        fetchMatches(),
        fetchVerifications(),
        fetchDeliveries(),
      ]);

      setUsers(u);
      if (!currentUser && u.length > 0) setCurrentUser(u[0]);
      setOrganizations(o);
      if (!currentOrg && o.length > 0) setCurrentOrg(o[0]);

      setLostItems(l);
      setFoundItems(f);
      setMatches(m);
      setVerifications(v);
      setDeliveries(d);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResetDemo = async () => {
    setIsLoading(true);
    try {
      await resetDemoData();
      await loadAllData();
      showToast('Demo data reloaded to initial state.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemReported = (item: LostItem, newMatches: Match[]) => {
    loadAllData();
    showToast(`Lost item reported & analyzed by Gemini! ${newMatches.length} match(es) detected.`);
  };

  const handleItemRegistered = (item: FoundItem, newMatches: Match[]) => {
    loadAllData();
    showToast(`Found item logged into custody! ${newMatches.length} match(es) detected.`);
  };

  const pendingMatchesCount = matches.filter(
    (m) => m.status === 'potential_match' || m.status === 'pending_verification'
  ).length;

  const pendingVerificationsCount = verifications.filter(
    (v) => v.status === 'submitted' || v.status === 'pending'
  ).length;

  if (isLoading && organizations.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 animate-pulse mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-800 font-display">Initializing FindBack AI...</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to multi-venue neural lost & found network</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          showToast(`Switched view to ${role === 'user' ? 'User Portal' : 'Organization Admin'}`);
        }}
        currentUser={currentUser}
        currentOrg={currentOrg}
        organizations={organizations}
        onOrgChange={(org) => {
          setCurrentOrg(org);
          showToast(`Switched active organization to ${org.name}`);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onResetDemo={handleResetDemo}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Container */}
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentRole}
          userTab={userTab}
          adminTab={adminTab}
          onSelectUserTab={setUserTab}
          onSelectAdminTab={setAdminTab}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          pendingMatchesCount={pendingMatchesCount}
          pendingVerificationsCount={pendingVerificationsCount}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 ml-0 lg:ml-72 p-4 sm:p-6 md:p-8 min-h-[calc(100vh-4rem)] max-w-full overflow-x-hidden">
          {currentRole === 'user' ? (
            /* USER ROLE VIEWS */
            <>
              {userTab === 'dashboard' && (
                <UserDashboard
                  lostItems={lostItems}
                  matches={matches}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  onSelectMatch={(matchId) => {
                    setSelectedMatchId(matchId);
                    setUserTab('potential-matches');
                  }}
                  onOpenDiscoveryHub={() => setUserTab('potential-matches')}
                />
              )}

              {userTab === 'my-lost-items' && (
                <div className="max-w-7xl mx-auto space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">My Lost Reports</h1>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Active claims continuously monitored across 1,420+ connected venues.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all self-start sm:self-auto active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Report Lost Item</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lostItems.map((item) => (
                      <div key={item.id} className="group rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute top-3 left-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                                item.status === 'recovered'
                                  ? 'bg-emerald-600 text-white'
                                  : item.status === 'matched'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 left-3 text-xs text-white truncate max-w-[200px]">
                              {item.location}
                            </div>
                          </div>

                          <div className="p-5">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span className="uppercase font-semibold tracking-wider text-[11px] text-blue-600">{item.brand || item.category}</span>
                              <span className="text-[11px]">{new Date(item.lostAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-mono">#{item.id.slice(-6)}</span>
                            <button
                              onClick={() => setUserTab('potential-matches')}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <span>View Matches</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userTab === 'potential-matches' && (
                <UserPotentialMatches
                  matches={matches}
                  verifications={verifications}
                  onOpenVerificationModal={(matchId) => {
                    setSelectedMatchId(matchId);
                    setUserTab('verification-delivery');
                  }}
                  onOpenDeliveryTracker={(matchId) => {
                    setSelectedMatchId(matchId);
                    setUserTab('verification-delivery');
                  }}
                />
              )}

              {userTab === 'verification-delivery' && (
                <UserVerificationDelivery
                  verifications={verifications}
                  deliveries={deliveries}
                  matches={matches}
                  selectedMatchId={selectedMatchId}
                  onRefreshData={loadAllData}
                />
              )}

              {userTab === 'discovery-hub' && (
                <div className="max-w-7xl mx-auto space-y-6">
                  <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-lg relative overflow-hidden border border-slate-800">
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-400/30">
                        <span>Federated Registry</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Public Discovery Hub</h1>
                      <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
                        Non-sensitive catalog entries turned into physical custody across Mumbai Stadium, Phoenix Mall, and TechFest 2026.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {foundItems.map((item) => (
                      <div key={item.id} className="group rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                In Vault
                              </span>
                            </div>
                            <div className="absolute bottom-2 left-2.5 text-xs text-white truncate max-w-[200px]">
                              {item.location}
                            </div>
                          </div>

                          <div className="p-4 sm:p-5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                              {item.category} · {item.brand || 'Unbranded'}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                          </div>
                        </div>

                        <div className="p-4 sm:p-5 pt-0">
                          <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Claim This Item</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ADMIN ROLE VIEWS */
            <>
              {adminTab === 'overview' && (
                <AdminOverview
                  currentOrg={currentOrg}
                  organizations={organizations}
                  foundItems={foundItems}
                  lostItems={lostItems}
                  matches={matches}
                  verifications={verifications}
                  onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                  onNavigateTab={(tab) => setAdminTab(tab)}
                />
              )}

              {adminTab === 'found-items' && (
                <AdminFoundItems
                  foundItems={foundItems}
                  currentOrg={currentOrg}
                  onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                />
              )}

              {adminTab === 'lost-reports' && (
                <div className="max-w-7xl mx-auto space-y-6">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold font-display text-slate-900">User Lost Reports Stream</h1>
                      <p className="text-xs text-slate-500 mt-1">
                        Claims submitted across the network with extracted Gemini AI semantic parameters.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lostItems.map((item) => (
                      <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Claim #{item.id.slice(-6)}
                            </span>
                            <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span>Reported at: {item.location}</span>
                          <button
                            onClick={() => setAdminTab('ai-matches')}
                            className="font-bold text-blue-600 hover:text-blue-700"
                          >
                            Review Matches →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminTab === 'ai-matches' && (
                <AdminMatchReview
                  matches={matches}
                  verifications={verifications}
                  onRefreshData={loadAllData}
                />
              )}

              {adminTab === 'verifications' && (
                <div className="max-w-7xl mx-auto space-y-6">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200">
                    <h1 className="text-2xl font-bold font-display text-slate-900">Ownership Verifications</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Blind challenge questions submitted by users for custodian adjudication.
                    </p>
                  </div>
                  <AdminMatchReview
                    matches={matches}
                    verifications={verifications}
                    onRefreshData={loadAllData}
                  />
                </div>
              )}

              {adminTab === 'deliveries' && (
                <div className="max-w-7xl mx-auto space-y-6">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200">
                    <h1 className="text-2xl font-bold font-display text-slate-900">Custodial Deliveries & Release</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Tracking OTP-authenticated handovers and simulated courier transit.
                    </p>
                  </div>
                  <UserVerificationDelivery
                    verifications={verifications}
                    deliveries={deliveries}
                    matches={matches}
                    selectedMatchId={matches[0]?.id}
                    onRefreshData={loadAllData}
                  />
                </div>
              )}

              {adminTab === 'connected-orgs' && (
                <ConnectedOrganizations
                  organizations={organizations}
                  currentOrg={currentOrg}
                  onSelectOrg={(org) => {
                    setCurrentOrg(org);
                    showToast(`Switched active venue to ${org.name}`);
                  }}
                  foundItems={foundItems}
                  lostItems={lostItems}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <ReportLostItemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        organizations={organizations}
        userId={currentUser?.id || 'usr-vijay-01'}
        onItemReported={handleItemReported}
      />

      <RegisterFoundItemModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        organizations={organizations}
        currentOrg={currentOrg}
        onItemRegistered={handleItemRegistered}
      />
    </div>
  );
}
