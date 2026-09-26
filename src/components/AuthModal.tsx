import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Mail, Lock, User as UserIcon, Church, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import { User } from '../types/sermon';
import { setStoredUser, loginUserApi } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [churchName, setChurchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDemoLogin = () => {
    const demoUser: User = {
      id: 'user-demo-1',
      name: 'Pdt. David Christian',
      username: 'david.christian',
      email: 'david@gereja.id',
      church_name: 'Gereja Kristen Indonesia',
      role: 'user',
      subscription_status: 'free',
      subscription_expires_at: '2026-12-31T23:59:59.000Z',
      is_active: true,
    };
    setStoredUser(demoUser);
    onSuccess(demoUser);
    onClose();
  };

  const handleSuperadminQuickLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginUserApi({
        username: 'tn.timbu',
        email: 'tn.timbu@gereja.id',
        password: 'Eklesia_030918',
      });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk sebagai superadmin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isForgot) {
      if (!email) {
        setError('Harap masukkan alamat email / username Anda.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setResetSent(true);
      }, 700);
      return;
    }

    if (!email || !password) {
      setError('Harap isi email / username dan kata sandi.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUserApi({
        name,
        email,
        username: email,
        password,
        church_name: churchName,
      });

      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const googleUser: User = {
        id: 'user-google-demo',
        name: 'Pastor Samuel Siregar',
        email: 'pastor.samuel@gmail.com',
        church_name: 'Gereja Bethany',
        role: 'user',
      };
      setStoredUser(googleUser);
      setLoading(false);
      onSuccess(googleUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif-title font-bold text-white">
            {isForgot
              ? 'Atur Ulang Kata Sandi'
              : isRegister
              ? 'Daftar Akun Baru'
              : 'Masuk ke Akun Anda'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isForgot
              ? 'Masukkan email untuk menerima instruksi pemulihan kata sandi'
              : 'Akses seluruh koleksi khotbah dan presentasi PowerPoint Anda'}
          </p>
        </div>

        {/* Demo and Superadmin Login Quick Actions */}
        {!isForgot && (
          <div className="mb-4 space-y-2">
            {/* Superadmin Card */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-700/15 border border-amber-500/40 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Masuk Superadmin
                </p>
                <p className="text-[11px] text-slate-400">Username: <strong>tn.timbu</strong></p>
              </div>
              <button
                onClick={handleSuperadminQuickLogin}
                type="button"
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Masuk Superadmin</span>
              </button>
            </div>

            {/* Regular Demo User */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-300">Coba Cepat Pengguna Reguler</p>
                <p className="text-[11px] text-slate-400">Pdt. David Christian (GKI)</p>
              </div>
              <button
                onClick={handleDemoLogin}
                type="button"
                className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Masuk Demo
              </button>
            </div>
          </div>
        )}

        {/* Google Login Simulation */}
        {!isForgot && (
          <div className="mb-5">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              Lanjutkan dengan Akun Google
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-800" />
              <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider">Atau dengan Email</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {resetSent ? (
          <div className="text-center py-4">
            <p className="text-emerald-400 font-semibold text-sm mb-2">Email Pemulihan Terkirim!</p>
            <p className="text-xs text-slate-400 mb-4">
              Silakan periksa kotak masuk email Anda untuk petunjuk pengaturan ulang kata sandi.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setIsForgot(false);
              }}
              className="text-amber-400 hover:underline text-xs font-medium"
            >
              Kembali ke Halaman Masuk
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Pdt. Yohanes Setiawan"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isRegister ? 'Email' : 'Email atau Username'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRegister ? 'hamba@gereja.id' : 'tn.timbu atau hamba@gereja.id'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Gereja / Pelayanan (Opsional)</label>
                <div className="relative">
                  <Church className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    placeholder="Contoh: GKI Kebayoran Baru"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {!isForgot && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">Kata Sandi</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setIsForgot(true)}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : isForgot ? (
                <span>Kirim Tautan Pemulihan</span>
              ) : isRegister ? (
                <>
                  <span>Daftar Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Toggle */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {isForgot ? (
            <button
              type="button"
              onClick={() => setIsForgot(false)}
              className="text-amber-400 hover:underline font-medium"
            >
              Kembali ke Masuk Akun
            </button>
          ) : isRegister ? (
            <p>
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-amber-400 hover:underline font-semibold"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-amber-400 hover:underline font-semibold"
              >
                Daftar sekarang
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
