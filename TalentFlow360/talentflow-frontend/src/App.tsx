import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar, AppView } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { LiveToastContainer } from './components/notification/LiveToastContainer';
import { useAuth } from './context/AuthContext';

// Dynamic code-splitting for high performance & minimal initial bundle footprint
const BrowseJobs = lazy(() => import('./pages/BrowseJobs').then(m => ({ default: m.BrowseJobs })));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard').then(m => ({ default: m.CandidateDashboard })));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard').then(m => ({ default: m.RecruiterDashboard })));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder').then(m => ({ default: m.ResumeBuilder })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const StandaloneAtsScannerModal = lazy(() => import('./components/ats/StandaloneAtsScannerModal').then(m => ({ default: m.StandaloneAtsScannerModal })));

const PageLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[55vh] py-16">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Loading module...</p>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isAtsScannerOpen, setIsAtsScannerOpen] = useState(false);

  const handleOpenAtsScanner = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
    } else {
      setIsAtsScannerOpen(true);
    }
  };

  // Synchronize hash or view if needed
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#ats-checker') {
        if (!isAuthenticated) {
          openAuthModal('login');
        } else {
          setIsAtsScannerOpen(true);
        }
      } else if (hash === '#jobs') {
        setCurrentView('browse-jobs');
      } else if (hash === '#candidate-hub') {
        setCurrentView('candidate-dashboard');
      } else if (hash === '#recruiter-hub') {
        setCurrentView('recruiter-dashboard');
      } else if (hash === '#resume-builder') {
        setCurrentView('resume-builder');
      } else if (hash === '#login') {
        setCurrentView('login');
      } else if (hash === '#register') {
        setCurrentView('register');
      } else if (hash === '#home' || hash === '') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    if (view === 'browse-jobs') {
      window.location.hash = '#jobs';
    } else if (view === 'candidate-dashboard') {
      window.location.hash = '#candidate-hub';
    } else if (view === 'recruiter-dashboard') {
      window.location.hash = '#recruiter-hub';
    } else if (view === 'resume-builder') {
      window.location.hash = '#resume-builder';
    } else if (view === 'login') {
      window.location.hash = '#login';
    } else if (view === 'register') {
      window.location.hash = '#register';
    } else {
      window.location.hash = '#home';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAtsScanner={handleOpenAtsScanner}
      />
      
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          {currentView === 'browse-jobs' && (
            <BrowseJobs onBackToHome={() => handleNavigate('home')} />
          )}
          {currentView === 'candidate-dashboard' && (
            <CandidateDashboard
              onBackToHome={() => handleNavigate('home')}
              onOpenAtsScanner={handleOpenAtsScanner}
            />
          )}
          {currentView === 'recruiter-dashboard' && (
            <RecruiterDashboard onBackToHome={() => handleNavigate('home')} />
          )}
          {currentView === 'resume-builder' && (
            <ResumeBuilder onBack={() => handleNavigate('home')} />
          )}
          {currentView === 'login' && (
            <LoginPage
              onNavigateHome={() => handleNavigate('home')}
              onNavigateRegister={() => handleNavigate('register')}
            />
          )}
          {currentView === 'register' && (
            <RegisterPage
              onNavigateHome={() => handleNavigate('home')}
              onNavigateLogin={() => handleNavigate('login')}
            />
          )}
          {currentView === 'home' && (
            <LandingPage
              onExploreJobs={() => handleNavigate('browse-jobs')}
              onOpenAtsScanner={handleOpenAtsScanner}
            />
          )}
        </Suspense>
      </main>

      <Footer />
      <AuthModal />

      {/* Standalone AI ATS Resume Checker & Mistakes Modal */}
      <Suspense fallback={null}>
        <StandaloneAtsScannerModal
          isOpen={isAtsScannerOpen}
          onClose={() => setIsAtsScannerOpen(false)}
          onNavigateToBuilder={() => handleNavigate('resume-builder')}
          onNavigateToJobs={() => handleNavigate('browse-jobs')}
        />
      </Suspense>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        <LiveToastContainer />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
