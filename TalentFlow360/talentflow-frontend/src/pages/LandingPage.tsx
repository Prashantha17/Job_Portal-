import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturedJobsSection } from '../components/landing/FeaturedJobsSection';
import { CompanySection } from '../components/landing/CompanySection';
import { AtsPipelinePreview } from '../components/landing/AtsPipelinePreview';
import { PlatformBenefitsSection } from '../components/landing/PlatformBenefitsSection';
import { RecruiterCtaSection } from '../components/landing/RecruiterCtaSection';

interface LandingPageProps {
  onExploreJobs?: () => void;
  onOpenAtsScanner?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreJobs, onOpenAtsScanner }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const isCandidate = user?.roles?.some(r => r === 'ROLE_JOB_SEEKER');
  const isRecruiter = user?.roles?.some(r => r === 'ROLE_RECRUITER' || r === 'ROLE_HR_MANAGER');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{ query: string; location: string }>({
    query: '',
    location: '',
  });

  const handleSearch = (query: string, location: string) => {
    setAppliedFilters({ query, location });
    if (onExploreJobs && (query || location)) {
      window.location.hash = '#jobs';
    }
  };

  return (
    <main className="min-h-screen">
      {/* 1. Hero Section with dynamic search and stats */}
      <HeroSection
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchLocation={searchLocation}
        setSearchLocation={setSearchLocation}
      />

      {/* 2. Featured Jobs with Smart Matching */}
      <FeaturedJobsSection
        filterQuery={appliedFilters.query}
        filterLocation={appliedFilters.location}
      />

      {/* 3. Verified Top Hiring Companies */}
      <CompanySection />

      {/* 4. Interactive 10-Stage ATS Pipeline */}
      <AtsPipelinePreview />

      {/* 4b. Standalone AI ATS Resume Score & Mistakes CTA Section (Hidden for Recruiters) */}
      {!isRecruiter && (
        <section className="py-12 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="space-y-3 text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                  <span>⚡ Instant Device Upload</span>
                  <span>•</span>
                  <span>{isAuthenticated ? 'Candidate Portal Unlocked' : 'Login Required'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Check Your Resume ATS Score & Mistakes
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Log in to upload your resume from your phone or laptop. Our AI extracts text, tests keyword density, flags red flags/mistakes, and reveals what to improve to get shortlisted by top companies.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal('login');
                    } else if (onOpenAtsScanner) {
                      onOpenAtsScanner();
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isAuthenticated ? 'Upload Resume & Check Score' : 'Sign In to Check ATS Score'}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Core Platform Benefits */}
      <PlatformBenefitsSection />

      {/* 6. Recruiter & Employer Callout (hidden for Candidate logins) */}
      {!isCandidate && <RecruiterCtaSection />}
    </main>
  );
};

