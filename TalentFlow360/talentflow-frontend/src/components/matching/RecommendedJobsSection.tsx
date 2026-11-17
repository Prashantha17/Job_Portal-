import React, { useState, useEffect } from 'react';
import {
  Sparkles, MapPin, Building2,
  CheckCircle2, ArrowRight, RefreshCw, AlertCircle,
  Eye, Award
} from 'lucide-react';
import { matchingService } from '../../services/matchingService';
import { JobRecommendation, MatchBreakdown } from '../../types/matching';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatLPA } from '../../utils/currencyFormatter';
import { MatchBreakdownModal } from './MatchBreakdownModal';

interface RecommendedJobsSectionProps {
  onApplyForJob?: (jobId: number) => void;
  onNavigateToSkills?: () => void;
}

export const RecommendedJobsSection: React.FC<RecommendedJobsSectionProps> = ({
  onApplyForJob,
  onNavigateToSkills
}) => {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected breakdown modal state
  const [activeModalData, setActiveModalData] = useState<{
    title: string;
    subtitle: string;
    breakdown: MatchBreakdown;
  } | null>(null);

  const fetchRecommendations = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await matchingService.getCandidateRecommendations(20);
      setRecommendations(data);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err?.response?.data?.message || err?.message || 'Could not load job recommendations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-500 text-white shadow-emerald-500/20';
    if (score >= 75) return 'bg-brand-600 text-white shadow-brand-500/20';
    if (score >= 60) return 'bg-blue-600 text-white shadow-blue-500/20';
    return 'bg-slate-600 text-white shadow-slate-500/20';
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Calculating your multi-dimensional match scores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500/30 text-brand-300 border border-brand-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Phase 9 Smart Engine
              </span>
              <span className="text-xs text-brand-200/80 font-medium">Algorithmic Talent Fit</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Recommended Jobs For You
            </h2>
            <p className="text-xs sm:text-sm text-brand-200/80 max-w-xl mt-1.5 leading-relaxed">
              Curated and ranked using skill overlap, required seniority, Indian tech hub proximity, and expected CTC alignment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRecommendations(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-400' : ''}`} />
              Refresh Matches
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <Card className="p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Recommendation Service Offline</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
          <Button variant="primary" size="sm" onClick={() => fetchRecommendations(true)}>
            Try Again
          </Button>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card className="p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4 text-brand-600">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Add Skills to Unlock Recommendations</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            We haven't indexed enough skills on your profile yet. Add your tech stack (e.g., Java, React, Spring Boot, AWS) to view tailored vacancies.
          </p>
          {onNavigateToSkills && (
            <div className="mt-6">
              <Button variant="primary" size="sm" onClick={onNavigateToSkills}>
                Update My Skills Profile
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((job) => (
            <Card
              key={job.jobId}
              className="p-5 sm:p-6 border border-slate-200/90 hover:border-brand-300 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Job Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Match Score Badge */}
                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 ${getScoreBadgeClass(
                        job.matchScore
                      )}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{job.matchScore}% Match</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                      {job.workplaceType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                      {job.employmentType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-brand-600" />
                        {job.companyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="font-bold text-slate-800">
                        {job.minSalary && job.maxSalary
                          ? `${formatLPA(job.minSalary)} - ${formatLPA(job.maxSalary)}`
                          : 'Competitive CTC'}
                      </span>
                      {job.experienceYearsMin !== undefined && (
                        <span>Min {job.experienceYearsMin}+ yrs exp</span>
                      )}
                    </div>
                  </div>

                  {/* Skills preview tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {job.breakdown.matchedRequiredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {s}
                      </span>
                    ))}
                    {job.breakdown.missingRequiredSkills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600"
                      >
                        Missing: {s}
                      </span>
                    ))}
                    {job.breakdown.missingRequiredSkills.length > 3 && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        +{job.breakdown.missingRequiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex sm:flex-row lg:flex-col items-center lg:items-end gap-2.5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <button
                    onClick={() =>
                      setActiveModalData({
                        title: job.title,
                        subtitle: `${job.companyName} • ${job.location}`,
                        breakdown: job.breakdown
                      })
                    }
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100/80 border border-brand-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect Fit Breakdown
                  </button>

                  {job.hasApplied ? (
                    <div className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Applied ({job.applicationStatus || 'In Review'})
                    </div>
                  ) : (
                    onApplyForJob && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onApplyForJob(job.jobId)}
                        className="w-full sm:w-auto"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        1-Click Apply
                      </Button>
                    )
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Breakdown Modal */}
      {activeModalData && (
        <MatchBreakdownModal
          isOpen={true}
          onClose={() => setActiveModalData(null)}
          title={activeModalData.title}
          subtitle={activeModalData.subtitle}
          breakdown={activeModalData.breakdown}
        />
      )}
    </div>
  );
};
