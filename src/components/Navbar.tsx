import React from 'react';
import { BookOpen, Sparkles, Plus, Library, LogOut, User as UserIcon, LayoutDashboard, ChevronDown, Key } from 'lucide-react';
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
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const isSuperadmin = currentUser?.role === 'superadmin' || currentUser?.username === 'tn.timbu';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-cinzel font-bold text-sm sm:text-lg tracking-wider text-white">
                <span className="hidden sm:inline">CHRISTIAN </span>SERMON
              </span>
              <span className="text-[10px] sm:text-xs font-semibold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 tracking-wider">
                AI
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-light tracking-wide -mt-0.5">
              Sistematis • Alkitabiah • Relevan
            </p>
          </div>
        </div>

        {/* Navigation items */}
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
              Buat Khotbah Baru
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
              Alkitab (TB/KJV/Tolaki)
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
                Panel Superadmin
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('bible')}
              className="hidden sm:flex text-xs text-slate-300 hover:text-white px-3 py-2 font-medium items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Alkitab 3-Versi
            </button>
            <button
              onClick={() => onNavigate('commentary')}
              className="hidden sm:flex text-xs text-slate-300 hover:text-white px-3 py-2 font-medium items-center gap-1.5"
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
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Masuk / Mulai
            </button>
          </div>
        )}

        {/* User profile dropdown if logged in */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 line-clamp-1 max-w-[120px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-amber-400/90 line-clamp-1 max-w-[120px]">
                  {currentUser.church_name || 'Pelayan Firman'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-slate-200">
                <div className="px-4 py-2.5 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('dashboard');
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  Dashboard Khotbah
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('create');
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5 text-amber-400 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Buat Khotbah Baru
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('bible');
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Alkitab (TB / KJV / Tolaki)
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('commentary');
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Tafsiran Pakar Kredibel
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('history');
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Library className="w-4 h-4 text-slate-400" />
                  Koleksi Khotbah Saya
                </button>
                {isSuperadmin && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('superadmin');
                    }}
                    className="w-full text-left px-4 py-2 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold flex items-center gap-2.5 border-t border-b border-amber-500/20"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    Panel Superadmin
                  </button>
                )}
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
