import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Sparkles,
  Library,
  ShieldCheck,
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white md:hidden shadow-lg safe-area-bottom">
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center px-1">
        {/* Tab 1: Home */}
        <button
          onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
          className="flex flex-col items-center justify-center h-full text-center active:scale-95 transition-transform"
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              currentView === 'dashboard' || currentView === 'landing'
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] leading-tight ${
              currentView === 'dashboard' || currentView === 'landing'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 font-medium'
            }`}
          >
            Home
          </span>
        </button>

        {/* Tab 2: Alkitab */}
        <button
          onClick={() => onNavigate('bible')}
          className="flex flex-col items-center justify-center h-full text-center active:scale-95 transition-transform"
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              currentView === 'bible' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] leading-tight ${
              currentView === 'bible' ? 'text-amber-400 font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            Alkitab
          </span>
        </button>

        {/* Tab 3: Buat Khotbah (Balanced Center Action) */}
        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else onNavigate('create');
          }}
          className="flex flex-col items-center justify-center h-full text-center active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] leading-tight text-amber-300 font-bold mt-0.5">
            Buat
          </span>
        </button>

        {/* Tab 4: Tafsiran */}
        <button
          onClick={() => onNavigate('commentary')}
          className="flex flex-col items-center justify-center h-full text-center active:scale-95 transition-transform"
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              currentView === 'commentary' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] leading-tight ${
              currentView === 'commentary' ? 'text-amber-400 font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            Tafsiran
          </span>
        </button>

        {/* Tab 5: Koleksi or Superadmin */}
        {isSuperadmin ? (
          <button
            onClick={() => onNavigate('superadmin')}
            className="flex flex-col items-center justify-center h-full text-center active:scale-95 transition-transform"
          >
            <div
              className={`p-1 rounded-lg transition-colors ${
                currentView === 'superadmin' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] leading-tight ${
                currentView === 'superadmin' ? 'text-amber-400 font-bold' : 'text-slate-400 font-medium'
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
            className="flex flex-col items-center justify-center h-full text-center active:scale-95 transition-transform"
          >
            <div
              className={`p-1 rounded-lg transition-colors ${
                currentView === 'history' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <Library className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] leading-tight ${
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
