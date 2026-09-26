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
import { Sermon, User, FeatureLocks, PaymentInfo } from './types/sermon';
import {
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  fetchCurrentUserProfile,
  fetchUserSermons,
  saveSermon,
  deleteSermonApi,
  fetchAdminSettingsApi,
  DEFAULT_FEATURE_LOCKS,
  DEFAULT_PAYMENT_INFO,
} from './services/api';
import { SermonHistoryView } from './components/SermonHistoryView';
import { BibleReaderView } from './components/BibleReaderView';
import { CommentaryView } from './components/CommentaryView';
import { SuperadminPanel } from './components/SuperadminPanel';
import { SubscriptionPaywallModal } from './components/SubscriptionPaywallModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'create' | 'editor' | 'history' | 'bible' | 'commentary' | 'superadmin'>('landing');
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);
  const [wizardInitialData, setWizardInitialData] = useState<{ scripture?: string; theme?: string; objective?: string } | null>(null);
  const [commentaryInitialPassage, setCommentaryInitialPassage] = useState<string>('');

  // Feature Locks & Payment Config
  const [featureLocks, setFeatureLocks] = useState<FeatureLocks>(DEFAULT_FEATURE_LOCKS);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(DEFAULT_PAYMENT_INFO);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallFeatureName, setPaywallFeatureName] = useState('');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPowerPointOpen, setIsPowerPointOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Refresh dashboard state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(new Date());

  const handleRefreshDashboard = async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      const prevStatus = currentUser.subscription_status;
      const prevRole = currentUser.role;

      const [updatedUser, settings, updatedSermons] = await Promise.all([
        fetchCurrentUserProfile(currentUser),
        fetchAdminSettingsApi(),
        fetchUserSermons(currentUser),
      ]);

      if (updatedUser) {
        setCurrentUser(updatedUser);
        setStoredUser(updatedUser);
      }
      if (settings) {
        setFeatureLocks(settings.feature_locks);
        setPaymentInfo(settings.payment_info);
      }
      if (updatedSermons) {
        setSermons(updatedSermons);
      }
      setLastRefreshedAt(new Date());

      if (updatedUser && prevStatus !== 'premium' && updatedUser.subscription_status === 'premium') {
        showToast('🎉 Selamat! Akun Anda telah diaktifkan ke status PREMIUM oleh Superadmin.', 'success');
      } else if (updatedUser && prevRole !== 'superadmin' && updatedUser.role === 'superadmin') {
        showToast('👑 Peran Anda telah diangkat menjadi Superadmin.', 'success');
      } else {
        showToast('Dashboard berhasil diperbarui dengan data superadmin terbaru.', 'success');
      }
    } catch (err) {
      console.error('Error refreshing dashboard', err);
      showToast('Dashboard telah disegarkan.', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initialize user & load sermons & settings
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
      loadSermons(user);
      setCurrentView('dashboard');
    } else {
      loadSermons({ id: 'user-demo-1', name: 'Demo', email: 'demo@gereja.id' });
    }

    // Load admin settings
    fetchAdminSettingsApi().then((data) => {
      if (data) {
        setFeatureLocks(data.feature_locks);
        setPaymentInfo(data.payment_info);
      }
    });
  }, []);

  const isUserPremiumOrSuperadmin = (user: User | null): boolean => {
    if (!user) return false;
    if (user.role === 'superadmin' || user.username === 'tn.timbu') return true;
    if (user.subscription_status === 'premium') {
      if (!user.subscription_expires_at) return true;
      return new Date(user.subscription_expires_at).getTime() > Date.now();
    }
    return false;
  };

  const checkFeatureAccess = (featureKey: keyof FeatureLocks, featureLabel: string): boolean => {
    if (isUserPremiumOrSuperadmin(currentUser)) return true;
    if (featureLocks[featureKey]) {
      setPaywallFeatureName(featureLabel);
      setPaywallOpen(true);
      return false;
    }
    return true;
  };

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
    if (!checkFeatureAccess('powerPointExport', 'Download Presentasi PowerPoint (.PPTX)')) {
      return;
    }
    setActiveSermon(sermon);
    setIsPowerPointOpen(true);
  };

  const handleNavigate = (view: 'landing' | 'dashboard' | 'create' | 'history' | 'bible' | 'commentary' | 'superadmin') => {
    if (view === 'superadmin') {
      if (!isUserPremiumOrSuperadmin(currentUser) || currentUser?.role !== 'superadmin') {
        showToast('Halaman ini khusus untuk Superadmin.', 'info');
        return;
      }
      setCurrentView('superadmin');
      return;
    }

    if (view === 'commentary') {
      if (!checkFeatureAccess('scholarlyCommentary', 'Tafsiran Pakar Kredibel')) {
        return;
      }
    }

    if (view === 'create') {
      if (!currentUser) {
        setIsAuthOpen(true);
        return;
      }
      if (featureLocks.aiSermonGeneration && !checkFeatureAccess('aiSermonGeneration', 'Pembuatan Khotbah AI')) {
        return;
      }
      if (
        featureLocks.unlimitedSermons &&
        !isUserPremiumOrSuperadmin(currentUser) &&
        sermons.length >= 3
      ) {
        setPaywallFeatureName('Khotbah Tanpa Batas (Batas Akun Gratis: 3 Khotbah)');
        setPaywallOpen(true);
        return;
      }
    }

    setCurrentView(view);
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
    <div className="min-h-screen bg-stone-50 flex flex-col text-slate-900 selection:bg-amber-100 selection:text-amber-900 w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-amber-500/40 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce max-w-[calc(100vw-40px)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="truncate">{notification.message}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* View Routing */}
      <div className={`flex-1 flex flex-col w-full max-w-full min-w-0 overflow-x-hidden ${['dashboard', 'bible', 'commentary', 'history'].includes(currentView) ? 'pb-20 md:pb-0' : 'pb-0'}`}>
        {currentView === 'landing' && (
          <LandingPage
            onStartNow={() => {
              if (currentUser) {
                handleNavigate('create');
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
            onCreateNew={() => {
              setWizardInitialData(null);
              handleNavigate('create');
            }}
            onOpenSermon={handleOpenSermon}
            onOpenPowerPoint={handleOpenPowerPoint}
            onDuplicateSermon={handleDuplicateSermon}
            onDeleteSermon={handleDeleteSermon}
            onRefresh={handleRefreshDashboard}
            isRefreshing={isRefreshing}
            lastRefreshedAt={lastRefreshedAt}
            onNavigateToSuperadmin={() => handleNavigate('superadmin')}
          />
        )}

        {currentView === 'create' && currentUser && (
          <CreateSermonWizard
            currentUser={currentUser}
            initialData={wizardInitialData || undefined}
            onSuccess={(newSermon) => {
              setWizardInitialData(null);
              handleSermonCreated(newSermon);
            }}
            onCancel={() => {
              setWizardInitialData(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'superadmin' && currentUser && (
          <SuperadminPanel
            currentUser={currentUser}
            onBackToApp={() => setCurrentView('dashboard')}
            showToast={showToast}
          />
        )}

        {currentView === 'bible' && (
          <BibleReaderView
            onUseForSermon={(verseRef, themeHint) => {
              setWizardInitialData({
                scripture: verseRef,
                theme: themeHint || '',
                objective: `Membimbing jemaat memahami kebenaran firman Tuhan dalam ${verseRef}.`,
              });
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                handleNavigate('create');
              }
            }}
            onOpenCommentaryForPassage={(passage) => {
              setCommentaryInitialPassage(passage);
              handleNavigate('commentary');
            }}
          />
        )}

        {currentView === 'commentary' && (
          <CommentaryView
            initialPassage={commentaryInitialPassage}
            onUseForSermon={(passage, theme, bigIdea) => {
              setWizardInitialData({
                scripture: passage,
                theme: theme || 'Kebenaran Firman Tuhan',
                objective: bigIdea || '',
              });
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                handleNavigate('create');
              }
            }}
            onOpenBiblePassage={() => {
              handleNavigate('bible');
            }}
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
            onCreateNew={() => {
              setWizardInitialData(null);
              handleNavigate('create');
            }}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation for Android & Touch Devices (only on main views) */}
      {['dashboard', 'bible', 'commentary', 'history'].includes(currentView) && (
        <MobileBottomNav
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Subscription Paywall Modal */}
      <SubscriptionPaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        featureName={paywallFeatureName}
        paymentInfo={paymentInfo}
        userEmail={currentUser?.email}
      />

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
