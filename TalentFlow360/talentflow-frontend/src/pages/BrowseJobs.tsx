import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Briefcase, Building2, CheckCircle2,
  ArrowRight, ArrowLeft, SlidersHorizontal, RefreshCw, X
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { JobDetailsModal } from '../components/jobs/JobDetailsModal';
import { formatLPA } from '../utils/currencyFormatter';
import jobService, {
  JobSummary,
  WorkplaceType,
  EmploymentType,
  PageResponse
} from '../services/jobService';

interface BrowseJobsProps {
  onBackToHome?: () => void;
}

export const BrowseJobs: React.FC<BrowseJobsProps> = ({ onBackToHome }) => {
  // Query state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceType | ''>('');
  const [selectedEmployment, setSelectedEmployment] = useState<EmploymentType | ''>('');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [page, setPage] = useState(0);

  // Data state
  const [jobsResponse, setJobsResponse] = useState<PageResponse<JobSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected job for modal
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobService.searchJobs({
        keyword,
        location,
        workplaceType: selectedWorkplace,
        employmentType: selectedEmployment,
        minSalary: minSalary > 0 ? minSalary : undefined,
        page,
        size: 9,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      setJobsResponse(data);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError('Unable to fetch job listings. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, selectedWorkplace, selectedEmployment, minSalary]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setSelectedWorkplace('');
    setSelectedEmployment('');
    setMinSalary(0);
    setPage(0);
  };

  const openJobModal = (jobId: number) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="mb-8">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Career Opportunities
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover verified roles at innovative tech organizations, matched to your skills
        </p>
      </div>

      {/* Hero Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-slate-200/90 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by job title, skill (e.g. Java, React), or company"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="md:col-span-4 relative flex items-center">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Location or 'Remote'"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <Button type="submit" variant="primary" className="w-full py-3">
              Search Jobs
            </Button>
            {(keyword || location || selectedWorkplace || selectedEmployment || minSalary > 0) && (
              <Button type="button" variant="outline" size="sm" onClick={handleClearFilters} title="Clear filters">
                <X className="w-4 h-4 text-slate-500" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Main Grid: Filters Sidebar + Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" /> Filter Criteria
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Workplace Policy */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-700 block">Workplace Policy</label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Arrangements', val: '' },
                  { label: 'Remote Only', val: 'REMOTE' },
                  { label: 'Hybrid', val: 'HYBRID' },
                  { label: 'On-Site', val: 'ON_SITE' }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => { setSelectedWorkplace(item.val as any); setPage(0); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                      selectedWorkplace === item.val
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedWorkplace === item.val && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-700 block">Employment Type</label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Types', val: '' },
                  { label: 'Full Time', val: 'FULL_TIME' },
                  { label: 'Contract', val: 'CONTRACT' },
                  { label: 'Part Time', val: 'PART_TIME' },
                  { label: 'Internship', val: 'INTERNSHIP' }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => { setSelectedEmployment(item.val as any); setPage(0); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                      selectedEmployment === item.val
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedEmployment === item.val && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Salary Slider in LPA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Minimum CTC / Salary</label>
                <span className="text-xs font-extrabold text-emerald-700">
                  {minSalary > 0 ? `₹${(minSalary / 100000).toFixed(0)} LPA` : 'Any'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="4000000"
                step="100000"
                value={minSalary}
                onChange={(e) => { setMinSalary(Number(e.target.value)); setPage(0); }}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹0</span>
                <span>₹15 LPA</span>
                <span>₹30 LPA</span>
                <span>₹40L+</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Job Cards Grid */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>
              Showing {jobsResponse?.content.length || 0} of {jobsResponse?.totalElements || 0} active openings
            </span>
            <button
              onClick={fetchJobs}
              className="flex items-center gap-1 font-semibold text-brand-600 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-sm">Searching open positions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl">
              <p className="text-rose-700 text-sm font-semibold">{error}</p>
              <Button size="sm" variant="primary" className="mt-4" onClick={fetchJobs}>
                Retry
              </Button>
            </div>
          ) : jobsResponse?.content.length === 0 ? (
            <Card className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching job vacancies found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try widening your search terms, removing filters, or resetting the minimum salary threshold.
              </p>
              <Button size="sm" variant="outline" className="mt-4" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobsResponse?.content.map((job) => (
                <div
                  key={job.id}
                  onClick={() => openJobModal(job.id)}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Company & Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {job.companyLogoUrl ? (
                            <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-brand-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700">{job.companyName}</span>
                            {job.isCompanyVerified && (
                              <span title="Verified Organization" className="inline-flex">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        job.workplaceType === 'REMOTE'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : job.workplaceType === 'HYBRID'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {job.workplaceType}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.employmentType.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Salary Highlight (Indian LPA) */}
                    {(job.minSalary || job.maxSalary) && (
                      <div className="text-xs font-extrabold text-emerald-700 mb-3 flex items-center gap-1">
                        <span className="font-bold">₹</span>
                        <span>{formatLPA(job.minSalary, job.maxSalary)}</span>
                      </div>
                    )}

                    {/* Tech Skills Chips */}
                    {job.topSkills && job.topSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.topSkills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Position <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {jobsResponse && jobsResponse.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={jobsResponse.isFirst}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-500">
                Page {jobsResponse.pageNumber + 1} of {jobsResponse.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(jobsResponse.totalPages - 1, p + 1))}
                disabled={jobsResponse.isLast}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Full Job Details Modal */}
      <JobDetailsModal
        jobId={selectedJobId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
export default BrowseJobs;
