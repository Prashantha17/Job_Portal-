import React, { useEffect, useState } from 'react';
import {
  X, MapPin, Briefcase, Calendar, Users, Eye, CheckCircle2,
  Building, ExternalLink, Award, Send, AlertCircle
} from 'lucide-react';
import { Button } from '../common/Button';
import { JobDetail, jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { formatDetailedLPA } from '../../utils/currencyFormatter';

interface JobDetailsModalProps {
  jobId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (job: JobDetail) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  jobId,
  isOpen,
  onClose,
  onApply
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      setLoading(true);
      setError(null);
      setApplied(false);
      jobService.getJobById(jobId)
        .then((data) => setJob(data))
        .catch((err) => {
          console.error('Error fetching job details:', err);
          setError('Unable to load job details. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, jobId]);

  if (!isOpen || !jobId) return null;

  const handleApplyClick = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (onApply && job) {
      onApply(job);
      return;
    }
    if (!job) return;

    try {
      setApplying(true);
      setError(null);
      await applicationService.applyForJob({
        jobId: job.id,
        coverLetter: `Application for ${job.title} via TalentFlow 360 portal`
      });
      setApplied(true);
      setApplySuccessMsg('Thank you for applying! A confirmation email has been dispatched directly to your inbox.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to submit application.';
      if (msg.includes('already submitted') || msg.includes('already applied')) {
        setApplied(true);
        setApplySuccessMsg('You have already applied for this role. Check your Candidate Hub to track progress.');
      } else {
        setError(msg);
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {job?.companyLogoUrl ? (
                <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-6 h-6 text-brand-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {loading ? 'Loading position...' : job?.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-semibold text-brand-700">{job?.companyName}</span>
                {job?.isCompanyVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Employer
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-sm">Retrieving job description and requirements...</p>
            </div>
          ) : error || !job ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
              <p className="font-semibold text-sm">{error || 'Job posting not found.'}</p>
            </div>
          ) : (
            <>
              {/* Badges and Quick Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Workplace</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" /> {job.workplaceType}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Employment</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-brand-600" /> {job.employmentType.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 col-span-2 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Annual Compensation (CTC)</span>
                  <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <span className="font-bold text-sm">₹</span>
                    {formatDetailedLPA(job.minSalary, job.maxSalary)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Min Experience</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-brand-600" />
                    {job.experienceYearsMin ? `${job.experienceYearsMin}+ years` : 'Entry level'}
                  </span>
                </div>
              </div>

              {/* Location & Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {job.vacanciesCount} vacancy / vacancies
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {job.viewsCount} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Skills Section */}
              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand-600" /> Required & Preferred Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                          s.requirementLevel === 'REQUIRED'
                            ? 'bg-brand-50 text-brand-800 border border-brand-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{s.skillName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          s.requirementLevel === 'REQUIRED'
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-300 text-slate-800'
                        }`}>
                          {s.requirementLevel}
                        </span>
                        {s.minYearsExperience > 0 && (
                          <span className="text-[10px] text-slate-500">({s.minYearsExperience}y+)</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Overview */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Role Overview</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Key Responsibilities</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {job.responsibilities}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Candidate Requirements</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </p>
                </div>
              )}

              {/* Company Info Box */}
              {job.companyWebsite && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">About {job.companyName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{job.companyIndustry || 'Enterprise Technology'}</p>
                  </div>
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                  >
                    Visit Company Site <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {applied ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {applySuccessMsg || 'Application Sent! Track status in Candidate Hub.'}
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={handleApplyClick}
              disabled={loading || !job}
              isLoading={applying}
            >
              {isAuthenticated ? 'Apply for this Role' : 'Sign in to Apply'}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};
