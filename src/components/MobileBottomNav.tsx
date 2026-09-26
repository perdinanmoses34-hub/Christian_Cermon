import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Sparkles,
  Library,
  ShieldAlert,
} from 'lucide-react';
import { User } from '../types/sermon';

interface MobileBottomNavProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: 'landing' | 'dashboard' | 'create' | 'history' | 'bible' | 'commentary' | 'superadmin') => void;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
}) => {
  // Hide bottom nav during sermon editing to give full workspace to preacher
  if (currentView === 'editor') {
    return null;
  }

  const isSuperadmin = currentUser?.role === 'superadmin' || currentUser?.username === 'tn.timbu';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-white md:hidden shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1.5 max-w-lg mx-auto">
        {/* Tab 1: Home / Dashboard */}
        <button
          onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group active:scale-95 transition-transform"
        >
          <div
            className={`px-3 py-1 rounded-full transition-colors ${
              currentView === 'dashboard' || currentView === 'landing'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              currentView === 'dashboard' || currentView === 'landing'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 font-medium'
            }`}
          >
            Home
          </span>
        </button>

        {/* Tab 2: Alkitab 3-Versi */}
        <button
          onClick={() => onNavigate('bible')}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group active:scale-95 transition-transform"
        >
          <div
            className={`px-3 py-1 rounded-full transition-colors ${
              currentView === 'bible'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              currentView === 'bible' ? 'text-amber-400 font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            Alkitab
          </span>
        </button>

        {/* Center Floating Action Button: Buat Khotbah */}
        <div className="flex items-center justify-center -mt-6 px-1">
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else onNavigate('create');
            }}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 flex items-center justify-center border-4 border-slate-950 active:scale-90 transition-transform"
            aria-label="Buat Khotbah Baru"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 4: Tafsiran Pakar */}
        <button
          onClick={() => onNavigate('commentary')}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group active:scale-95 transition-transform"
        >
          <div
            className={`px-3 py-1 rounded-full transition-colors ${
              currentView === 'commentary'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              currentView === 'commentary' ? 'text-amber-400 font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            Tafsiran
          </span>
        </button>

        {/* Tab 5: Koleksi Khotbah or Admin Panel */}
        {isSuperadmin ? (
          <button
            onClick={() => onNavigate('superadmin')}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group active:scale-95 transition-transform"
          >
            <div
              className={`px-3 py-1 rounded-full transition-colors ${
                currentView === 'superadmin'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-amber-400/80 group-hover:text-amber-300'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                currentView === 'superadmin' ? 'text-amber-400 font-bold' : 'text-amber-400/90 font-medium'
              }`}
            >
              Admin
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else onNavigate('history');
            }}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group active:scale-95 transition-transform"
          >
            <div
              className={`px-3 py-1 rounded-full transition-colors ${
                currentView === 'history'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              <Library className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                currentView === 'history' ? 'text-amber-400 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              Koleksi
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
