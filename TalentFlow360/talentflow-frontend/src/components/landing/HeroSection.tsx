import React from 'react';
import { Search, MapPin, Briefcase, Sparkles, TrendingUp, Users, Building2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HeroSectionProps {
  onSearch: (query: string, location: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchLocation: string;
  setSearchLocation: (val: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  searchQuery,
  setSearchQuery,
  searchLocation,
  setSearchLocation,
}) => {
  const quickTags = [
    'Senior Java Developer',
    'React & TypeScript',
    'Cloud Solutions Architect',
    'DevOps / Kubernetes',
    'Data Engineer',
    'AI / ML Specialist'
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, searchLocation);
    const el = document.getElementById('jobs');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-brand-50/50 via-white to-slate-50">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-brand-400/10 via-indigo-500/10 to-sky-400/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" className="py-1 px-3.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span className="font-semibold text-brand-900">Next-Gen Talent Platform</span>
              <span className="text-brand-400"></span>
              <span className="text-brand-700"></span>
            </Badge>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Precision Recruitment. <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 bg-clip-text text-transparent">
              Intelligent Talent Flow.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            The enterprise recruitment management system connecting top talent with industry leaders.
            Streamline your hiring lifecycle from candidate discovery to 10-stage ATS pipelines and interview offers.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleFormSubmit}
            className="mt-8 bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/90 flex flex-col md:flex-row gap-2.5 items-center text-left"
          >
            {/* Input: Title / Keyword */}
            <div className="flex-1 w-full flex items-center gap-3 px-3.5 py-2 border-b md:border-b-0 md:border-r border-slate-200">
              <Search className="w-5 h-5 text-brand-600 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  What role or skill?
                </label>
                <input
                  type="text"
                  placeholder="Job title, keywords, or technology..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Input: Location */}
            <div className="flex-1 w-full flex items-center gap-3 px-3.5 py-2">
              <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Where?
                </label>
                <input
                  type="text"
                  placeholder="City, state, or 'Remote'..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full md:w-auto px-8 shrink-0 font-semibold shadow-md shadow-brand-500/25"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Search Jobs
            </Button>
          </form>

          {/* Quick Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Trending Searches:</span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  onSearch(tag, searchLocation);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-colors border border-slate-200/60 font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="inline-flex p-2.5 rounded-xl bg-brand-50 text-brand-600 mb-2">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">12,480+</div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Active Job Openings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="inline-flex p-2.5 rounded-xl bg-indigo-50 text-indigo-600 mb-2">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">840+</div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Verified Employers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="inline-flex p-2.5 rounded-xl bg-emerald-50 text-emerald-600 mb-2">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">95,000+</div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Talented Candidates</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="inline-flex p-2.5 rounded-xl bg-amber-50 text-amber-600 mb-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">98.6%</div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Skill Match Precision</p>
          </div>
        </div>
      </div>
    </section>
  );
};
