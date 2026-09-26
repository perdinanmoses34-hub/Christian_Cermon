import React from 'react';
import { BookOpen, Sparkles, Plus, Library, LogOut, User as UserIcon, LayoutDashboard, ChevronDown } from 'lucide-react';
import { User } from '../types/sermon';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: 'landing' | 'dashboard' | 'create' | 'history') => void;
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

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
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

        {/* Navigation items */}
        {currentUser ? (
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === 'dashboard'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('create')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === 'create'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold shadow-sm'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Buat Khotbah Baru
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === 'history'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Library className="w-4 h-4" />
              Khotbah Saya
            </button>
            <button
              onClick={onOpenHowItWorks}
              className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cara Kerja
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenHowItWorks}
              className="text-sm text-slate-300 hover:text-white px-3 py-2 font-medium"
            >
              Lihat Cara Kerja
            </button>
            <button
              onClick={onOpenAuth}
              className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
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
                    onNavigate('history');
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Library className="w-4 h-4 text-slate-400" />
                  Koleksi Khotbah Saya
                </button>
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
