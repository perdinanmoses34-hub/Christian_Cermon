import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Lock,
  Unlock,
  Key,
  Calendar,
  Trash2,
  UserX,
  UserCheck,
  Crown,
  Search,
  Filter,
  Save,
  Check,
  Building2,
  MessageCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { User, FeatureLocks, PaymentInfo } from '../types/sermon';
import {
  fetchAdminUsersApi,
  updateAdminUserApi,
  deleteAdminUserApi,
  fetchAdminSettingsApi,
  updateAdminSettingsApi,
} from '../services/api';

interface SuperadminPanelProps {
  currentUser: User;
  onBackToApp: () => void;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

export const SuperadminPanel: React.FC<SuperadminPanelProps> = ({
  currentUser,
  onBackToApp,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'locks' | 'payments'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [featureLocks, setFeatureLocks] = useState<FeatureLocks>({
    aiSermonGeneration: false,
    powerPointExport: true,
    scholarlyCommentary: true,
    sermonAiAssistant: true,
    tolakiBible: false,
    unlimitedSermons: true,
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '8220193812',
    accountHolder: 'Yayasan Pelayanan Khotbah Kristen',
    whatsappContact: '6281234567890',
    monthlyPrice: 'Rp 49.000 / bulan',
    yearlyPrice: 'Rp 399.000 / tahun',
  });

  const [loading, setLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState<string>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Load initial admin data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, settingsData] = await Promise.all([
        fetchAdminUsersApi(),
        fetchAdminSettingsApi(),
      ]);
      setUsers(usersData);
      setFeatureLocks(settingsData.feature_locks);
      setPaymentInfo(settingsData.payment_info);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleToggleUserActive = async (user: User) => {
    if (user.id === 'user-superadmin') {
      showToast('Akun superadmin tidak dapat dinonaktifkan.', 'info');
      return;
    }
    const newStatus = !(user.is_active !== false);
    try {
      const updated = await updateAdminUserApi(user.id, { is_active: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showToast(
        newStatus ? `Akun ${user.name} telah diaktifkan kembali.` : `Akun ${user.name} telah dinonaktifkan.`
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status akun', 'info');
    }
  };

  const handleToggleSubscription = async (user: User) => {
    const isCurrentlyPremium = user.subscription_status === 'premium';
    const newStatus = isCurrentlyPremium ? 'free' : 'premium';
    const newExpiresAt = isCurrentlyPremium
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const updated = await updateAdminUserApi(user.id, {
        subscription_status: newStatus,
        subscription_expires_at: newExpiresAt,
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showToast(`Status langganan ${user.name} diubah menjadi ${newStatus.toUpperCase()}.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah langganan', 'info');
    }
  };

  const handleExtendValidity = async (userId: string, days: number | 'unlimited') => {
    let expiresAt: string | null = null;
    if (days === 'unlimited') {
      expiresAt = null;
    } else {
      const user = users.find((u) => u.id === userId);
      const baseDate = user?.subscription_expires_at
        ? new Date(user.subscription_expires_at)
        : new Date();
      const startTime = baseDate.getTime() > Date.now() ? baseDate.getTime() : Date.now();
      expiresAt = new Date(startTime + days * 24 * 60 * 60 * 1000).toISOString();
    }

    try {
      const updated = await updateAdminUserApi(userId, {
        subscription_status: 'premium',
        subscription_expires_at: expiresAt,
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setEditingUserId(null);
      showToast(
        days === 'unlimited'
          ? 'Masa aktif diatur ke Permanen (Unlimited).'
          : `Masa aktif berhasil diperpanjang +${days} hari.`
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal memperpanjang masa aktif', 'info');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === 'user-superadmin') {
      showToast('Akun superadmin tidak dapat dihapus.', 'info');
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus permanen akun "${user.name}"? Seluruh data khotbah pengguna ini akan terhapus.`)) {
      return;
    }

    try {
      await deleteAdminUserApi(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast(`Akun ${user.name} berhasil dihapus permanen.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus pengguna', 'info');
    }
  };

  // Feature Lock Actions
  const handleToggleLock = async (featureKey: keyof FeatureLocks) => {
    const updatedLocks = {
      ...featureLocks,
      [featureKey]: !featureLocks[featureKey],
    };
    setFeatureLocks(updatedLocks);
    try {
      await updateAdminSettingsApi({ feature_locks: updatedLocks });
      showToast(`Pengaturan kunci menu berhasil diperbarui.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengaturan', 'info');
    }
  };

  // Save Payment Info
  const handleSavePaymentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminSettingsApi({ payment_info: paymentInfo });
      showToast('Informasi pembayaran dan nomor WhatsApp berhasil disimpan.');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data rekening', 'info');
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !userSearchQuery.trim() ||
        (u.name && u.name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
        (u.username && u.username.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
        (u.church_name && u.church_name.toLowerCase().includes(userSearchQuery.toLowerCase()));

      let matchStatus = true;
      if (userFilterStatus === 'premium') matchStatus = u.subscription_status === 'premium';
      if (userFilterStatus === 'free') matchStatus = u.subscription_status === 'free';
      if (userFilterStatus === 'inactive') matchStatus = u.is_active === false;

      return matchSearch && matchStatus;
    });
  }, [users, userSearchQuery, userFilterStatus]);

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const premium = users.filter((u) => u.subscription_status === 'premium').length;
    const inactive = users.filter((u) => u.is_active === false).length;
    const free = users.filter((u) => u.subscription_status === 'free' || !u.subscription_status).length;
    return { total, premium, inactive, free };
  }, [users]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-4 sm:space-y-8 animate-fadeIn pb-safe md:pb-8">
      {/* Top Banner / Android App Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center justify-between sm:justify-start gap-2 mb-2">
            <button
              onClick={onBackToApp}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] sm:text-xs font-bold">
              <Key className="w-3 h-3" />
              Superadmin Control Center
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif-title font-bold text-white tracking-tight flex items-center gap-2">
            Panel Kendali Superadmin
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-sans font-bold">
              tn.timbu
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Kelola seluruh akun pengguna, atur masa aktif dan langganan, serta tentukan menu-menu yang dikunci / harus berlangganan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onBackToApp}
            className="flex-1 sm:flex-initial px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-3.5 h-3.5 hidden sm:inline" />
            <span>Kembali ke Aplikasi</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pengguna</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-800">Berlangganan</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-0.5">{stats.premium}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Pengguna Gratis</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-700 mt-0.5">{stats.free}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-stone-100 text-slate-600 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-600">Dinonaktifkan</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600 mt-0.5">{stats.inactive}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <UserX className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Horizontal scroll on mobile */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors active:scale-95 ${
            activeTab === 'users'
              ? 'bg-slate-900 text-amber-400 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Pengguna ({stats.total})</span>
        </button>

        <button
          onClick={() => setActiveTab('locks')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors active:scale-95 ${
            activeTab === 'locks'
              ? 'bg-slate-900 text-amber-400 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Kunci Menu & Berlangganan</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors active:scale-95 ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-amber-400 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Rekening & WhatsApp</span>
        </button>
      </div>

      {/* Tab 1: Manajemen Pengguna */}
      {activeTab === 'users' && (
        <div className="space-y-3.5 sm:space-y-4">
          {/* Filter and search bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Cari nama, email, username, atau gereja..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
              />
            </div>

            <select
              value={userFilterStatus}
              onChange={(e) => setUserFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
            >
              <option value="all">Semua Status</option>
              <option value="premium">Hanya Berlangganan (Premium)</option>
              <option value="free">Hanya Gratis (Free)</option>
              <option value="inactive">Hanya yang Dinonaktifkan</option>
            </select>
          </div>

          {/* Mobile User Cards List (Android friendly) */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-slate-400 text-xs">
                Tidak ada pengguna yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSuperadmin = user.role === 'superadmin' || user.username === 'tn.timbu';
                const isPremium = user.subscription_status === 'premium';
                const isActive = user.is_active !== false;
                const isEditingThisUser = editingUserId === user.id;

                let validityText = 'Tidak terbatas (Permanen)';
                if (user.subscription_expires_at) {
                  const expDate = new Date(user.subscription_expires_at);
                  const isExpired = expDate.getTime() < Date.now();
                  validityText = isExpired
                    ? `Kedaluwarsa (${expDate.toLocaleDateString('id-ID')})`
                    : `Sampai ${expDate.toLocaleDateString('id-ID')}`;
                }

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSuperadmin
                              ? 'bg-slate-900 text-amber-400'
                              : 'bg-stone-100 text-slate-700'
                          }`}
                        >
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 truncate">
                            <span className="truncate">{user.name}</span>
                            {isSuperadmin && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[8px] font-black uppercase shrink-0">
                                SUPERADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.email} {user.username ? `(@${user.username})` : ''}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            {user.church_name || 'Gereja Kristen'}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isPremium
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-stone-100 text-slate-600 border border-stone-200'
                          }`}
                        >
                          {isPremium && <Crown className="w-2.5 h-2.5 text-amber-600" />}
                          {isPremium ? 'PREMIUM' : 'GRATIS'}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Dinonaktifkan'}
                        </span>
                      </div>
                    </div>

                    {/* Validity Info */}
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Masa Aktif: <strong>{validityText}</strong></span>
                      </span>

                      {!isSuperadmin && (
                        <button
                          onClick={() => setEditingUserId(isEditingThisUser ? null : user.id)}
                          className="text-[10px] font-bold text-amber-800 hover:text-amber-900 underline shrink-0 ml-1"
                        >
                          {isEditingThisUser ? 'Tutup' : 'Atur'}
                        </button>
                      )}
                    </div>

                    {/* Quick Validity Modifier */}
                    {isEditingThisUser && (
                      <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 space-y-2">
                        <p className="text-[10px] font-bold text-amber-950 uppercase">Perpanjang Masa Aktif:</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => handleExtendValidity(user.id, 7)}
                            className="py-1.5 px-2 bg-white border border-amber-300 rounded-lg text-[10px] font-bold text-amber-950 active:scale-95"
                          >
                            +7 Hari
                          </button>
                          <button
                            onClick={() => handleExtendValidity(user.id, 30)}
                            className="py-1.5 px-2 bg-white border border-amber-300 rounded-lg text-[10px] font-bold text-amber-950 active:scale-95"
                          >
                            +30 Hari (1 Bulan)
                          </button>
                          <button
                            onClick={() => handleExtendValidity(user.id, 365)}
                            className="py-1.5 px-2 bg-white border border-amber-300 rounded-lg text-[10px] font-bold text-amber-950 active:scale-95"
                          >
                            +1 Tahun
                          </button>
                          <button
                            onClick={() => handleExtendValidity(user.id, 'unlimited')}
                            className="py-1.5 px-2 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-bold active:scale-95"
                          >
                            Permanen (Tanpa Batas)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => handleToggleSubscription(user)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-colors text-center active:scale-95 ${
                          isPremium
                            ? 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {isPremium ? 'Set Gratis' : 'Set Premium'}
                      </button>

                      {!isSuperadmin && (
                        <button
                          onClick={() => handleToggleUserActive(user)}
                          className={`py-1.5 px-3 rounded-xl text-[10px] font-bold transition-colors active:scale-95 ${
                            isActive
                              ? 'bg-stone-100 text-slate-600 hover:text-red-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}

                      {!isSuperadmin && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 active:scale-95"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Users Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Pengguna</th>
                    <th className="py-3.5 px-4">Gereja / Institusi</th>
                    <th className="py-3.5 px-4">Langganan</th>
                    <th className="py-3.5 px-4">Masa Aktif</th>
                    <th className="py-3.5 px-4">Status Akun</th>
                    <th className="py-3.5 px-4 text-right">Aksi Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        Tidak ada pengguna yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSuperadmin = user.role === 'superadmin' || user.username === 'tn.timbu';
                      const isPremium = user.subscription_status === 'premium';
                      const isActive = user.is_active !== false;
                      const isEditingThisUser = editingUserId === user.id;

                      let validityText = 'Tidak terbatas (Permanen)';
                      if (user.subscription_expires_at) {
                        const expDate = new Date(user.subscription_expires_at);
                        const isExpired = expDate.getTime() < Date.now();
                        validityText = isExpired
                          ? `Kedaluwarsa (${expDate.toLocaleDateString('id-ID')})`
                          : `Sampai ${expDate.toLocaleDateString('id-ID')}`;
                      }

                      return (
                        <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                          {/* Name & Email */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isSuperadmin
                                    ? 'bg-slate-900 text-amber-400'
                                    : 'bg-stone-100 text-slate-700'
                                }`}
                              >
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {isSuperadmin && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-black uppercase">
                                      SUPERADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {user.email} {user.username ? `(@${user.username})` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Church */}
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {user.church_name || 'Gereja Kristen'}
                          </td>

                          {/* Subscription */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isPremium
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-stone-100 text-slate-600 border border-stone-200'
                              }`}
                            >
                              {isPremium && <Crown className="w-3 h-3 text-amber-600" />}
                              {isPremium ? 'PREMIUM' : 'GRATIS'}
                            </span>
                          </td>

                          {/* Validity / Expired date */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {validityText}
                              </span>

                              {/* Quick Edit Validity trigger */}
                              {!isSuperadmin && (
                                <button
                                  onClick={() => setEditingUserId(isEditingThisUser ? null : user.id)}
                                  className="text-[10px] text-amber-800 hover:text-amber-900 underline block font-semibold cursor-pointer"
                                >
                                  {isEditingThisUser ? 'Tutup Atur Masa Aktif' : 'Atur Masa Aktif'}
                                </button>
                              )}

                              {/* Sub-form to change validity */}
                              {isEditingThisUser && (
                                <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 mt-2 space-y-2">
                                  <p className="text-[10px] font-bold text-amber-950 uppercase">Perpanjang Masa Aktif:</p>
                                  <div className="flex flex-wrap gap-1">
                                    <button
                                      onClick={() => handleExtendValidity(user.id, 7)}
                                      className="px-2 py-1 bg-white border border-amber-300 rounded text-[10px] font-bold hover:bg-amber-100 text-amber-950 cursor-pointer"
                                    >
                                      +7 Hari
                                    </button>
                                    <button
                                      onClick={() => handleExtendValidity(user.id, 30)}
                                      className="px-2 py-1 bg-white border border-amber-300 rounded text-[10px] font-bold hover:bg-amber-100 text-amber-950 cursor-pointer"
                                    >
                                      +30 Hari (1 Bulan)
                                    </button>
                                    <button
                                      onClick={() => handleExtendValidity(user.id, 365)}
                                      className="px-2 py-1 bg-white border border-amber-300 rounded text-[10px] font-bold hover:bg-amber-100 text-amber-950 cursor-pointer"
                                    >
                                      +1 Tahun
                                    </button>
                                    <button
                                      onClick={() => handleExtendValidity(user.id, 'unlimited')}
                                      className="px-2 py-1 bg-amber-500 text-slate-950 rounded text-[10px] font-bold hover:bg-amber-400 cursor-pointer"
                                    >
                                      Permanen
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Account Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {isActive ? 'Aktif' : 'Dinonaktifkan'}
                            </span>
                          </td>

                          {/* Admin Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Premium */}
                              <button
                                onClick={() => handleToggleSubscription(user)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                  isPremium
                                    ? 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                }`}
                                title={isPremium ? 'Ubah ke Free' : 'Jadikan Premium'}
                              >
                                {isPremium ? 'Set Gratis' : 'Set Premium'}
                              </button>

                              {/* Toggle Active / Suspend */}
                              {!isSuperadmin && (
                                <button
                                  onClick={() => handleToggleUserActive(user)}
                                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                    isActive
                                      ? 'bg-stone-100 hover:bg-red-50 text-slate-600 hover:text-red-700'
                                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                  }`}
                                  title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                >
                                  {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              {/* Delete User */}
                              {!isSuperadmin && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-slate-400 hover:text-red-700 transition-colors cursor-pointer"
                                  title="Hapus Pengguna"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Penguncian Fitur & Menu Berbayar */}
      {activeTab === 'locks' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-4 sm:p-8 shadow-2xs space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif-title text-slate-900">
              Pengaturan Kunci Menu & Akses Berlangganan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Aktifkan sakelar kunci di bawah ini untuk mewajibkan pengguna berlangganan (Premium) sebelum dapat membuka menu tersebut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Feature 1: PowerPoint Export */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Download PowerPoint (.PPTX)
                  </h4>
                  {featureLocks.powerPointExport && (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                      Terkunci
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Pengguna gratis harus berlangganan untuk mendownload file slide presentasi .PPTX asli.
                </p>
              </div>
              <button
                onClick={() => handleToggleLock('powerPointExport')}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  featureLocks.powerPointExport ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    featureLocks.powerPointExport ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Feature 2: Scholarly Commentary */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Menu Tafsiran Pakar Kredibel
                  </h4>
                  {featureLocks.scholarlyCommentary && (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                      Terkunci
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Mengunci kumpulan catatan tafsiran Matthew Henry, John Calvin, Albert Barnes, dll.
                </p>
              </div>
              <button
                onClick={() => handleToggleLock('scholarlyCommentary')}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  featureLocks.scholarlyCommentary ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    featureLocks.scholarlyCommentary ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Feature 3: AI Assistant in Editor */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    AI Sermon Assistant di Editor
                  </h4>
                  {featureLocks.sermonAiAssistant && (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                      Terkunci
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Kolom editor khotbah untuk bantuan penyempurnaan teks dan ilustrasi.
                </p>
              </div>
              <button
                onClick={() => handleToggleLock('sermonAiAssistant')}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  featureLocks.sermonAiAssistant ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    featureLocks.sermonAiAssistant ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Feature 4: AI Sermon Generator */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Pembuatan Khotbah AI (Wizard)
                  </h4>
                  {featureLocks.aiSermonGeneration && (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                      Terkunci
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Hanya pengguna Berlangganan yang dapat membuat naskah khotbah baru dengan AI.
                </p>
              </div>
              <button
                onClick={() => handleToggleLock('aiSermonGeneration')}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  featureLocks.aiSermonGeneration ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    featureLocks.aiSermonGeneration ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Feature 5: Tolaki Bible */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Alkitab Bahasa Daerah Tolaki
                  </h4>
                  {featureLocks.tolakiBible && (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                      Terkunci
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Mewajibkan pengguna berlangganan untuk melihat firman versi bahasa daerah Tolaki.
                </p>
              </div>
              <button
                onClick={() => handleToggleLock('tolakiBible')}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  featureLocks.tolakiBible ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    featureLocks.tolakiBible ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Feature 6: Unlimited Sermons Limit */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Batas Maksimal Draf (Free Max 3)
                  </h4>
                  {featureLocks.unlimitedSermons && (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                      Terkunci
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Pengguna gratis dibatasi maksimal 3 khotbah, kecuali berlangganan Premium.
                </p>
              </div>
              <button
                onClick={() => handleToggleLock('unlimitedSermons')}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  featureLocks.unlimitedSermons ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    featureLocks.unlimitedSermons ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pengaturan Pembayaran & WhatsApp */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSavePaymentInfo} className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-4 sm:p-8 shadow-2xs space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif-title text-slate-900">
              Informasi Rekening Bank & WhatsApp Admin
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Data ini akan muncul secara otomatis kepada pengguna saat mereka mencoba membuka menu yang dikunci atau ingin berlangganan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Nama Bank
              </label>
              <input
                type="text"
                value={paymentInfo.bankName}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, bankName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={paymentInfo.accountNumber}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, accountNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Atas Nama Rekening
              </label>
              <input
                type="text"
                value={paymentInfo.accountHolder}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, accountHolder: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Nomor WhatsApp Admin (Aktivasi / Konfirmasi)
              </label>
              <input
                type="text"
                value={paymentInfo.whatsappContact}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, whatsappContact: e.target.value })}
                placeholder="Contoh: 6281234567890"
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Tarif Paket Bulanan
              </label>
              <input
                type="text"
                value={paymentInfo.monthlyPrice}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, monthlyPrice: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Tarif Paket Tahunan
              </label>
              <input
                type="text"
                value={paymentInfo.yearlyPrice}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, yearlyPrice: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Rekening & Kontak</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
