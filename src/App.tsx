import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { CreateSermonWizard } from './components/CreateSermonWizard';
import { SermonEditor } from './components/SermonEditor';
import { PowerPointModal } from './components/PowerPointModal';
import { SermonOutlineModal } from './components/SermonOutlineModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { Sermon, User } from './types/sermon';
import {
  getStoredUser,
  clearStoredUser,
  fetchUserSermons,
  saveSermon,
  deleteSermonApi,
} from './services/api';
import { SermonHistoryView } from './components/SermonHistoryView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'create' | 'editor' | 'history'>('landing');
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPowerPointOpen, setIsPowerPointOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Initialize user & load sermons
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
      loadSermons(user);
      setCurrentView('dashboard');
    } else {
      loadSermons({ id: 'user-demo-1', name: 'Demo', email: 'demo@gereja.id' });
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadSermons = async (user: User) => {
    try {
      const data = await fetchUserSermons(user);
      setSermons(data);
    } catch (err) {
      console.error('Failed to load sermons', err);
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    loadSermons(user);
    setCurrentView('dashboard');
    showToast(`Selamat datang, ${user.name}!`);
  };

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const handleOpenSermon = (sermon: Sermon) => {
    setActiveSermon(sermon);
    setCurrentView('editor');
  };

  const handleOpenPowerPoint = (sermon: Sermon) => {
    setActiveSermon(sermon);
    setIsPowerPointOpen(true);
  };

  const handleOpenOutline = (sermon: Sermon) => {
    setActiveSermon(sermon);
    setIsOutlineOpen(true);
  };

  const handleSermonCreated = (newSermon: Sermon) => {
    setSermons((prev) => [newSermon, ...prev]);
    setActiveSermon(newSermon);
    setCurrentView('editor');
    showToast('Khotbah dan presentasi PowerPoint berhasil disusun!');
  };

  const handleUpdateSermon = async (updated: Sermon) => {
    setActiveSermon(updated);
    setSermons((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (currentUser) {
      await saveSermon(updated, currentUser);
    }
  };

  const handleDuplicateSermon = async (sermon: Sermon) => {
    if (!currentUser) return;
    const duplicated: Sermon = {
      ...sermon,
      id: `sermon-${Date.now()}`,
      title: `${sermon.title} (Salinan)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const saved = await saveSermon(duplicated, currentUser);
    setSermons((prev) => [saved, ...prev]);
    showToast(`Naskah khotbah berhasil diduplikasi.`);
  };

  const handleDeleteSermon = async (sermonId: string) => {
    if (!currentUser) return;
    await deleteSermonApi(sermonId, currentUser);
    setSermons((prev) => prev.filter((s) => s.id !== sermonId));
    if (activeSermon?.id === sermonId) {
      setActiveSermon(null);
      setCurrentView('dashboard');
    }
    showToast('Khotbah telah dihapus.');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-amber-500/40 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          {notification.message}
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'create' && !currentUser) {
            setIsAuthOpen(true);
            return;
          }
          setCurrentView(view);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* View Routing */}
      <div className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onStartNow={() => {
              if (currentUser) {
                setCurrentView('create');
              } else {
                setIsAuthOpen(true);
              }
            }}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          <Dashboard
            currentUser={currentUser}
            sermons={sermons}
            onCreateNew={() => setCurrentView('create')}
            onOpenSermon={handleOpenSermon}
            onOpenPowerPoint={handleOpenPowerPoint}
            onDuplicateSermon={handleDuplicateSermon}
            onDeleteSermon={handleDeleteSermon}
          />
        )}

        {currentView === 'create' && currentUser && (
          <CreateSermonWizard
            currentUser={currentUser}
            onSuccess={handleSermonCreated}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'editor' && activeSermon && currentUser && (
          <SermonEditor
            initialSermon={activeSermon}
            currentUser={currentUser}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onOpenPowerPoint={handleOpenPowerPoint}
            onOpenOutline={handleOpenOutline}
          />
        )}

        {currentView === 'history' && currentUser && (
          <SermonHistoryView
            sermons={sermons}
            onOpenSermon={handleOpenSermon}
            onOpenPowerPoint={handleOpenPowerPoint}
            onDuplicateSermon={handleDuplicateSermon}
            onDeleteSermon={handleDeleteSermon}
            onCreateNew={() => setCurrentView('create')}
          />
        )}
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {activeSermon && (
        <PowerPointModal
          sermon={activeSermon}
          isOpen={isPowerPointOpen}
          onClose={() => setIsPowerPointOpen(false)}
          onUpdateSermon={handleUpdateSermon}
        />
      )}

      {activeSermon && (
        <SermonOutlineModal
          sermon={activeSermon}
          isOpen={isOutlineOpen}
          onClose={() => setIsOutlineOpen(false)}
          onUpdateSermon={handleUpdateSermon}
        />
      )}

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onStartNow={() => {
          setIsHowItWorksOpen(false);
          if (currentUser) {
            setCurrentView('create');
          } else {
            setIsAuthOpen(true);
          }
        }}
      />
    </div>
  );
}
