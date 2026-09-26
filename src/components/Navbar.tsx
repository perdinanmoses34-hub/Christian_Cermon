import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Library,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  ChevronDown,
  Key,
  ArrowLeft,
  X,
  HelpCircle,
  Menu,
} from 'lucide-react';
import { User } from '../types/sermon';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: 'landing' | 'dashboard' | 'create' | 'history' | 'bible' | 'commentary' | 'superadmin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenHowItWorks: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
  onLogout,
  onOpenHowItWorks,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isSuperadmin = currentUser?.role === 'superadmin' || currentUser?.username === 'tn.timbu';

  // In sermon editor, mobile uses unified Android App Bar inside SermonEditor
  if (currentView === 'editor') {
    return (
      <header className="hidden md:block sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 shrink-0">
              <BookOpen className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <span className="font-cinzel font-bold text-base tracking-wider text-white">
              CHRISTIAN SERMON <span className="text-xs text-amber-400 font-sans ml-1">AI</span>
            </span>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dashboard
          </button>
        </div>
      </header>
    );
  }

  // Get view title for mobile header
  const getViewTitle = () => {
    switch (currentView) {
      case 'create':
        return 'Buat Khotbah';
      case 'bible':
        return 'Alkitab 3-Versi';
      case 'commentary':
        return 'Tafsiran Pakar';
      case 'history':
        return 'Koleksi Khotbah';
      case 'superadmin':
        return 'Panel Superadmin';
      default:
        return 'Christian Sermon AI';
    }
  };

  const isSubView = ['create', 'bible', 'commentary', 'history', 'superadmin'].includes(currentView);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md safe-area-top w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 w-full min-w-0">
          {/* Mobile view: Android App Bar style */}
          <div className="flex md:hidden items-center gap-2 flex-1 min-w-0 overflow-hidden">
            {isSubView ? (
              <button
                onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-transform shrink-0"
                aria-label="Kembali"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div
                onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 shrink-0 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-950 font-bold" />
              </div>
            )}

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="font-semibold text-sm sm:text-base text-white truncate">
                {isSubView ? (
                  <span>{getViewTitle()}</span>
                ) : (
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="font-cinzel tracking-wider font-bold">SERMON</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      AI
                    </span>
                  </span>
                )}
              </div>
              {!isSubView && (
                <p className="text-[10px] text-slate-400 truncate">Sistematis • Alkitabiah</p>
              )}
            </div>
          </div>

          {/* Desktop Brand / Logo */}
          <div
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
            className="hidden md:flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-cinzel font-bold text-lg tracking-wider text-white">
                  CHRISTIAN SERMON
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light tracking-wide -mt-0.5">
                Sistematis • Alkitabiah • Relevan
              </p>
            </div>
          </div>

          {/* Desktop Navigation items */}
          {currentUser ? (
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'dashboard'
                    ? 'bg-slate-800 text-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('create')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'create'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-sm'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Buat Khotbah
              </button>
              <button
                onClick={() => onNavigate('bible')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'bible'
                    ? 'bg-slate-800 text-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Alkitab 3-Versi
              </button>
              <button
                onClick={() => onNavigate('commentary')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'commentary'
                    ? 'bg-slate-800 text-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Tafsiran Pakar
              </button>
              <button
                onClick={() => onNavigate('history')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'history'
                    ? 'bg-slate-800 text-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                Khotbah Saya
              </button>
              {isSuperadmin && (
                <button
                  onClick={() => onNavigate('superadmin')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    currentView === 'superadmin'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/40 hover:bg-amber-500/25'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Superadmin
                </button>
              )}
              <button
                onClick={onOpenHowItWorks}
                className="px-2.5 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cara Kerja
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onNavigate('bible')}
                className="text-xs text-slate-300 hover:text-white px-3 py-2 font-medium flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Alkitab 3-Versi
              </button>
              <button
                onClick={() => onNavigate('commentary')}
                className="text-xs text-slate-300 hover:text-white px-3 py-2 font-medium flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Tafsiran Pakar
              </button>
              <button
                onClick={onOpenHowItWorks}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-2"
              >
                Cara Kerja
              </button>
            </div>
          )}

          {/* Right Action: User Avatar / Login */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {currentUser ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 active:scale-95 transition-all text-left"
                aria-label="Profil Pengguna"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1 max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-amber-400/90 line-clamp-1 max-w-[110px]">
                    {currentUser.church_name || 'Pelayan Firman'}
                  </p>
                </div>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenHowItWorks}
                  className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                  aria-label="Panduan Aplikasi"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Android Mobile Bottom Drawer for User Account & Settings */}
      {showUserMenu && currentUser && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-start bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop Click to close */}
          <div className="flex-1" onClick={() => setShowUserMenu(false)} />

          {/* Drawer content: Bottom sheet on mobile, anchored dropdown on desktop */}
          <div className="w-full md:w-64 md:absolute md:right-4 md:top-16 bg-slate-900 border-t md:border border-slate-800 rounded-t-3xl md:rounded-2xl shadow-2xl p-4 md:p-3 text-slate-200 safe-area-bottom max-h-[85vh] overflow-y-auto">
            {/* Mobile Drag Handle */}
            <div className="md:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

            {/* User Profile Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-sm shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-amber-400/90 truncate">{currentUser.church_name || 'Pelayan Firman'}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1 text-sm md:text-xs">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('dashboard');
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-3 active:bg-slate-800"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard Khotbah</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('create');
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-3 text-amber-400 font-semibold active:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Khotbah Baru</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('bible');
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-3 active:bg-slate-800"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Alkitab (TB / KJV / Tolaki)</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('commentary');
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-3 active:bg-slate-800"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Tafsiran Pakar Kredibel</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('history');
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-3 active:bg-slate-800"
              >
                <Library className="w-4 h-4 text-slate-400" />
                <span>Koleksi Khotbah Saya</span>
              </button>

              {isSuperadmin && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('superadmin');
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold flex items-center gap-3 border border-amber-500/25 active:bg-amber-500/25"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Panel Superadmin</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenHowItWorks();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-3 text-slate-400 active:bg-slate-800"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Panduan & Cara Kerja</span>
              </button>

              <div className="my-2 border-t border-slate-800" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 flex items-center gap-3 font-semibold active:bg-rose-950/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
