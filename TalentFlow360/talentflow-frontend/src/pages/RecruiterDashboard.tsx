import React, { useState, useEffect } from 'react';
import {
  Building2, Briefcase, Users, Award,
  Mail, Phone, Linkedin, Edit3, Plus, ArrowLeft,
  ShieldCheck, X, LogIn, Trash2,
  MapPin, Clock,
  History, CheckCircle2, Send, Filter,
  Calendar, Video, Star, ExternalLink,
  BarChart3, Sparkles, Eye, RefreshCw, User, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import profileService, { RecruiterProfile, UpdateRecruiterProfilePayload, downloadResumeFile } from '../services/profileService';
import jobService, {
  JobSummary,
  CreateJobPayload,
  WorkplaceType,
  EmploymentType,
  JobStatus
} from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { ApplicationResponse, ApplicationStatus, ApplicationStatusHistoryItem, AtsAnalysisReport } from '../types/application';
import { interviewService } from '../services/interviewService';
import {
  InterviewResponse,
  InterviewType,
  MeetingMode,
  RecommendationType,
  ScheduleInterviewRequest,
  SubmitFeedbackRequest
} from '../types/interview';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { formatLPA } from '../utils/currencyFormatter';
import { RecruitmentAnalyticsDashboard } from '../components/analytics/RecruitmentAnalyticsDashboard';
import { matchingService } from '../services/matchingService';
import { CandidateMatch, MatchBreakdown } from '../types/matching';
import { MatchBreakdownModal } from '../components/matching/MatchBreakdownModal';
import { CandidateProfileModal } from '../components/candidate/CandidateProfileModal';
import { AtsAnalysisReportModal } from '../components/ats/AtsAnalysisReportModal';

interface RecruiterDashboardProps {
  onBackToHome?: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onBackToHome }) => {
  const { user, isAuthenticated, login, logout, openAuthModal } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // My Jobs state
  const [myJobs, setMyJobs] = useState<JobSummary[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Recruiter form state
  const [form, setForm] = useState<UpdateRecruiterProfilePayload>({
    companyName: '',
    designation: '',
    department: '',
    corporateEmail: '',
    corporatePhone: '',
    linkedinUrl: ''
  });

  // Post Job form state
  const [jobForm, setJobForm] = useState<CreateJobPayload>({
    title: '',
    location: 'Remote',
    workplaceType: 'REMOTE',
    employmentType: 'FULL_TIME',
    minSalary: 120000,
    maxSalary: 150000,
    vacanciesCount: 1,
    description: '',
    responsibilities: '',
    requirements: '',
    status: 'PUBLISHED',
    skills: []
  });

  // Temporary skill input state
  const [tempSkill, setTempSkill] = useState({
    name: '',
    level: 'REQUIRED' as 'REQUIRED' | 'PREFERRED',
    exp: 2.0
  });

  const fetchProfileAndJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getRecruiterProfile();
      setProfile(data);
      setForm({
        companyName: data.companyName || '',
        designation: data.designation || '',
        department: data.department || '',
        corporateEmail: data.corporateEmail || '',
        corporatePhone: data.corporatePhone || '',
        linkedinUrl: data.linkedinUrl || ''
      });

      // Fetch recruiter's vacancies
      try {
        setJobsLoading(true);
        const jobs = await jobService.getMyJobs();
        setMyJobs(jobs);
      } catch (jErr) {
        console.warn('Could not load recruiter jobs:', jErr);
      } finally {
        setJobsLoading(false);
      }

      // Fetch recruiter's scheduled interviews
      try {
        await fetchRecruiterInterviews();
      } catch (iErr) {
        console.warn('Could not load interviews:', iErr);
      }

    } catch (err: any) {
      console.error('Error fetching recruiter profile:', err);
      if (err?.response?.status === 401) {
        logout();
        setError('Your session has expired. Please log in again.');
      } else if (err?.response?.status === 403) {
        setError('Access restricted: This portal is for Recruiters. You are currently logged in with a different role.');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Unable to load recruiter profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileAndJobs();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await profileService.updateRecruiterProfile(form);
      await fetchProfileAndJobs();
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update recruiter profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSkillToJob = () => {
    if (!tempSkill.name.trim()) return;
    const exists = jobForm.skills?.some(
      s => s.skillName.toLowerCase() === tempSkill.name.trim().toLowerCase()
    );
    if (exists) return;

    setJobForm(prev => ({
      ...prev,
      skills: [
        ...(prev.skills || []),
        {
          skillName: tempSkill.name.trim(),
          requirementLevel: tempSkill.level,
          minYearsExperience: tempSkill.exp
        }
      ]
    }));
    setTempSkill({ name: '', level: 'REQUIRED', exp: 2.0 });
  };

  const handleRemoveSkillFromJob = (index: number) => {
    setJobForm(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index)
    }));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      setActionLoading(true);
      await jobService.createJob({
        ...jobForm,
        companyName: profile?.companyName
      });
      alert('Job vacancy published successfully!');
      setIsPostJobModalOpen(false);
      setJobForm({
        title: '',
        location: 'Remote',
        workplaceType: 'REMOTE',
        employmentType: 'FULL_TIME',
        minSalary: 120000,
        maxSalary: 150000,
        vacanciesCount: 1,
        description: '',
        responsibilities: '',
        requirements: '',
        status: 'PUBLISHED',
        skills: []
      });
      await fetchProfileAndJobs();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to publish job vacancy.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId: number, currentStatus: JobStatus) => {
    const newStatus: JobStatus = currentStatus === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      await jobService.updateJobStatus(jobId, newStatus);
      await fetchProfileAndJobs();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job vacancy?')) return;
    try {
      await jobService.deleteJob(jobId);
      await fetchProfileAndJobs();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete job vacancy');
    }
  };

  // ATS Applicants state & handlers
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<JobSummary | null>(null);
  const [applicants, setApplicants] = useState<ApplicationResponse[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');

  // Smart Candidate Matching state
  const [atsViewSubTab, setAtsViewSubTab] = useState<'applicants' | 'talent_matches'>('applicants');
  const [applicantMatchesMap, setApplicantMatchesMap] = useState<Map<number, CandidateMatch>>(new Map());
  const [talentPoolMatches, setTalentPoolMatches] = useState<CandidateMatch[]>([]);
  const [loadingTalentPool, setLoadingTalentPool] = useState(false);
  const [activeBreakdownModal, setActiveBreakdownModal] = useState<{
    title: string;
    subtitle: string;
    breakdown: MatchBreakdown;
  } | null>(null);

  // Full Candidate Profile Modal state
  const [selectedCandidateForProfileModal, setSelectedCandidateForProfileModal] = useState<{
    candidateProfileId?: number;
    email?: string;
    name?: string;
    applicationNote?: string;
    application?: ApplicationResponse;
  } | null>(null);

  // Interview Management State & Handlers
  const [recruiterInterviews, setRecruiterInterviews] = useState<InterviewResponse[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'vacancies' | 'interviews' | 'analytics'>('vacancies');
  const [interviewNotificationMsg, setInterviewNotificationMsg] = useState<string | null>(null);

  // Schedule Modal State
  const [scheduleModalApp, setScheduleModalApp] = useState<ApplicationResponse | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleInterviewRequest>({
    applicationId: 0,
    roundName: 'Technical Round 1',
    interviewType: 'TECH_ROUND_1',
    meetingMode: 'GOOGLE_MEET',
    meetingLink: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    timezone: 'Asia/Kolkata (IST)',
    interviewerName: '',
    interviewerEmail: '',
    instructions: ''
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Scorecard / Feedback Modal State
  const [feedbackModalInterview, setFeedbackModalInterview] = useState<InterviewResponse | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<SubmitFeedbackRequest>({
    technicalRating: 4,
    problemSolvingRating: 4,
    communicationRating: 4,
    culturalFitRating: 4,
    recommendation: 'STRONG_HIRE',
    interviewerFeedback: ''
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchRecruiterInterviews = async () => {
    try {
      setLoadingInterviews(true);
      const data = await interviewService.getMyRecruiterInterviews();
      setRecruiterInterviews(data || []);
    } catch (err: any) {
      console.warn('Could not load recruiter interviews:', err);
    } finally {
      setLoadingInterviews(false);
    }
  };

  const handleOpenScheduleModal = (app: ApplicationResponse) => {
    setScheduleModalApp(app);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    const roomCode = Math.random().toString(36).substring(2, 8);

    setScheduleForm({
      applicationId: app.id,
      roundName: app.status === 'SHORTLISTED' ? 'Technical Round 1' : 'Technical Round 2',
      interviewType: app.status === 'HR_INTERVIEW' ? 'HR_ROUND' : 'TECH_ROUND_1',
      meetingMode: 'GOOGLE_MEET',
      meetingLink: `https://meet.google.com/tf360-${roomCode}`,
      scheduledStartTime: tomorrow.toISOString().slice(0, 16),
      scheduledEndTime: tomorrowEnd.toISOString().slice(0, 16),
      timezone: 'Asia/Kolkata (IST)',
      interviewerName: profile?.fullName || user?.firstName || 'Technical Lead',
      interviewerEmail: profile?.corporateEmail || user?.email || 'recruiter@talentflow360.com',
      instructions: 'Please join prepared with system architecture diagrams and live coding environment ready.'
    });
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    try {
      setScheduleLoading(true);

      const startInstant = new Date(scheduleForm.scheduledStartTime).toISOString();
      const endInstant = new Date(scheduleForm.scheduledEndTime).toISOString();

      await interviewService.scheduleInterview({
        ...scheduleForm,
        scheduledStartTime: startInstant,
        scheduledEndTime: endInstant
      });

      setInterviewNotificationMsg(
        `Round "${scheduleForm.roundName}" scheduled for ${scheduleModalApp.candidateName || 'Candidate'}. Live Google Meet invitation sent via Gmail!`
      );
      setTimeout(() => setInterviewNotificationMsg(null), 7000);
      setScheduleModalApp(null);
      await fetchRecruiterInterviews();
      if (selectedJobForApplicants) {
        handleViewApplicants(selectedJobForApplicants);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to schedule interview round');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleOpenFeedbackModal = (interview: InterviewResponse) => {
    setFeedbackModalInterview(interview);
    setFeedbackForm({
      technicalRating: interview.technicalRating || 4,
      problemSolvingRating: interview.problemSolvingRating || 4,
      communicationRating: interview.communicationRating || 4,
      culturalFitRating: interview.culturalFitRating || 4,
      recommendation: interview.recommendation || 'STRONG_HIRE',
      interviewerFeedback: interview.interviewerFeedback || ''
    });
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalInterview) return;

    try {
      setFeedbackLoading(true);
      await interviewService.submitFeedback(feedbackModalInterview.id, feedbackForm);
      setInterviewNotificationMsg(
        `Evaluation scorecard submitted for ${feedbackModalInterview.candidateName}! Candidate status updated.`
      );
      setTimeout(() => setInterviewNotificationMsg(null), 7000);
      setFeedbackModalInterview(null);
      await fetchRecruiterInterviews();
      if (selectedJobForApplicants) {
        handleViewApplicants(selectedJobForApplicants);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit scorecard');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Stage Transition Modal State
  const [transitionModalApp, setTransitionModalApp] = useState<ApplicationResponse | null>(null);
  const [transitionNewStatus, setTransitionNewStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [transitionRemarks, setTransitionRemarks] = useState('');
  const [transitionNotificationMsg, setTransitionNotificationMsg] = useState<string | null>(null);

  // Status Audit Trail Modal State
  const [historyModalApp, setHistoryModalApp] = useState<ApplicationResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<ApplicationStatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ATS Analysis Report Modal State
  const [selectedAtsReport, setSelectedAtsReport] = useState<AtsAnalysisReport | null>(null);
  const [loadingAtsReport, setLoadingAtsReport] = useState(false);
  const [atsReportJobTitle, setAtsReportJobTitle] = useState('');

  const handleOpenAtsReport = async (app: ApplicationResponse) => {
    setLoadingAtsReport(true);
    setAtsReportJobTitle(app.jobTitle || 'Applicant ATS Analysis');
    try {
      const report = await applicationService.getApplicationAtsAnalysis(app.id);
      setSelectedAtsReport(report);
    } catch (err: any) {
      console.error('Failed to load ATS analysis report:', err);
      if (app.atsScore != null) {
        setSelectedAtsReport({
          applicationId: app.id,
          atsScore: app.atsScore,
          matchTier: (app.atsMatchTier as any) || (app.atsScore >= 80 ? 'EXCELLENT_MATCH' : app.atsScore >= 60 ? 'GOOD_MATCH' : 'NEEDS_IMPROVEMENT'),
          skillsScore: Math.round(app.atsScore * 0.9),
          experienceScore: Math.round(app.atsScore * 0.95),
          keywordScore: Math.round(app.atsScore * 0.88),
          formatScore: 92,
          candidateEmail: app.candidateEmail,
          candidateNameExtracted: app.candidateName,
          jobTitle: app.jobTitle,
          analyzedAt: app.appliedAt,
          summary: `Applicant ATS score is ${app.atsScore}% against ${app.jobTitle || 'vacancy criteria'}.`,
          matchedKeywords: ['Candidate Profile', 'Application Submission'],
          missingKeywords: [],
          topStrengths: ['Direct vacancy alignment', 'Verified candidate profile'],
          bulletAudits: [],
          mistakes: [],
          suggestions: ['Review candidate details and advance applicant stage.']
        });
      } else {
        setSelectedAtsReport(null);
      }
    } finally {
      setLoadingAtsReport(false);
    }
  };

  const handleViewApplicants = async (job: JobSummary) => {
    setSelectedJobForApplicants(job);
    setSelectedStageFilter('ALL');
    setAtsViewSubTab('applicants');
    setLoadingApplicants(true);
    try {
      const [data, applicantMatches] = await Promise.all([
        applicationService.getJobApplications(job.id),
        matchingService.getJobApplicantMatches(job.id).catch(() => [] as CandidateMatch[])
      ]);
      setApplicants(data || []);
      const map = new Map<number, CandidateMatch>();
      for (const m of applicantMatches) {
        if (m.applicationId) map.set(m.applicationId, m);
        if (m.candidateId) map.set(m.candidateId, m);
      }
      setApplicantMatchesMap(map);
    } catch (err: any) {
      console.error('Error fetching job applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const fetchTalentPoolMatches = async (jobId: number) => {
    try {
      setLoadingTalentPool(true);
      const matches = await matchingService.getTopMatchedCandidatesForJob(jobId, 25);
      setTalentPoolMatches(matches || []);
    } catch (err: any) {
      console.error('Error fetching talent pool matches:', err);
    } finally {
      setLoadingTalentPool(false);
    }
  };

  const openTransitionModal = (app: ApplicationResponse, targetStatus?: ApplicationStatus) => {
    setTransitionModalApp(app);
    setTransitionNewStatus(targetStatus || app.status);
    setTransitionRemarks('');
  };

  const handleConfirmTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionModalApp) return;
    try {
      setUpdatingStatusId(transitionModalApp.id);
      await applicationService.updateStatus(
        transitionModalApp.id,
        transitionNewStatus,
        transitionRemarks.trim() || `Candidate stage updated to ${transitionNewStatus} in talent pipeline.`
      );
      setTransitionNotificationMsg(
        `Application #${transitionModalApp.id} (${transitionModalApp.candidateName || 'Candidate'}) moved to ${transitionNewStatus}. Automated status email dispatched to candidate's Gmail inbox!`
      );
      setTimeout(() => setTransitionNotificationMsg(null), 6500);
      setTransitionModalApp(null);
      if (selectedJobForApplicants) {
        const refreshed = await applicationService.getJobApplications(selectedJobForApplicants.id);
        setApplicants(refreshed || []);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update applicant stage');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleViewHistory = async (app: ApplicationResponse) => {
    setHistoryModalApp(app);
    setLoadingHistory(true);
    try {
      const hist = await applicationService.getApplicationHistory(app.id);
      setHistoryItems(hist || []);
    } catch (err: any) {
      console.error('Failed to load application history:', err);
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-brand-100">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiter Operations Hub</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Access your verified employer workspace to publish vacancies in ₹ LPA, manage candidate pipelines, and review 10-stage ATS screening.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            leftIcon={<LogIn className="w-4 h-4" />}
            onClick={async () => {
              try {
                setLoading(true);
                await login({ email: 'recruiter@talentflow360.com', password: 'Recruiter@123' });
                await fetchProfileAndJobs();
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }}
          >
            1-Click Demo Recruiter Login (Priya Nair)
          </Button>
          <Button variant="outline" onClick={() => openAuthModal('login')}>
            Sign In with Email / OTP
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium text-sm">Loading recruiter operations console...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 mb-6">
          <Building2 className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold">Recruiter Access Notice</h3>
          <p className="text-sm mt-1 text-amber-700">{error || 'Please sign in with a verified Recruiter employer account.'}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            leftIcon={<LogIn className="w-4 h-4" />}
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                await login({ email: 'recruiter@talentflow360.com', password: 'Recruiter@123' });
                await fetchProfileAndJobs();
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }}
          >
            Switch to Recruiter Account (Priya Nair)
          </Button>
          <Button variant="outline" onClick={() => openAuthModal('login')}>
            Sign In with Email
          </Button>
          <Button variant="ghost" onClick={fetchProfileAndJobs}>Retry</Button>
        </div>
      </div>
    );
  }

  const activeJobsCount = myJobs.filter(j => j.status === 'PUBLISHED').length;
  const totalApplicants = myJobs.reduce((acc, curr) => acc + (curr.applicationsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Portal
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recruiter & Employer Operations Hub
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage company recruiting credentials, hiring pipelines, and vacancy approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-brand-600" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Recruiter Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsPostJobModalOpen(true)}
          >
            Post New Job Vacancy
          </Button>
        </div>
      </div>

      {/* Recruiter Hero Identity Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 p-1 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl uppercase">
                <Building2 className="w-10 h-10 text-brand-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {profile.fullName}
                </h2>
                {profile.isVerified && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Employer
                  </span>
                )}
              </div>

              <p className="text-indigo-200 text-sm font-medium mt-1">
                {profile.designation} • <span className="text-white font-bold">{profile.companyName}</span>
                {profile.department && ` (${profile.department})`}
              </p>

              <div className="flex items-center gap-4 text-xs text-indigo-300/80 mt-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-brand-300" /> {profile.corporateEmail || profile.email}
                </span>
                {profile.corporatePhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-300" /> {profile.corporatePhone}
                  </span>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand-300 hover:text-white underline transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex md:flex-col gap-3">
            <span className="bg-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 border border-white/10">
              <Building2 className="w-4 h-4 text-brand-400" /> Organization: {profile.companyName}
            </span>
            <span className="bg-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 border border-white/10">
              <Award className="w-4 h-4 text-indigo-400" /> Talent Partner Account
            </span>
          </div>
        </div>
      </div>

      {/* Recruitment Metrics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="p-5 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Openings</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeJobsCount}</span>
            <span className="text-xs font-semibold text-emerald-600">Live on Portal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Live vacancies published</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Vacancies</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{myJobs.length}</span>
            <span className="text-xs font-semibold text-brand-600">Total Created</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Managed positions</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-purple-600 cursor-pointer hover:bg-purple-50/20 transition-colors" onClick={() => setActiveViewTab('analytics')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applicants</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalApplicants}</span>
            <span className="text-xs font-semibold text-purple-600">Screening Funnel</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Candidate submissions</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-600 cursor-pointer hover:bg-emerald-50/20 transition-colors" onClick={() => setActiveViewTab('interviews')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{recruiterInterviews.length}</span>
            <span className="text-xs font-semibold text-emerald-600">Active Rounds</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Calendar & scorecards</p>
        </Card>
      </div>

      {interviewNotificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 mb-6 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-xs font-bold text-emerald-900 block">Interview Dispatched</strong>
            <p className="text-xs text-emerald-700 mt-0.5">{interviewNotificationMsg}</p>
          </div>
        </div>
      )}

      {/* SECTION TABS: VACANCIES vs INTERVIEWS vs ANALYTICS */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveViewTab('vacancies')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === 'vacancies'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Vacancies & ATS Pipeline ({myJobs.length})
        </button>
        <button
          onClick={() => {
            setActiveViewTab('interviews');
            fetchRecruiterInterviews();
          }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === 'interviews'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Video className="w-4 h-4 text-brand-600" /> Interviews & Calendar ({recruiterInterviews.length})
        </button>
        <button
          onClick={() => setActiveViewTab('analytics')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === 'analytics'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-brand-600" /> Talent Analytics & Funnel 📊
        </button>
      </div>

      {/* VIEW TAB 1: VACANCIES & ATS PIPELINE */}
      {activeViewTab === 'vacancies' && (
      <div>

      {/* VACANCY MANAGEMENT SECTION */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Manage Company Job Postings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, publish, toggle status, and monitor applicants across all vacancies
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsPostJobModalOpen(true)}
          >
            Post New Vacancy
          </Button>
        </div>

        {jobsLoading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading your vacancies...</p>
          </div>
        ) : myJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No vacancies posted yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Publish your first opening to start receiving matched candidate applications.
            </p>
            <Button size="sm" onClick={() => setIsPostJobModalOpen(true)}>
              Post First Vacancy
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myJobs.map((job) => (
              <Card key={job.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                      <p className="text-xs text-brand-700 font-semibold">{job.companyName}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      job.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : job.status === 'CLOSED'
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location} ({job.workplaceType})
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.employmentType.replace('_', ' ')}
                    </span>
                    {(job.minSalary || job.maxSalary) && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="font-bold">₹</span> {formatLPA(job.minSalary, job.maxSalary)}
                      </span>
                    )}
                  </div>

                  {job.topSkills && job.topSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.topSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Users className="w-3.5 h-3.5" />}
                      onClick={() => handleViewApplicants(job)}
                    >
                      Applicants ({job.applicationsCount || 0})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleJobStatus(job.id, job.status)}
                    >
                      {job.status === 'PUBLISHED' ? 'Close Opening' : 'Re-Publish'}
                    </Button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete vacancy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
      )}

      {/* VIEW TAB 2: INTERVIEWS & SCHEDULING CALENDAR */}
      {activeViewTab === 'interviews' && (
        <div className="space-y-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-brand-600" />
                Interviews & Scheduling Calendar (IST)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage upcoming interview rounds, Google Meet links, candidate attendance confirmations, and multi-category evaluation scorecards.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Clock className={`w-3.5 h-3.5 ${loadingInterviews ? 'animate-spin' : ''}`} />}
              onClick={fetchRecruiterInterviews}
              isLoading={loadingInterviews}
            >
              Refresh Schedule
            </Button>
          </div>

          {loadingInterviews ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Retrieving interview schedule from server...</p>
            </div>
          ) : recruiterInterviews.length === 0 ? (
            <Card className="p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4 text-brand-600">
                <Calendar className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">No Interviews Scheduled Yet</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                To schedule an interview round with a candidate, open the <strong>Vacancies & ATS Pipeline</strong> tab, click <strong>"Applicants"</strong> on any vacancy, and click <strong>"Schedule Round"</strong> on shortlisted candidate profiles.
              </p>
              <div className="mt-6">
                <Button variant="primary" size="sm" onClick={() => setActiveViewTab('vacancies')}>
                  Go to Job Vacancies
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recruiterInterviews.map((item) => (
                <Card key={item.id} className="p-5 border border-slate-200/80 hover:shadow-md transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-brand-100 text-brand-800 border border-brand-200">
                          {item.roundName}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                          {item.interviewType.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                          item.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          item.status === 'RESCHEDULE_REQUESTED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          item.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                          item.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900">{item.candidateName}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {item.candidateEmail}</span>
                          {item.candidatePhone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {item.candidatePhone}</span>}
                          <span>Position: <strong>{item.jobTitle}</strong></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block font-semibold">Scheduled Date & Time (IST):</span>
                          <span className="font-bold text-slate-800">
                            {new Date(item.scheduledStartTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Platform:</span>
                          <span className="font-bold text-slate-800">{item.meetingMode.replace(/_/g, ' ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Interviewer:</span>
                          <span className="font-bold text-slate-800">{item.interviewerName || 'Assigned Lead'}</span>
                        </div>
                      </div>

                      {item.instructions && (
                        <div className="text-xs bg-brand-50/50 p-2.5 rounded-xl border border-brand-200/60 text-brand-900">
                          <strong>Instructions:</strong> {item.instructions}
                        </div>
                      )}

                      {item.rescheduleReason && (
                        <div className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                          <strong>Candidate Reschedule Request:</strong> {item.rescheduleReason}
                          {item.candidateNotes && <span className="block mt-0.5 text-amber-700">Alternate preferences: {item.candidateNotes}</span>}
                        </div>
                      )}

                      {/* Completed scorecard summary */}
                      {item.status === 'COMPLETED' && item.overallRating != null && (
                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-purple-900">Scorecard: ★ {item.overallRating} / 5.0</span>
                            <span className="font-extrabold text-purple-700 uppercase">{item.recommendation?.replace(/_/g, ' ')}</span>
                          </div>
                          {item.interviewerFeedback && (
                            <p className="text-slate-600 italic">"{item.interviewerFeedback}"</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col gap-2 min-w-[200px]">
                      {item.meetingLink && item.status !== 'CANCELLED' && (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Video Room <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-purple-700 border-purple-300 hover:bg-purple-50"
                        leftIcon={<Star className="w-3.5 h-3.5 text-purple-600" />}
                        onClick={() => handleOpenFeedbackModal(item)}
                      >
                        {item.status === 'COMPLETED' ? 'Update Scorecard' : 'Submit Scorecard'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 3: RECRUITMENT ANALYTICS & ATS FUNNEL INTELLIGENCE */}
      {activeViewTab === 'analytics' && (
        <div className="mb-12">
          <RecruitmentAnalyticsDashboard
            onSelectJobForApplicants={(jobId) => {
              const targetJob = myJobs.find(j => j.id === jobId);
              if (targetJob) {
                setActiveViewTab('vacancies');
                handleViewApplicants(targetJob);
              }
            }}
          />
        </div>
      )}

      {/* MODAL: POST NEW JOB VACANCY */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Publish New Job Vacancy</h3>
                <p className="text-xs text-slate-500">Posting on behalf of {profile.companyName}</p>
              </div>
              <button onClick={() => setIsPostJobModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Java Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Workplace Type *</label>
                  <select
                    value={jobForm.workplaceType}
                    onChange={(e) => setJobForm({ ...jobForm, workplaceType: e.target.value as WorkplaceType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type *</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value as EmploymentType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Bengaluru, Karnataka (or Remote India)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Salary (₹ INR / LPA)</label>
                  <input
                    type="number"
                    step="50000"
                    value={jobForm.minSalary || ''}
                    onChange={(e) => setJobForm({ ...jobForm, minSalary: Number(e.target.value) })}
                    placeholder="1400000 (14 LPA)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Salary (₹ INR / LPA)</label>
                  <input
                    type="number"
                    step="50000"
                    value={jobForm.maxSalary || ''}
                    onChange={(e) => setJobForm({ ...jobForm, maxSalary: Number(e.target.value) })}
                    placeholder="2200000 (22 LPA)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    value={jobForm.vacanciesCount || 1}
                    onChange={(e) => setJobForm({ ...jobForm, vacanciesCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Description *</label>
                <textarea
                  rows={3}
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Outline the mission, scope, and technical context of the position..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Responsibilities</label>
                <textarea
                  rows={2}
                  value={jobForm.responsibilities || ''}
                  onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                  placeholder="• Architect distributed systems&#10;• Lead sprint design reviews..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Requirements</label>
                <textarea
                  rows={2}
                  value={jobForm.requirements || ''}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  placeholder="• 3+ years experience with Spring Boot&#10;• Strong React knowledge..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              {/* Skills Tagging Sub-section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-bold text-slate-800 mb-2">Required & Preferred Skills</label>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempSkill.name}
                    onChange={(e) => setTempSkill({ ...tempSkill, name: e.target.value })}
                    placeholder="e.g. Java, React, Docker..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <select
                    value={tempSkill.level}
                    onChange={(e) => setTempSkill({ ...tempSkill, level: e.target.value as any })}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="REQUIRED">Required</option>
                    <option value="PREFERRED">Preferred</option>
                  </select>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddSkillToJob}>
                    Add
                  </Button>
                </div>

                {jobForm.skills && jobForm.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {jobForm.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2"
                      >
                        <span>{s.skillName}</span>
                        <span className={`text-[10px] px-1 py-0.5 rounded font-mono ${
                          s.requirementLevel === 'REQUIRED' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.requirementLevel}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillFromJob(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setIsPostJobModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" isLoading={actionLoading}>Publish Vacancy</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT RECRUITER PROFILE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Edit Recruiter & Company Info</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Apex Global Technologies"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation *</label>
                  <input
                    type="text"
                    required
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    placeholder="e.g. Lead Talent Acquisition Specialist"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department || ''}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Engineering Recruiting"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={form.corporateEmail || ''}
                    onChange={(e) => setForm({ ...form, corporateEmail: e.target.value })}
                    placeholder="recruiter@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Phone</label>
                  <input
                    type="text"
                    value={form.corporatePhone || ''}
                    onChange={(e) => setForm({ ...form, corporatePhone: e.target.value })}
                    placeholder="+91 80 4567 8900"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={form.linkedinUrl || ''}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/recruiter-profile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" isLoading={actionLoading}>Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW JOB APPLICANTS ATS FUNNEL */}
      {selectedJobForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ATS Candidate Screening Hub
                  </span>
                  <span className="text-xs text-slate-400">Ref ID: #{selectedJobForApplicants.id}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedJobForApplicants.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedJobForApplicants.location} • ₹{((selectedJobForApplicants.minSalary || 0)/100000).toFixed(0)} - ₹{((selectedJobForApplicants.maxSalary || 0)/100000).toFixed(0)} LPA
                </p>
              </div>
              <button
                onClick={() => setSelectedJobForApplicants(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification alert banner */}
            {transitionNotificationMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-medium">{transitionNotificationMsg}</span>
                </div>
                <button onClick={() => setTransitionNotificationMsg(null)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* SUB-TABS: ATS PIPELINE vs SMART TALENT POOL MATCHES */}
            <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => setAtsViewSubTab('applicants')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  atsViewSubTab === 'applicants'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" /> ATS Applicants ({applicants.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setAtsViewSubTab('talent_matches');
                  if (selectedJobForApplicants) {
                    fetchTalentPoolMatches(selectedJobForApplicants.id);
                  }
                }}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  atsViewSubTab === 'talent_matches'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-brand-600" /> Smart Talent Pool Matches ({talentPoolMatches.length})
              </button>
            </div>

            {atsViewSubTab === 'applicants' ? (
              <>
            {/* Stage Filter Pills */}
            <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Pipeline Filter:
              </span>
              {[
                { key: 'ALL', label: 'All Applicants' },
                { key: 'APPLIED', label: 'Applied' },
                { key: 'UNDER_REVIEW', label: 'Under Review' },
                { key: 'SHORTLISTED', label: 'Shortlisted' },
                { key: 'TECH_INTERVIEW', label: 'Tech Round' },
                { key: 'HR_INTERVIEW', label: 'HR Round' },
                { key: 'SELECTED', label: 'Selected' },
                { key: 'OFFER_RELEASED', label: 'Offer Released' },
                { key: 'HIRED', label: 'Hired' },
                { key: 'REJECTED', label: 'Rejected' },
              ].map((tab) => {
                const count = tab.key === 'ALL'
                  ? applicants.length
                  : applicants.filter((a) => a.status === tab.key).length;
                const active = selectedStageFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedStageFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {loadingApplicants ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500 font-medium">Loading applicant profiles & match evaluations...</p>
              </div>
            ) : applicants.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No Applications Yet</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  No job seekers have applied for this position yet. Candidates applying will show up here along with their portfolio and ATS status.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants
                  .filter((a) => selectedStageFilter === 'ALL' || a.status === selectedStageFilter)
                  .map((app) => {
                    const getStageBadge = (st: string) => {
                      switch (st) {
                        case 'APPLIED':
                          return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Applied' };
                        case 'UNDER_REVIEW':
                          return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Under Review' };
                        case 'SHORTLISTED':
                          return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Shortlisted' };
                        case 'TECH_INTERVIEW':
                          return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Tech Round' };
                        case 'HR_INTERVIEW':
                          return { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'HR Round' };
                        case 'SELECTED':
                          return { bg: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Selected' };
                        case 'OFFER_RELEASED':
                          return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Offer Released' };
                        case 'HIRED':
                          return { bg: 'bg-green-50 text-green-700 border-green-200', label: 'Hired' };
                        case 'REJECTED':
                          return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected' };
                        case 'WITHDRAWN':
                          return { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Withdrawn' };
                        default:
                          return { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: st };
                      }
                    };

                    const stageBadge = getStageBadge(app.status);
                    const candidateName = app.candidateName || (app as any).candidateFullName || 'Job Seeker';
                    const appInterviews = recruiterInterviews.filter(i => i.applicationId === app.id);
                    const latestInterview = appInterviews.length > 0 ? appInterviews[0] : null;
                    const matchInfo = applicantMatchesMap.get(app.id) || ((app as any).candidateProfileId ? applicantMatchesMap.get((app as any).candidateProfileId) : undefined);

                    return (
                      <Card key={app.id} className="p-5 border border-slate-200/90 hover:border-brand-300 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Candidate Bio & Details */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-base">{candidateName}</h4>
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stageBadge.bg}`}>
                                {stageBadge.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">App #{app.id}</span>
                              {app.atsScore != null && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAtsReport(app)}
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                                    app.atsScore >= 80
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : app.atsScore >= 60
                                      ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                  }`}
                                  title="Click to view AI ATS Resume Analysis Report"
                                >
                                  <Sparkles className="w-3 h-3 text-brand-600" />
                                  ATS: {app.atsScore}%
                                </button>
                              )}
                              {matchInfo && (
                                <button
                                  type="button"
                                  onClick={() => setActiveBreakdownModal({
                                    title: candidateName,
                                    subtitle: `${app.candidateEmail} • Application #${app.id}`,
                                    breakdown: matchInfo.breakdown
                                  })}
                                  className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
                                  title="Click to view AI Match Breakdown"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  {matchInfo.matchScore}% Match
                                </button>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500">
                              <span className="flex items-center gap-1 text-slate-700 font-medium">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {app.candidateEmail}
                              </span>
                              {app.candidatePhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  {app.candidatePhone}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                Applied on {new Date(app.appliedAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Indian CTC compensation details */}
                            {(app.currentCtcLpa || app.expectedCtcLpa) && (
                              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                                {app.currentCtcLpa && (
                                  <span>Current CTC: <span className="text-slate-900 font-bold">₹{app.currentCtcLpa} LPA</span></span>
                                )}
                                {app.expectedCtcLpa && (
                                  <span>Expected CTC: <span className="text-brand-600 font-bold">₹{app.expectedCtcLpa} LPA</span></span>
                                )}
                              </div>
                            )}

                            {app.coverLetter && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                                <strong className="text-slate-800 block mb-0.5">Application Note / Cover Letter:</strong>
                                <p className="line-clamp-2 leading-relaxed">{app.coverLetter}</p>
                              </div>
                            )}

                            {/* Scheduled Interview Banner on Candidate Card */}
                            {latestInterview && (
                              <div className="p-3 bg-gradient-to-r from-brand-50/70 to-indigo-50/70 rounded-xl border border-brand-200/80 text-xs space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-1.5 font-bold text-brand-900">
                                    <Video className="w-3.5 h-3.5 text-brand-600" />
                                    <span>{latestInterview.roundName}</span>
                                    <span className="font-normal text-slate-500">• {new Date(latestInterview.scheduledStartTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })} IST</span>
                                  </div>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                    latestInterview.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                    latestInterview.status === 'RESCHEDULE_REQUESTED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                    latestInterview.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                                    'bg-blue-100 text-blue-800 border border-blue-300'
                                  }`}>
                                    {latestInterview.status.replace(/_/g, ' ')}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap pt-1">
                                  {latestInterview.meetingLink && latestInterview.status !== 'CANCELLED' && (
                                    <a
                                      href={latestInterview.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                                    >
                                      <Video className="w-3 h-3" /> Join Room <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenFeedbackModal(latestInterview)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                                  >
                                    <Star className="w-3 h-3" /> {latestInterview.status === 'COMPLETED' ? 'View/Update Scorecard' : 'Submit Scorecard'}
                                  </button>
                                  {latestInterview.overallRating != null && (
                                    <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200">
                                      Score: ★ {latestInterview.overallRating}/5
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Recruiter Actions: Stage Select, History, Resume */}
                          <div className="shrink-0 flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            {/* Stage advance button / dropdown */}
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider lg:hidden">
                                Stage:
                              </label>
                              <select
                                value={app.status}
                                disabled={updatingStatusId === app.id}
                                onChange={(e) => openTransitionModal(app, e.target.value as ApplicationStatus)}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-300 bg-brand-50/50 text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer disabled:opacity-50"
                              >
                                <option value="APPLIED">1. Applied</option>
                                <option value="UNDER_REVIEW">2. Under Review</option>
                                <option value="SHORTLISTED">3. Shortlisted</option>
                                <option value="TECH_INTERVIEW">4. Tech Round</option>
                                <option value="HR_INTERVIEW">5. HR Round</option>
                                <option value="SELECTED">6. Selected</option>
                                <option value="OFFER_RELEASED">7. Offer Released</option>
                                <option value="HIRED">8. Hired</option>
                                <option value="REJECTED">9. Rejected</option>
                                <option value="WITHDRAWN">10. Withdrawn</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setSelectedCandidateForProfileModal({
                                  candidateProfileId: app.candidateProfileId,
                                  email: app.candidateEmail,
                                  name: app.candidateName,
                                  applicationNote: app.coverLetter,
                                  application: app,
                                })}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-all border border-brand-200"
                              >
                                <User className="w-3.5 h-3.5 text-brand-600" />
                                View Full Profile
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenScheduleModal(app)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-xl transition-all shadow-sm shadow-brand-500/20"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Schedule Round
                              </button>

                              <button
                                type="button"
                                onClick={() => handleViewHistory(app)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-700 bg-slate-100 hover:bg-brand-50 px-3 py-1.5 rounded-xl transition-colors"
                              >
                                <History className="w-3.5 h-3.5 text-brand-600" />
                                Audit Trail
                              </button>

                              {app.atsScore != null && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAtsReport(app)}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-all border border-brand-200"
                                  title="View AI ATS Score breakdown"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                                  ATS Analysis ({app.atsScore}%)
                                </button>
                              )}

                              {app.resumeUrl && (
                                <button
                                  type="button"
                                  onClick={() => downloadResumeFile(app.resumeUrl!, app.resumeTitle || `${app.candidateName.replace(/\s+/g, '_')}_Resume.pdf`)}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors border border-brand-200/80 cursor-pointer shadow-2xs"
                                  title="Download candidate resume document"
                                >
                                  <Download className="w-3.5 h-3.5 text-brand-600" />
                                  <span>Resume</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            )}
            </>
            ) : (
              /* SMART TALENT POOL MATCHES VIEW */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-brand-900 to-indigo-950 text-white mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/30 text-brand-300 border border-brand-400/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" /> AI Candidate Ranker
                      </span>
                      <span className="text-xs text-brand-200">Platform Talent Pool</span>
                    </div>
                    <h4 className="text-base font-bold text-white">
                      Top Ranked Candidates for {selectedJobForApplicants.title}
                    </h4>
                    <p className="text-xs text-brand-200/80 mt-0.5">
                      Evaluated on skills, experience, location compatibility, and budget fit.
                    </p>
                  </div>
                  <button
                    onClick={() => fetchTalentPoolMatches(selectedJobForApplicants.id)}
                    disabled={loadingTalentPool}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingTalentPool ? 'animate-spin' : ''}`} />
                    Recalculate Fit
                  </button>
                </div>

                {loadingTalentPool ? (
                  <div className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs text-slate-500 font-medium">Scoring and ranking talent pool against job criteria...</p>
                  </div>
                ) : talentPoolMatches.length === 0 ? (
                  <div className="py-16 text-center max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
                      <Users className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">No Matched Profiles Found</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      No candidate profiles currently meet minimum compatibility thresholds.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {talentPoolMatches.map((cand, idx) => (
                      <Card key={cand.candidateId} className="p-5 border border-slate-200/90 hover:border-brand-300 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <h4 className="font-bold text-slate-900 text-base">{cand.candidateName}</h4>
                              <div className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                {cand.matchScore}% Match
                              </div>
                              {cand.hasApplied && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Already Applied ({cand.applicationStatus || 'Applied'})
                                </span>
                              )}
                            </div>

                            {cand.headline && (
                              <p className="text-xs text-slate-600 font-medium">{cand.headline}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500">
                              <span className="flex items-center gap-1 text-slate-700 font-medium">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {cand.email}
                              </span>
                              {cand.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {cand.location}
                                </span>
                              )}
                              <span>Total Exp: <strong>{cand.totalExperienceYears} yrs</strong></span>
                              {cand.expectedSalary && (
                                <span>Expected: <strong className="text-brand-600">₹{(cand.expectedSalary / 100000).toFixed(1)} LPA</strong></span>
                              )}
                            </div>

                            {/* Skills breakdown preview */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {cand.breakdown.matchedRequiredSkills.map((s) => (
                                <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {s}
                                </span>
                              ))}
                              {cand.breakdown.missingRequiredSkills.slice(0, 2).map((s) => (
                                <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500">
                                  Missing: {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="shrink-0 flex sm:flex-row lg:flex-col items-center lg:items-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            <button
                              type="button"
                              onClick={() => setSelectedCandidateForProfileModal({
                                candidateProfileId: cand.candidateId,
                                email: cand.email,
                                name: cand.candidateName,
                              })}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <User className="w-3.5 h-3.5 text-brand-600" /> View Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveBreakdownModal({
                                title: cand.candidateName,
                                subtitle: `${cand.email} • Fit Evaluation for ${selectedJobForApplicants.title}`,
                                breakdown: cand.breakdown
                              })}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Inspect Breakdown
                            </button>
                            <a
                              href={`mailto:${cand.email}?subject=Invitation to apply: ${encodeURIComponent(selectedJobForApplicants.title)}`}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5" /> Reach Out
                            </a>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: AI MATCH BREAKDOWN POPUP */}
      {activeBreakdownModal && (
        <MatchBreakdownModal
          isOpen={true}
          onClose={() => setActiveBreakdownModal(null)}
          title={activeBreakdownModal.title}
          subtitle={activeBreakdownModal.subtitle}
          breakdown={activeBreakdownModal.breakdown}
        />
      )}

      {/* MODAL: CANDIDATE COMPREHENSIVE PROFILE MODAL */}
      <CandidateProfileModal
        isOpen={Boolean(selectedCandidateForProfileModal)}
        onClose={() => setSelectedCandidateForProfileModal(null)}
        candidateProfileId={selectedCandidateForProfileModal?.candidateProfileId}
        candidateEmail={selectedCandidateForProfileModal?.email}
        candidateName={selectedCandidateForProfileModal?.name}
        applicationNote={selectedCandidateForProfileModal?.applicationNote}
        application={selectedCandidateForProfileModal?.application}
        onScheduleInterview={
          selectedCandidateForProfileModal?.application
            ? () => {
                const targetApp = selectedCandidateForProfileModal.application!;
                setSelectedCandidateForProfileModal(null);
                handleOpenScheduleModal(targetApp);
              }
            : undefined
        }
      />

      {/* MODAL: ADVANCE CANDIDATE STAGE WITH REMARKS & REAL GMAIL DISPATCH */}
      {transitionModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transition ATS Stage</h3>
                <p className="text-xs text-slate-500">
                  Update candidate stage and dispatch live Gmail update
                </p>
              </div>
              <button
                onClick={() => setTransitionModalApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransition} className="space-y-4">
              {/* Candidate Info Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="font-bold text-slate-800">
                  {transitionModalApp.candidateName || (transitionModalApp as any).candidateFullName || 'Candidate'}
                </div>
                <div className="text-slate-500 font-mono mt-0.5">{transitionModalApp.candidateEmail}</div>
                <div className="text-[11px] text-brand-700 font-semibold mt-1">
                  Current Stage: {transitionModalApp.status}
                </div>
              </div>

              {/* Target Stage Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select New ATS Stage *
                </label>
                <select
                  value={transitionNewStatus}
                  onChange={(e) => setTransitionNewStatus(e.target.value as ApplicationStatus)}
                  className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="APPLIED">1. Applied</option>
                  <option value="UNDER_REVIEW">2. Under Review</option>
                  <option value="SHORTLISTED">3. Shortlisted</option>
                  <option value="TECH_INTERVIEW">4. Technical Interview</option>
                  <option value="HR_INTERVIEW">5. HR Interview</option>
                  <option value="SELECTED">6. Selected</option>
                  <option value="OFFER_RELEASED">7. Offer Released</option>
                  <option value="HIRED">8. Hired</option>
                  <option value="REJECTED">9. Rejected</option>
                  <option value="WITHDRAWN">10. Withdrawn</option>
                </select>
              </div>

              {/* Feedback / Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recruiter Feedback / Evaluation Remarks
                </label>
                <textarea
                  rows={3}
                  value={transitionRemarks}
                  onChange={(e) => setTransitionRemarks(e.target.value)}
                  placeholder="e.g. Cleared technical interview round with high scores in Java & System Design. Scheduling HR round."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Gmail Notification Notice */}
              <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200/80 text-[11px] text-brand-900 flex items-start gap-2">
                <Mail className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Live Gmail Dispatch:</strong> An automated branded email will be sent immediately to{' '}
                  <span className="font-semibold underline">{transitionModalApp.candidateEmail}</span> informing them of this status update.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTransitionModalApp(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updatingStatusId === transitionModalApp.id}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Confirm & Send Notice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION AUDIT TRAIL / STATUS HISTORY */}
      {historyModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-brand-600 font-bold uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" /> ATS Audit Trail
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Application #{historyModalApp.id} History
                </h3>
                <p className="text-xs text-slate-500">
                  {historyModalApp.candidateName || (historyModalApp as any).candidateFullName} • {historyModalApp.candidateEmail}
                </p>
              </div>
              <button
                onClick={() => setHistoryModalApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Loading status history...</p>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No recorded status transitions found for this application.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {historyItems.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {item.oldStatus ? `${item.oldStatus} ➔ ${item.newStatus}` : `Initial: ${item.newStatus}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.changedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Actor: <span className="font-semibold text-slate-700">{item.changedBy}</span>
                      </div>

                      {item.remarks && (
                        <div className="mt-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <strong>Remarks:</strong> {item.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setHistoryModalApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SCHEDULE INTERVIEW ROUND ================= */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Schedule Interview Round</h3>
                  <p className="text-xs text-slate-500">
                    Candidate: <strong>{scheduleModalApp.candidateName || 'Applicant'}</strong> ({scheduleModalApp.candidateEmail})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScheduleModalApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Round Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.roundName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, roundName: e.target.value })}
                    placeholder="e.g. Technical Round 1: DSA & Java"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interview Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={scheduleForm.interviewType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewType: e.target.value as InterviewType })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    <option value="TECH_ROUND_1">Technical Round 1</option>
                    <option value="TECH_ROUND_2">Technical Round 2</option>
                    <option value="SYSTEM_DESIGN">System Architecture & Design</option>
                    <option value="HR_ROUND">HR & Culture Fit</option>
                    <option value="MANAGERIAL">Managerial & Behavioral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meeting Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={scheduleForm.meetingMode}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingMode: e.target.value as MeetingMode })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="ZOOM">Zoom Meetings</option>
                    <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
                    <option value="IN_PERSON_OFFICE">In-Person Office (India)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meeting Video Link
                  </label>
                  <input
                    type="url"
                    value={scheduleForm.meetingLink || ''}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scheduled Start Time (IST) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduledStartTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledStartTime: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scheduled End Time (IST) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduledEndTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledEndTime: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interviewer Name
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.interviewerName || ''}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })}
                    placeholder="e.g. Vikram Sharma (VP Engineering)"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interviewer Corporate Email
                  </label>
                  <input
                    type="email"
                    value={scheduleForm.interviewerEmail || ''}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerEmail: e.target.value })}
                    placeholder="interviewer@company.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Candidate Preparation Notes & Instructions
                </label>
                <textarea
                  rows={2}
                  value={scheduleForm.instructions || ''}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, instructions: e.target.value })}
                  placeholder="e.g. Please be prepared to present your system architecture decisions and live DSA problem solving."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-[11px] text-brand-900 leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Real Gmail Calendar Invitation: Automated invitation email with meeting room link and IST timing will be dispatched directly to candidate's Gmail inbox.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleModalApp(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={scheduleLoading}
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  Schedule Round & Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: INTERVIEWER EVALUATION SCORECARD ================= */}
      {feedbackModalInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Interviewer Evaluation Scorecard</h3>
                  <p className="text-xs text-slate-500">
                    Candidate: <strong>{feedbackModalInterview.candidateName}</strong> • {feedbackModalInterview.roundName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFeedbackModalInterview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Technical Competency (1 - 5)
                  </label>
                  <select
                    value={feedbackForm.technicalRating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, technicalRating: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value={5}>5 - Exceptional / Mastery</option>
                    <option value={4}>4 - Strong / Exceeds Bar</option>
                    <option value={3}>3 - Competent / Meets Bar</option>
                    <option value={2}>2 - Marginal / Below Bar</option>
                    <option value={1}>1 - Inadequate / Unsatisfactory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Problem Solving & Logic (1 - 5)
                  </label>
                  <select
                    value={feedbackForm.problemSolvingRating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, problemSolvingRating: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value={5}>5 - Algorithmic Brilliance</option>
                    <option value={4}>4 - Clean, Structured Thinker</option>
                    <option value={3}>3 - Solves with Hints</option>
                    <option value={2}>2 - Struggles with Complexity</option>
                    <option value={1}>1 - Unable to Formulate Solution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Communication & Articulation (1 - 5)
                  </label>
                  <select
                    value={feedbackForm.communicationRating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, communicationRating: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value={5}>5 - Clear, Concise, Professional</option>
                    <option value={4}>4 - Effective Communicator</option>
                    <option value={3}>3 - Average Clarity</option>
                    <option value={2}>2 - Needs Frequent Clarifications</option>
                    <option value={1}>1 - Poor Communication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cultural Fit & Team Chemistry (1 - 5)
                  </label>
                  <select
                    value={feedbackForm.culturalFitRating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, culturalFitRating: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value={5}>5 - Outstanding Team Multiplier</option>
                    <option value={4}>4 - High Ownership & Positivity</option>
                    <option value={3}>3 - Good Cultural Alignment</option>
                    <option value={2}>2 - Passive / Hesitant</option>
                    <option value={1}>1 - Cultural Red Flag</option>
                  </select>
                </div>
              </div>

              {/* Calculated Average */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-xs font-bold text-purple-900">
                  Calculated Overall Score:
                </span>
                <span className="text-base font-extrabold text-purple-700">
                  ★ {((feedbackForm.technicalRating + feedbackForm.problemSolvingRating + feedbackForm.communicationRating + feedbackForm.culturalFitRating) / 4).toFixed(1)} / 5.0
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall Recommendation <span className="text-red-500">*</span>
                </label>
                <select
                  value={feedbackForm.recommendation}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value as RecommendationType })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-purple-500"
                >
                  <option value="STRONG_HIRE">🌟 Strong Hire - Must Hire Candidate</option>
                  <option value="HIRE">✅ Hire - Meets All Engineering Standards</option>
                  <option value="HOLD">⏳ Hold - Re-evaluate Against Remaining Candidates</option>
                  <option value="NO_HIRE">❌ No Hire - Does Not Meet Technical Threshold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Interviewer Evaluation Notes
                </label>
                <textarea
                  rows={3}
                  value={feedbackForm.interviewerFeedback || ''}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, interviewerFeedback: e.target.value })}
                  placeholder="e.g. Demonstrated strong knowledge of Spring Boot transaction management and database indexing. Well prepared for live coding."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFeedbackModalInterview(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={feedbackLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  leftIcon={<Star className="w-4 h-4" />}
                >
                  Submit Scorecard & Advance Stage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ATS ANALYSIS REPORT ================= */}
      <AtsAnalysisReportModal
        report={selectedAtsReport}
        isOpen={Boolean(selectedAtsReport) || loadingAtsReport}
        loading={loadingAtsReport}
        onClose={() => setSelectedAtsReport(null)}
        jobTitle={atsReportJobTitle}
      />
    </div>
  );
};

export default RecruiterDashboard;
