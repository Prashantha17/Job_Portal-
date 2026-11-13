import React, { useState } from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturedJobsSection } from '../components/landing/FeaturedJobsSection';
import { CompanySection } from '../components/landing/CompanySection';
import { AtsPipelinePreview } from '../components/landing/AtsPipelinePreview';
import { PlatformBenefitsSection } from '../components/landing/PlatformBenefitsSection';
import { RecruiterCtaSection } from '../components/landing/RecruiterCtaSection';

interface LandingPageProps {
  onExploreJobs?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreJobs }) => {
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

      {/* 5. Core Platform Benefits */}
      <PlatformBenefitsSection />

      {/* 6. Recruiter & Employer Callout */}
      <RecruiterCtaSection />
    </main>
  );
};

