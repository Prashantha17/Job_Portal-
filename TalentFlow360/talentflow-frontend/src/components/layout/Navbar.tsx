import React, { useState } from 'react';
import { Layers, Menu, X, ArrowRight, User, Briefcase, LogOut, Shield, ChevronDown, Award, Building2, Sparkles, Lock } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notification/NotificationBell';

export type AppView = 'home' | 'browse-jobs' | 'candidate-dashboard' | 'recruiter-dashboard' | 'resume-builder' | 'login' | 'register';

interface NavbarProps {
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView = 'home', onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
                  TalentFlow<span className="text-brand-600 font-black">360</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
                  Recruitment Platform
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button
                onClick={() => navigateTo('home')}
                className={`transition-colors cursor-pointer ${currentView === 'home' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'
                  }`}
              >
                Home
              </button>

              <button
                onClick={() => navigateTo('browse-jobs')}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${currentView === 'browse-jobs' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'
                  }`}
              >
                <Briefcase className="w-4 h-4 text-brand-600" />
                Browse Jobs
              </button>

              {/* Role-specific Dashboard shortcut tabs */}
              {isAuthenticated && isCandidate && (
                <button
                  onClick={() => navigateTo('candidate-dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentView === 'candidate-dashboard'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                    }`}
                >
                  <Award className="w-4 h-4 text-brand-600" />
                  Candidate Career Hub
                </button>
              )}

              {/* Recruiter Operations Hub */}
              <button
                onClick={() => navigateTo('recruiter-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentView === 'recruiter-dashboard'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                Recruiter Hub
              </button>

              {/* AI Resume Builder (10 Templates - Requires Login) */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('login');
                  } else {
                    navigateTo('resume-builder');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentView === 'resume-builder'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                  }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Resume Builder

              </button>

              <a href="#companies" className="hover:text-brand-600 transition-colors">
                Top Companies
              </a>
              <a href="#ats-pipeline" className="hover:text-brand-600 transition-colors">
                Recruitment ATS
              </a>

            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
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
                    className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {user.email}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                      {getPrimaryRole()}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {user.firstName?.charAt(0) || 'U'}
                      {user.lastName?.charAt(0) || ''}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-scaleUp">
                      <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                        <span className="text-xs font-bold text-slate-900 block">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-[11px] text-slate-500 block break-all">{user.email}</span>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                            {getPrimaryRole()}
                          </span>
                          <span className="text-[10px] text-slate-400">ID #{user.id}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {isCandidate && (
                          <button
                            onClick={() => navigateTo('candidate-dashboard')}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50/60 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5 text-brand-600" />
                            Candidate Career Hub
                          </button>
                        )}

                        <button
                          onClick={() => navigateTo('resume-builder')}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50/60 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          AI Resume Builder
                        </button>

                        {(isRecruiter || user?.roles?.includes('ROLE_SUPER_ADMIN')) && (
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
              <>
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
              </>
            )}
          </div>

          {/* Mobile actions & hamburger */}
          <div className="lg:hidden flex items-center gap-2">
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
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[11px] text-slate-500">{user.email}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                {getPrimaryRole()}
              </span>
            </div>
          )}

          <nav className="flex flex-col space-y-2 font-medium text-slate-700 text-sm">
            <button
              onClick={() => navigateTo('home')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-brand-600"
            >
              Home
            </button>

            <button
              onClick={() => navigateTo('browse-jobs')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-brand-600" />
              Browse Jobs
            </button>

            {isAuthenticated && isCandidate && (
              <button
                onClick={() => navigateTo('candidate-dashboard')}
                className="w-full text-left px-3 py-2 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center gap-2"
              >
                <Award className="w-4 h-4" /> Candidate Career Hub
              </button>
            )}

            <button
              onClick={() => navigateTo('recruiter-dashboard')}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center gap-2 ${currentView === 'recruiter-dashboard'
                ? 'bg-indigo-50 text-indigo-700'
                : 'hover:bg-slate-50 hover:text-indigo-600 text-slate-700'
                }`}
            >
              <Building2 className="w-4 h-4 text-indigo-600" /> Recruiter Hub & ATS
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                } else {
                  navigateTo('resume-builder');
                }
              }}
              className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between ${currentView === 'resume-builder'
                ? 'bg-purple-50 text-purple-700'
                : 'hover:bg-slate-50 hover:text-purple-600 text-slate-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> AI Resume Builder (10 Templates)
              </div>
              {!isAuthenticated && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Login Required
                </span>
              )}
            </button>

            <a
              href="#companies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-brand-600"
            >
              Top Companies
            </a>
            <a
              href="#ats-pipeline"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-brand-600"
            >
              Recruitment ATS Pipeline
            </a>
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
