import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar, AppView } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { BrowseJobs } from './pages/BrowseJobs';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Synchronize hash or view if needed
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#jobs') {
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
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      
      <main className="flex-1">
        {currentView === 'browse-jobs' && (
          <BrowseJobs onBackToHome={() => handleNavigate('home')} />
        )}
        {currentView === 'candidate-dashboard' && (
          <CandidateDashboard onBackToHome={() => handleNavigate('home')} />
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
          <LandingPage onExploreJobs={() => handleNavigate('browse-jobs')} />
        )}
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
