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
  const isSuperadmin = currentUser?.role === 'superadmin' || currentUser?.username === 'tn.timbu';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white md:hidden shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home / Dashboard */}
        <button
          onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
            currentView === 'dashboard' || currentView === 'landing'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        {/* Alkitab 3-Versi */}
        <button
          onClick={() => onNavigate('bible')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
            currentView === 'bible'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Alkitab</span>
        </button>

        {/* Center Prominent Action Button: Buat Khotbah */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else onNavigate('create');
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-900/40 flex items-center justify-center border-2 border-slate-900 active:scale-95 transition-transform"
            title="Buat Khotbah Baru"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tafsiran Pakar */}
        <button
          onClick={() => onNavigate('commentary')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
            currentView === 'commentary'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span>Tafsiran</span>
        </button>

        {/* Superadmin or Collection */}
        {isSuperadmin ? (
          <button
            onClick={() => onNavigate('superadmin')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
              currentView === 'superadmin'
                ? 'text-amber-400 font-bold'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5 text-amber-400" />
            <span className="truncate max-w-[50px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else onNavigate('history');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
              currentView === 'history'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Library className="w-5 h-5 mb-0.5" />
            <span>Koleksi</span>
          </button>
        )}
      </div>
    </nav>
  );
};
