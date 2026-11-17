import React, { useState } from 'react';
import {
  Layers, Menu, X, ArrowRight, User, Briefcase, LogOut,
  Shield, ChevronDown, Award, Building2, Sparkles, Home
} from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notification/NotificationBell';

export type AppView = 'home' | 'browse-jobs' | 'candidate-dashboard' | 'recruiter-dashboard' | 'resume-builder' | 'login' | 'register';

interface NavbarProps {
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
  onOpenAtsScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView = 'home', onNavigate, onOpenAtsScanner }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const isRecruiter = user?.roles?.some(r => r === 'ROLE_RECRUITER' || r === 'ROLE_HR_MANAGER');
  const isCandidate = user?.roles?.some(r => r === 'ROLE_JOB_SEEKER');

  const getPrimaryRole = () => {
    if (!user || !user.roles || user.roles.length === 0) return 'Member';
    const role = user.roles[0];
    if (role === 'ROLE_SUPER_ADMIN') return 'Super Admin';
    if (role === 'ROLE_HR_MANAGER') return 'HR Manager';
    if (role === 'ROLE_RECRUITER') return 'Recruiter';
    return 'Candidate';
  };

  const getRoleBadgeColor = () => {
    const role = user?.roles?.[0];
    if (role === 'ROLE_SUPER_ADMIN') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (role === 'ROLE_RECRUITER' || role === 'ROLE_HR_MANAGER') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const navigateTo = (view: AppView) => {
    if (onNavigate) {
      onNavigate(view);
    }
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 group text-left cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors leading-tight">
                TalentFlow<span className="text-brand-600 font-black">360</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Recruitment Platform
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links (Centered - Eliminates empty gap) */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-2.5 text-xs font-semibold text-slate-600 flex-1 mx-2">
            <button
              onClick={() => navigateTo('home')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-slate-100 text-brand-700 font-bold'
                  : 'hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigateTo('browse-jobs')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                currentView === 'browse-jobs'
                  ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-2xs'
                  : 'hover:text-brand-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-brand-600" />
              Browse Jobs
            </button>

            {/* Role-specific Dashboard shortcut tabs */}
            {isAuthenticated && isCandidate && (
              <button
                onClick={() => navigateTo('candidate-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'candidate-dashboard'
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-2xs'
                    : 'hover:text-brand-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-brand-600" />
                Candidate Career Hub
              </button>
            )}

            {/* Recruiter Operations Hub (Hidden for Candidate logins) */}
            {(!isAuthenticated || isRecruiter || user?.roles?.includes('ROLE_SUPER_ADMIN')) && !isCandidate && (
              <button
                onClick={() => navigateTo('recruiter-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'recruiter-dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs'
                    : 'hover:text-indigo-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Recruiter Hub
              </button>
            )}

            <a
              href="#companies"
              className="px-3 py-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-all border border-transparent"
            >
              Top Companies
            </a>

            <a
              href="#ats-pipeline"
              className="px-3 py-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-all border border-transparent"
            >
              Recruitment ATS
            </a>

            {/* Standalone ATS Resume Checker Button - Only available after login for candidates */}
            {isAuthenticated && isCandidate && (
              <button
                type="button"
                onClick={onOpenAtsScanner}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100/90 border border-amber-300 transition-all font-bold text-xs cursor-pointer shadow-2xs group"
                title="Upload your resume from your device to check your ATS Score, mistakes & what to improve"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
                <span>ATS Resume Checker</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-500 text-white rounded-full">Score</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              /* User is logged in: Notification Bell + Profile Chip & Dropdown */
              <>
                <NotificationBell onNavigate={(url) => {
                  if (url.startsWith('#')) {
                    if (url === '#candidate-hub') navigateTo('candidate-dashboard');
                    else if (url === '#recruiter-hub') navigateTo('recruiter-dashboard');
                    else if (url === '#resume-builder') navigateTo('resume-builder');
                    else if (url === '#jobs') navigateTo('browse-jobs');
                    else window.location.hash = url;
                  }
                }} />

                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {/* Avatar circle placed on left */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {user.firstName?.charAt(0) || 'U'}
                      {user.lastName?.charAt(0) || ''}
                    </div>

                    {/* User Name & Email */}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 leading-tight max-w-[130px] truncate">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 max-w-[130px] truncate">
                        {user.email}
                      </span>
                    </div>

                    {/* Role badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getRoleBadgeColor()}`}>
                      {getPrimaryRole()}
                    </span>

                    {/* Dropdown Chevron */}
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-2 z-50 animate-scaleUp">
                      <div className="p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1.5">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {user.firstName?.charAt(0) || 'U'}
                            {user.lastName?.charAt(0) || ''}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/60">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                            {getPrimaryRole()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">ID #{user.id}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {isCandidate && (
                          <>
                            <button
                              onClick={() => navigateTo('candidate-dashboard')}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50/60 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-brand-600" />
                              Candidate Career Hub
                            </button>

                            <button
                              onClick={() => navigateTo('resume-builder')}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50/60 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              AI Resume Builder
                            </button>
                          </>
                        )}

                        {(isRecruiter || user?.roles?.includes('ROLE_SUPER_ADMIN')) && !isCandidate && (
                          <button
                            onClick={() => navigateTo('recruiter-dashboard')}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            Recruiter Operations
                          </button>
                        )}

                        <button
                          onClick={() => navigateTo('home')}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          Explore Job Vacancies
                        </button>

                        <a
                          href="http://localhost:8080/swagger-ui.html"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          OpenAPI Swagger Specs
                        </a>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            navigateTo('home');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* User is not logged in */
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<User className="w-4 h-4" />}
                  className="text-slate-700"
                  onClick={() => navigateTo('login')}
                >
                  Sign In
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigateTo('register')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile actions & hamburger */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            {isAuthenticated && (
              <NotificationBell onNavigate={(url) => {
                if (url.startsWith('#')) {
                  if (url === '#candidate-hub') navigateTo('candidate-dashboard');
                  else if (url === '#recruiter-hub') navigateTo('recruiter-dashboard');
                  else if (url === '#resume-builder') navigateTo('resume-builder');
                  else if (url === '#jobs') navigateTo('browse-jobs');
                  else window.location.hash = url;
                }
              }} />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-fadeIn shadow-lg">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {user.firstName?.charAt(0) || 'U'}
                {user.lastName?.charAt(0) || ''}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getRoleBadgeColor()}`}>
                {getPrimaryRole()}
              </span>
            </div>
          )}

          <nav className="flex flex-col space-y-1 font-medium text-slate-700 text-sm">
            <button
              onClick={() => navigateTo('home')}
              className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2.5 ${
                currentView === 'home' ? 'bg-slate-100 font-bold text-brand-600' : 'text-slate-700'
              }`}
            >
              <Home className="w-4 h-4 text-slate-400" />
              Home
            </button>

            <button
              onClick={() => navigateTo('browse-jobs')}
              className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2.5 ${
                currentView === 'browse-jobs' ? 'bg-brand-50 font-bold text-brand-700' : 'text-slate-700'
              }`}
            >
              <Briefcase className="w-4 h-4 text-brand-600" />
              Browse Jobs
            </button>

            {isAuthenticated && isCandidate && (
              <button
                onClick={() => navigateTo('candidate-dashboard')}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center gap-2.5"
              >
                <Award className="w-4 h-4 text-brand-600" /> Candidate Career Hub
              </button>
            )}

            {/* Recruiter Operations Hub (Hidden for Candidate logins) */}
            {(!isAuthenticated || isRecruiter || user?.roles?.includes('ROLE_SUPER_ADMIN')) && !isCandidate && (
              <button
                onClick={() => navigateTo('recruiter-dashboard')}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold flex items-center gap-2.5 ${
                  currentView === 'recruiter-dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-slate-50 hover:text-indigo-600 text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" /> Recruiter Hub & ATS
              </button>
            )}

            <a
              href="#companies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-2.5 text-slate-700"
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              Top Companies
            </a>
            <a
              href="#ats-pipeline"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-2.5 text-slate-700"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              Recruitment ATS Pipeline
            </a>

            {isAuthenticated && isCandidate && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAtsScanner) onOpenAtsScanner();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>ATS Resume Checker & Score</span>
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">SCORE</span>
              </button>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full justify-center text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigateTo('home');
                }}
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => navigateTo('login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => navigateTo('register')}
                >
                  Create Account
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
