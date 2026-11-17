import React, { useState, useEffect } from 'react';
import {
  User, Briefcase, GraduationCap, Award, FileText, Plus, Trash2, Edit3,
  ExternalLink, Mail, Phone, MapPin,
  CheckCircle2, Star, Sparkles, X, AlertCircle, ArrowLeft, LogIn, Send, Clock, Check,
  History, Video, Calendar, AlertTriangle, RefreshCw, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import profileService, {
  CandidateProfile,
  Education,
  Experience,
  UpdateCandidateProfilePayload
} from '../services/profileService';
import { applicationService } from '../services/applicationService';
import { ApplicationResponse, ApplicationStatusHistoryItem, AtsAnalysisReport } from '../types/application';
import { interviewService } from '../services/interviewService';
import { InterviewResponse } from '../types/interview';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { RecommendedJobsSection } from '../components/matching/RecommendedJobsSection';
import { CandidateProfileFullView } from '../components/candidate/CandidateProfileFullView';
import { AtsAnalysisReportModal } from '../components/ats/AtsAnalysisReportModal';

interface CandidateDashboardProps {
  onBackToHome?: () => void;
  onOpenAtsScanner?: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onBackToHome, onOpenAtsScanner }) => {
  const { user, isAuthenticated, login, logout, openAuthModal } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'experience' | 'education' | 'skills' | 'resumes' | 'applications' | 'interviews'>('overview');
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Interview Scheduling state
  const [interviews, setInterviews] = useState<InterviewResponse[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [rescheduleModalInterview, setRescheduleModalInterview] = useState<InterviewResponse | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [confirmingInterviewId, setConfirmingInterviewId] = useState<number | null>(null);
  const [interviewFeedbackMsg, setInterviewFeedbackMsg] = useState<string | null>(null);

  // Application Status History state
  const [historyModalApp, setHistoryModalApp] = useState<ApplicationResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<ApplicationStatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleViewApplicationHistory = async (app: ApplicationResponse) => {
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

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isAddEduOpen, setIsAddEduOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isUploadResumeOpen, setIsUploadResumeOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState<UpdateCandidateProfilePayload>({});
  const [expForm, setExpForm] = useState<Omit<Experience, 'id'>>({
    companyName: '',
    jobTitle: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });
  const [eduForm, setEduForm] = useState<Omit<Education, 'id'>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
    description: ''
  });
  const [skillForm, setSkillForm] = useState({
    skillName: '',
    proficiencyLevel: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT',
    yearsOfExperience: 2.0
  });
  const [resumeForm, setResumeForm] = useState({
    title: '',
    fileName: '',
    filePath: '',
    isPrimary: true
  });

  // ATS Report Modal state
  const [selectedAtsReport, setSelectedAtsReport] = useState<AtsAnalysisReport | null>(null);
  const [loadingAtsReport, setLoadingAtsReport] = useState(false);
  const [atsReportJobTitle, setAtsReportJobTitle] = useState('');

  // Device file upload state
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getCandidateProfile();
      setProfile(data);
      setProfileForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        headline: data.headline || '',
        bio: data.bio || '',
        location: data.location || '',
        totalExperienceYears: data.totalExperienceYears || 0,
        currentSalary: data.currentSalary || 0,
        expectedSalary: data.expectedSalary || 0,
        websiteUrl: data.websiteUrl || '',
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || ''
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      if (err?.response?.status === 401) {
        logout();
        setError('Your session has expired. Please log in again.');
      } else if (err?.response?.status === 403) {
        setError('Access restricted: This portal is for Job Seekers. You are currently logged in with a different role.');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Unable to load candidate profile. Please check connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const data = await applicationService.getMyApplications();
      setApplications(data || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      setLoadingInterviews(true);
      const data = await interviewService.getMyCandidateInterviews();
      setInterviews(data || []);
    } catch (err: any) {
      console.error('Error fetching interviews:', err);
    } finally {
      setLoadingInterviews(false);
    }
  };

  const handleConfirmAttendance = async (interviewId: number) => {
    try {
      setConfirmingInterviewId(interviewId);
      await interviewService.updateStatus(interviewId, { status: 'CONFIRMED' });
      setInterviewFeedbackMsg('Attendance confirmed successfully! The hiring team has been notified via Gmail.');
      setTimeout(() => setInterviewFeedbackMsg(null), 6000);
      await fetchInterviews();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to confirm attendance. Please try again.');
    } finally {
      setConfirmingInterviewId(null);
    }
  };

  const handleOpenRescheduleModal = (interview: InterviewResponse) => {
    setRescheduleModalInterview(interview);
    setRescheduleReason('');
    setRescheduleNotes('');
  };

  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalInterview) return;
    if (!rescheduleReason.trim()) {
      alert('Please specify the reason or alternate timing preference for rescheduling.');
      return;
    }
    try {
      setRescheduleLoading(true);
      await interviewService.updateStatus(rescheduleModalInterview.id, {
        status: 'RESCHEDULE_REQUESTED',
        rescheduleReason: rescheduleReason.trim(),
        candidateNotes: rescheduleNotes.trim()
      });
      setInterviewFeedbackMsg('Reschedule request submitted! The recruiter will review your preferred time slots.');
      setTimeout(() => setInterviewFeedbackMsg(null), 6000);
      setRescheduleModalInterview(null);
      await fetchInterviews();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit reschedule request.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const formatISTDate = (isoString?: string) => {
    if (!isoString) return 'TBD';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const formatISTTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchApplications();
      fetchInterviews();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await profileService.updateCandidateProfile(profileForm);
      await fetchProfile();
      setIsEditProfileOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Experience
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.companyName || !expForm.jobTitle) return;
    try {
      setActionLoading(true);
      await profileService.addExperience(expForm);
      await fetchProfile();
      setIsAddExpOpen(false);
      setExpForm({
        companyName: '',
        jobTitle: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add experience');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Experience
  const handleDeleteExperience = async (id: number) => {
    if (!confirm('Are you sure you want to remove this work experience?')) return;
    try {
      await profileService.deleteExperience(id);
      await fetchProfile();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete experience');
    }
  };

  // Add Education
  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.institution || !eduForm.degree) return;
    try {
      setActionLoading(true);
      await profileService.addEducation(eduForm);
      await fetchProfile();
      setIsAddEduOpen(false);
      setEduForm({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        grade: '',
        description: ''
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add education');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Education
  const handleDeleteEducation = async (id: number) => {
    if (!confirm('Are you sure you want to remove this education record?')) return;
    try {
      await profileService.deleteEducation(id);
      await fetchProfile();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete education');
    }
  };

  // Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.skillName) return;
    try {
      setActionLoading(true);
      await profileService.addSkill(skillForm);
      await fetchProfile();
      setIsAddSkillOpen(false);
      setSkillForm({ skillName: '', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: 2.0 });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add skill');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Skill
  const handleDeleteSkill = async (id: number) => {
    try {
      await profileService.deleteSkill(id);
      await fetchProfile();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to remove skill');
    }
  };

  // Upload Resume (MongoDB file or manual metadata)
  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeFile && (!resumeForm.title || !resumeForm.fileName)) {
      alert('Please select a resume file from your device.');
      return;
    }
    try {
      setActionLoading(true);
      if (selectedResumeFile) {
        const title = resumeForm.title.trim() || selectedResumeFile.name.replace(/\.[^/.]+$/, "");
        await profileService.uploadResumeFile(selectedResumeFile, title, resumeForm.isPrimary);
      } else {
        await profileService.uploadResume({
          title: resumeForm.title,
          fileName: resumeForm.fileName,
          filePath: resumeForm.filePath || `/uploads/resumes/${resumeForm.fileName}`,
          fileSize: 245000,
          contentType: 'application/pdf',
          isPrimary: resumeForm.isPrimary
        });
      }
      await fetchProfile();
      setIsUploadResumeOpen(false);
      setSelectedResumeFile(null);
      setResumeForm({ title: '', fileName: '', filePath: '', isPrimary: true });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to upload resume to MongoDB');
    } finally {
      setActionLoading(false);
    }
  };

  // View ATS Analysis Modal
  const handleViewAtsAnalysis = async (app: ApplicationResponse) => {
    setLoadingAtsReport(true);
    setAtsReportJobTitle(app.jobTitle || 'Job Application');
    try {
      const report = await applicationService.getApplicationAtsAnalysis(app.id);
      setSelectedAtsReport(report);
    } catch (err: any) {
      console.error('Failed to load ATS analysis report:', err);
      setSelectedAtsReport(null);
    } finally {
      setLoadingAtsReport(false);
    }
  };

  // Set Primary Resume
  const handleSetPrimaryResume = async (id: number) => {
    try {
      await profileService.setPrimaryResume(id);
      await fetchProfile();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to set primary resume');
    }
  };

  // Delete Resume
  const handleDeleteResume = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await profileService.deleteResume(id);
      await fetchProfile();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete resume');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-brand-100">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Authentication Required</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Please log in to your candidate account to access your Career Hub, work experiences, skills, and resumes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            leftIcon={<LogIn className="w-4 h-4" />}
            onClick={() => login({ email: 'candidate@talentflow360.com', password: 'Candidate@123' })}
          >
            1-Click Demo Candidate Login
          </Button>
          <Button variant="outline" onClick={() => openAuthModal('login')}>
            Sign In with Email
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium text-sm">Loading your candidate profile and portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 mb-6">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold">Profile Loading Error</h3>
          <p className="text-sm mt-1 text-rose-700">{error || 'Unable to find candidate profile'}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" onClick={fetchProfile}>
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => login({ email: 'candidate@talentflow360.com', password: 'Candidate@123' }).then(() => fetchProfile())}
          >
            1-Click Demo Candidate Login
          </Button>
        </div>
      </div>
    );
  }

  const completionScore = Math.min(
    100,
    (profile.headline ? 20 : 0) +
    (profile.bio ? 20 : 0) +
    (profile.experiences.length > 0 ? 20 : 0) +
    (profile.educations.length > 0 ? 20 : 0) +
    (profile.skills.length > 0 ? 10 : 0) +
    (profile.resumes.length > 0 ? 10 : 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Portal
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Career Hub
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your personal profile, credentials, ATS matching skills, and verified resumes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-brand-600" />}
            onClick={() => setIsEditProfileOpen(true)}
          >
            Edit Profile Info
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsUploadResumeOpen(true)}
          >
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-900/10 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-400 to-indigo-400 p-1 shadow-lg shrink-0">
              <div className="w-full h-full bg-brand-900 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl uppercase">
                {profile.firstName ? profile.firstName.charAt(0) : 'C'}
                {profile.lastName ? profile.lastName.charAt(0) : 'P'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {profile.fullName || `${profile.firstName} ${profile.lastName}`}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Job Seeker Active
                </span>
              </div>

              <p className="text-brand-100 text-sm font-medium mt-1">
                {profile.headline || 'Full Stack Software Engineer'}
              </p>

              <div className="flex items-center gap-4 text-xs text-brand-200/80 mt-3 flex-wrap">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-300" /> {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-brand-300" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-300" /> {profile.phone}
                  </span>
                )}
                {profile.totalExperienceYears !== undefined && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-brand-300" /> {profile.totalExperienceYears} yrs experience
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Strength Widget */}
          <div className="w-full md:w-64 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-brand-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Profile Strength
              </span>
              <span className="text-amber-300 font-bold">{completionScore}%</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${completionScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-brand-200 mt-2">
              {completionScore === 100
                ? 'All sections complete! High visibility with recruiters.'
                : 'Complete all sections to maximize your ATS match score.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> Complete Profile
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-brand-600" /> Recommended Jobs 🎯
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'experience'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Experience ({profile.experiences.length})
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'education'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Education ({profile.educations.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'skills'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> Skills ({profile.skills.length})
        </button>
        <button
          onClick={() => setActiveTab('resumes')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'resumes'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Resumes ({profile.resumes.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('applications');
            fetchApplications();
          }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'applications'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" /> My Applications ({applications.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('interviews');
            fetchInterviews();
          }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'interviews'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Video className="w-4 h-4 text-brand-600" /> Interviews & Schedules ({interviews.length})
        </button>
      </div>

      {/* TAB 1: COMPLETE CANDIDATE PROFILE */}
      {activeTab === 'overview' && (
        <CandidateProfileFullView
          profile={profile}
          isOwner={true}
          showHeaderBanner={false}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
        />
      )}

      {/* TAB 2: WORK EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Work Experience</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4 text-brand-600" />}
              onClick={() => setIsAddExpOpen(true)}
            >
              Add Work Experience
            </Button>
          </div>

          {profile.experiences.length === 0 ? (
            <Card className="p-6 text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-sm">No work experience added yet.</p>
              <p className="text-slate-400 text-xs mt-1 mb-4">Add your career milestones to stand out to hiring managers.</p>
              <Button size="sm" onClick={() => setIsAddExpOpen(true)}>Add Experience</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {profile.experiences.map((exp) => (
                <Card key={exp.id} className="p-6 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">{exp.jobTitle}</h4>
                        <span className="text-sm font-semibold text-brand-600">@ {exp.companyName}</span>
                        {exp.isCurrent && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Current Role
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span>{exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}</span>
                        {exp.location && <span>• {exp.location}</span>}
                      </div>

                      {exp.description && (
                        <p className="text-slate-600 text-xs mt-3 leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => exp.id && handleDeleteExperience(exp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EDUCATION */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Education History</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4 text-brand-600" />}
              onClick={() => setIsAddEduOpen(true)}
            >
              Add Education
            </Button>
          </div>

          {profile.educations.length === 0 ? (
            <Card className="p-6 text-center py-12">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-sm">No education records added yet.</p>
              <p className="text-slate-400 text-xs mt-1 mb-4">List your academic degrees, certifications, or diplomas.</p>
              <Button size="sm" onClick={() => setIsAddEduOpen(true)}>Add Education</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {profile.educations.map((edu) => (
                <Card key={edu.id} className="p-6 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">{edu.degree}</h4>
                        {edu.fieldOfStudy && (
                          <span className="text-sm font-semibold text-slate-600">in {edu.fieldOfStudy}</span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-brand-700 mt-0.5">{edu.institution}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span>{edu.startDate} — {edu.endDate || 'Completed'}</span>
                        {edu.grade && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                            {edu.grade}
                          </span>
                        )}
                      </div>

                      {edu.description && (
                        <p className="text-slate-600 text-xs mt-3 leading-relaxed whitespace-pre-line">
                          {edu.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => edu.id && handleDeleteEducation(edu.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete education"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SKILLS & PROFICIENCIES */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Technical & Professional Skills</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Skills are evaluated by our Smart ATS Matching Engine to calculate job fit score.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4 text-brand-600" />}
              onClick={() => setIsAddSkillOpen(true)}
            >
              Add New Skill
            </Button>
          </div>

          {profile.skills.length === 0 ? (
            <Card className="p-6 text-center py-12">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-sm">No skills added yet.</p>
              <p className="text-slate-400 text-xs mt-1 mb-4">Add your top technical proficiencies to get matched with jobs.</p>
              <Button size="sm" onClick={() => setIsAddSkillOpen(true)}>Add Skills</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profile.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-brand-400 transition-all"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{skill.skillName}</h5>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        skill.proficiencyLevel === 'EXPERT'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : skill.proficiencyLevel === 'ADVANCED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {skill.proficiencyLevel}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {skill.yearsOfExperience} yrs
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => skill.id && handleDeleteSkill(skill.id)}
                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RESUMES */}
      {activeTab === 'resumes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Resume & Documents</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload up-to-date PDF resumes or craft a job-winning CV with our 10-template AI generator.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 bg-purple-50/50 hover:bg-purple-100 shadow-xs"
                leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
                onClick={() => {
                  window.location.hash = '#resume-builder';
                }}
              >
                Launch AI Builder (10 Templates)
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                className="bg-amber-50 hover:bg-amber-100/80 border-amber-300 text-amber-900 font-bold text-xs"
                onClick={onOpenAtsScanner}
              >
                Scan ATS Score & Mistakes
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsUploadResumeOpen(true)}
              >
                Upload Document
              </Button>
            </div>
          </div>

          {profile.resumes.length === 0 ? (
            <Card className="p-6 text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-sm">No resumes uploaded yet.</p>
              <p className="text-slate-400 text-xs mt-1 mb-4">Craft a tailored resume using our AI builder or upload your existing PDF.</p>
              <div className="flex justify-center gap-3">
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  onClick={() => { window.location.hash = '#resume-builder'; }}
                >
                  Generate AI Resume
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsUploadResumeOpen(true)}>
                  Upload Existing PDF
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {profile.resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`p-5 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    resume.isPrimary ? 'border-brand-500 ring-2 ring-brand-500/10 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{resume.title}</h4>
                        {resume.isPrimary && (
                          <span className="bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-brand-600 text-brand-600" /> Primary Application Resume
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{resume.fileName}</p>
                      <span className="text-[11px] text-slate-400">
                        Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {resume.filePath && (
                      <a
                        href={resume.filePath.startsWith('http') ? resume.filePath : `http://localhost:8080${resume.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 transition-colors"
                        title="Download resume binary from MongoDB datastore"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Download
                      </a>
                    )}
                    {!resume.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSetPrimaryResume(resume.id)}
                      >
                        Make Primary
                      </Button>
                    )}
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Submitted Applications & ATS Pipeline</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of your job applications and recruitment stages across Indian companies.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchApplications}
              isLoading={loadingApplications}
            >
              Refresh Status
            </Button>
          </div>

          {loadingApplications ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Checking your application pipeline status...</p>
            </div>
          ) : applications.length === 0 ? (
            <Card className="p-12 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-100">
                <Send className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">No Applications Submitted Yet</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                You haven't submitted any job applications yet. Browse top vacancies matching your skill set and apply with 1 click!
              </p>
              {onBackToHome && (
                <Button variant="primary" size="sm" onClick={onBackToHome}>
                  Explore Open Vacancies
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'APPLIED':
                      return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: '1. Applied' };
                    case 'UNDER_REVIEW':
                      return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: '2. Under Review' };
                    case 'SHORTLISTED':
                      return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: '3. Shortlisted' };
                    case 'TECH_INTERVIEW':
                      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: '4. Tech Round' };
                    case 'HR_INTERVIEW':
                      return { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: '5. HR Round' };
                    case 'SELECTED':
                      return { bg: 'bg-teal-50 text-teal-700 border-teal-200', label: '6. Selected' };
                    case 'OFFER_RELEASED':
                      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '7. Offer Released' };
                    case 'HIRED':
                      return { bg: 'bg-green-600 text-white border-green-600 font-bold', label: '8. Hired!' };
                    case 'REJECTED':
                      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Not Selected' };
                    case 'WITHDRAWN':
                      return { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Withdrawn' };
                    default:
                      return { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: status };
                  }
                };

                const badge = getStatusBadge(app.status);

                // Ordered progression for happy-path ATS stepper
                const PIPELINE_STAGES = [
                  { key: 'APPLIED', label: 'Applied' },
                  { key: 'UNDER_REVIEW', label: 'Review' },
                  { key: 'SHORTLISTED', label: 'Shortlist' },
                  { key: 'TECH_INTERVIEW', label: 'Tech Round' },
                  { key: 'HR_INTERVIEW', label: 'HR Round' },
                  { key: 'SELECTED', label: 'Selected' },
                  { key: 'OFFER_RELEASED', label: 'Offer' },
                  { key: 'HIRED', label: 'Hired' }
                ];

                const currentStageIdx = PIPELINE_STAGES.findIndex(s => s.key === app.status);

                return (
                  <Card key={app.id} className="p-6 hover:shadow-lg transition-all border border-slate-200/90">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                          <h4 className="font-bold text-slate-900 text-lg">{app.jobTitle}</h4>
                          <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500 mb-4">
                          <span className="font-bold text-slate-800">{app.companyName}</span>
                          {(app.location || (app as any).jobLocation) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {app.location || (app as any).jobLocation}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            Applied on {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Visual 10-Stage ATS Stepper */}
                        {app.status !== 'REJECTED' && app.status !== 'WITHDRAWN' ? (
                          <div className="my-5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                              10-Stage ATS Progression Pipeline
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 relative">
                              {PIPELINE_STAGES.map((st, index) => {
                                const isPassed = currentStageIdx >= 0 && index < currentStageIdx;
                                const isCurrent = index === currentStageIdx;

                                return (
                                  <div key={st.key} className="flex flex-col items-center text-center">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        isPassed
                                          ? 'bg-emerald-500 text-white shadow-sm'
                                          : isCurrent
                                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md animate-pulse'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}
                                    >
                                      {isPassed ? (
                                        <Check className="w-4 h-4 stroke-[3]" />
                                      ) : (
                                        <span>{index + 1}</span>
                                      )}
                                    </div>
                                    <span
                                      className={`text-[10px] mt-1.5 font-semibold leading-tight line-clamp-1 ${
                                        isCurrent
                                          ? 'text-brand-700 font-bold'
                                          : isPassed
                                          ? 'text-emerald-700'
                                          : 'text-slate-400'
                                      }`}
                                    >
                                      {st.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="my-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>
                              <strong>Status: {app.status === 'REJECTED' ? 'Not Selected' : 'Withdrawn'}</strong> - Recruitment for this application has concluded.
                            </span>
                          </div>
                        )}

                        {/* Application Note / Cover Letter */}
                        {app.coverLetter && (
                          <div className="mt-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-slate-600">
                            <span className="font-bold text-slate-700 block mb-0.5">Your Application Note:</span>
                            <p className="line-clamp-2 leading-relaxed">{app.coverLetter}</p>
                          </div>
                        )}

                        {/* Recruiter Remarks */}
                        {app.remarks && (
                          <div className="mt-3 text-xs bg-brand-50/60 p-3 rounded-xl border border-brand-200/80 text-brand-900">
                            <span className="font-bold text-brand-700 block mb-0.5">Recruiter Feedback / Status Update:</span>
                            <p className="leading-relaxed">{app.remarks}</p>
                          </div>
                        )}
                      </div>

                      {/* Right metadata & audit button */}
                      <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5">
                        {app.atsScore != null && (
                          <button
                            type="button"
                            onClick={() => handleViewAtsAnalysis(app)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all border shadow-sm ${
                              app.atsScore >= 80
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : app.atsScore >= 60
                                ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            }`}
                            title="Click to view detailed AI ATS resume match analysis"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                            <span>ATS Match: <strong>{app.atsScore}%</strong></span>
                          </button>
                        )}

                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          Confirmation Email Sent
                        </div>

                        <button
                          type="button"
                          onClick={() => handleViewApplicationHistory(app)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-all border border-brand-200/80 shadow-sm"
                        >
                          <History className="w-3.5 h-3.5 text-brand-600" />
                          View Audit History
                        </button>

                        <span className="text-[10px] text-slate-400 font-mono">
                          Ref: #{app.id}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: INTERVIEWS & SCHEDULES */}
      {activeTab === 'interviews' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-brand-600" />
                Interviews & Round Schedules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live Google Meet / video interview sessions, candidate attendance confirmations, reschedule requests, and technical scorecards.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loadingInterviews ? 'animate-spin' : ''}`} />}
              onClick={fetchInterviews}
              isLoading={loadingInterviews}
            >
              Refresh Schedule
            </Button>
          </div>

          {interviewFeedbackMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-emerald-900 block">Status Synchronized</strong>
                <p className="text-xs text-emerald-700 mt-0.5">{interviewFeedbackMsg}</p>
              </div>
            </div>
          )}

          {loadingInterviews ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Checking your live interview schedule from server...</p>
            </div>
          ) : interviews.length === 0 ? (
            <Card className="p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4 text-brand-600">
                <Video className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">No Scheduled Interviews Yet</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                When recruiters advance your applications to <strong>Technical Interview</strong> or <strong>HR Round</strong>, the date, time, and video meeting link will appear here. You will also receive an invitation directly in your Gmail inbox!
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('applications')}
                >
                  View My Applications
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {interviews.map((item) => {
                const isUpcoming = item.status === 'SCHEDULED' || item.status === 'CONFIRMED' || item.status === 'RESCHEDULE_REQUESTED';
                const isConfirmed = item.status === 'CONFIRMED';
                const isRescheduleRequested = item.status === 'RESCHEDULE_REQUESTED';
                const isCompleted = item.status === 'COMPLETED';
                const isCancelled = item.status === 'CANCELLED';

                return (
                  <Card
                    key={item.id}
                    className={`p-6 border transition-all ${
                      isCompleted
                        ? 'border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/20'
                        : isCancelled
                        ? 'border-slate-200 opacity-75'
                        : isConfirmed
                        ? 'border-emerald-300 shadow-md shadow-emerald-50'
                        : 'border-brand-200 shadow-md shadow-brand-50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Left: Round & Details */}
                      <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-100 text-brand-800 border border-brand-200">
                            {item.roundName}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                            {item.interviewType.replace(/_/g, ' ')}
                          </span>
                          {isConfirmed && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Attendance Confirmed
                            </span>
                          )}
                          {isRescheduleRequested && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Reschedule Requested
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-purple-600" /> Interview Completed
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300">
                              Cancelled
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{item.jobTitle}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {item.companyName} • Application #{item.applicationId}
                          </p>
                        </div>

                        {/* Interview Schedule Timing Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 text-xs">
                          <div>
                            <span className="text-slate-400 block font-semibold mb-0.5 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-brand-600" /> Date & Day:
                            </span>
                            <span className="font-bold text-slate-800">
                              {formatISTDate(item.scheduledStartTime)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold mb-0.5 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand-600" /> Scheduled Time (IST):
                            </span>
                            <span className="font-bold text-brand-700">
                              {formatISTTime(item.scheduledStartTime)} - {formatISTTime(item.scheduledEndTime)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold mb-0.5 flex items-center gap-1">
                              <Video className="w-3.5 h-3.5 text-brand-600" /> Mode:
                            </span>
                            <span className="font-bold text-slate-800">
                              {item.meetingMode.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {item.interviewerName && (
                            <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-slate-200/50 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                              <span><strong>Interviewer:</strong> {item.interviewerName}</span>
                              {item.interviewerEmail && (
                                <span className="text-slate-400">({item.interviewerEmail})</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Instructions */}
                        {item.instructions && (
                          <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-200/70 text-xs text-brand-900">
                            <strong className="block mb-0.5 text-brand-950">Preparation Notes & Instructions:</strong>
                            <p className="leading-relaxed whitespace-pre-line">{item.instructions}</p>
                          </div>
                        )}

                        {/* Reschedule Reason if requested */}
                        {item.rescheduleReason && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                            <strong className="block mb-0.5 text-amber-950 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Your Reschedule Request:
                            </strong>
                            <p className="leading-relaxed">{item.rescheduleReason}</p>
                            {item.candidateNotes && (
                              <p className="text-[11px] text-amber-700 mt-1 italic">Alternate slots: {item.candidateNotes}</p>
                            )}
                          </div>
                        )}

                        {/* Completed Scorecard display */}
                        {isCompleted && item.overallRating != null && (
                          <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-brand-50 rounded-2xl border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-purple-600" /> Evaluator Scorecard & Outcome
                              </span>
                              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                                item.recommendation === 'STRONG_HIRE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                item.recommendation === 'HIRE' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                item.recommendation === 'HOLD' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                'bg-slate-200 text-slate-800'
                              }`}>
                                {item.recommendation ? item.recommendation.replace('_', ' ') : 'COMPLETED'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-center">
                              <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                                <span className="text-[10px] text-slate-500 block">Overall Score</span>
                                <span className="text-base font-extrabold text-brand-700">★ {item.overallRating} / 5</span>
                              </div>
                              <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                                <span className="text-[10px] text-slate-500 block">Technical</span>
                                <span className="text-xs font-bold text-slate-800">{item.technicalRating || '-'}/5</span>
                              </div>
                              <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                                <span className="text-[10px] text-slate-500 block">Problem Solving</span>
                                <span className="text-xs font-bold text-slate-800">{item.problemSolvingRating || '-'}/5</span>
                              </div>
                              <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                                <span className="text-[10px] text-slate-500 block">Communication</span>
                                <span className="text-xs font-bold text-slate-800">{item.communicationRating || '-'}/5</span>
                              </div>
                            </div>

                            {item.interviewerFeedback && (
                              <p className="text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-purple-100 leading-relaxed italic">
                                "{item.interviewerFeedback}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Column: Actions & Video Link */}
                      <div className="shrink-0 flex flex-col gap-3 min-w-[220px]">
                        {/* Video Meeting Callout Button */}
                        {item.meetingLink && !isCancelled && (
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                          >
                            <Video className="w-4 h-4" />
                            Join Video Room
                            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                          </a>
                        )}

                        {/* Confirm attendance button */}
                        {item.status === 'SCHEDULED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            leftIcon={<Check className="w-4 h-4" />}
                            isLoading={confirmingInterviewId === item.id}
                            onClick={() => handleConfirmAttendance(item.id)}
                          >
                            Confirm Attendance
                          </Button>
                        )}

                        {/* Request reschedule */}
                        {isUpcoming && !isRescheduleRequested && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-slate-700 hover:bg-slate-50"
                            leftIcon={<Clock className="w-3.5 h-3.5 text-slate-500" />}
                            onClick={() => handleOpenRescheduleModal(item)}
                          >
                            Request Reschedule
                          </Button>
                        )}

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Timezone:</span>
                            <span className="font-semibold text-slate-700">IST (UTC+5:30)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ref Round:</span>
                            <span className="font-mono text-slate-700">#{item.id}</span>
                          </div>
                          <div className="text-[10px] text-emerald-600 pt-1 border-t border-slate-200/50 flex items-center gap-1 font-medium">
                            <Check className="w-3 h-3" /> Calendar invite dispatched
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: RECOMMENDED JOBS (PHASE 9) */}
      {activeTab === 'recommendations' && (
        <RecommendedJobsSection
          onApplyForJob={onBackToHome}
          onNavigateToSkills={() => setActiveTab('skills')}
        />
      )}

      {/* MODAL: CANDIDATE AUDIT TRAIL / STATUS HISTORY */}
      {historyModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-brand-600 font-bold uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" /> Real-Time ATS Audit Trail
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {historyModalApp.jobTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {historyModalApp.companyName} • Application #{historyModalApp.id}
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
                <p className="text-xs text-slate-500">Retrieving audit timeline from server...</p>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No status history events logged yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {historyItems.map((item, idx) => (
                  <div key={item.id || idx} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {item.oldStatus ? `${item.oldStatus} ➔ ${item.newStatus}` : `Status: ${item.newStatus}`}
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
                          <strong>Note:</strong> {item.remarks}
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
                        <Mail className="w-3 h-3" /> Status notification email dispatched to Gmail inbox
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setHistoryModalApp(null)}>
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PROFILE INFO ================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Edit Candidate Profile Details</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={profileForm.headline || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                  placeholder="e.g. Senior Full Stack Java Engineer | Microservices | Cloud"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    placeholder="City, State / Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={profileForm.totalExperienceYears || 0}
                    onChange={(e) => setProfileForm({ ...profileForm, totalExperienceYears: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current CTC (₹ / annum or LPA)</label>
                  <input
                    type="number"
                    value={profileForm.currentSalary || 0}
                    onChange={(e) => setProfileForm({ ...profileForm, currentSalary: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected CTC (₹ / annum or LPA)</label>
                  <input
                    type="number"
                    value={profileForm.expectedSalary || 0}
                    onChange={(e) => setProfileForm({ ...profileForm, expectedSalary: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio</label>
                <textarea
                  rows={4}
                  value={profileForm.bio || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell employers about your engineering focus, achievements, and impact..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profileForm.linkedinUrl || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={profileForm.githubUrl || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={profileForm.websiteUrl || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                    placeholder="https://mywebsite.dev"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setIsEditProfileOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={actionLoading}>
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD WORK EXPERIENCE ================= */}
      {isAddExpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Work Experience</h3>
              <button onClick={() => setIsAddExpOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExperience} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={expForm.companyName}
                  onChange={(e) => setExpForm({ ...expForm, companyName: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={expForm.jobTitle}
                  onChange={(e) => setExpForm({ ...expForm, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={expForm.startDate || ''}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    placeholder="YYYY-MM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    disabled={expForm.isCurrent}
                    value={expForm.endDate || ''}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    placeholder="YYYY-MM or Present"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={expForm.isCurrent}
                  onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <label htmlFor="isCurrent" className="text-xs font-medium text-slate-700">
                  I currently work here
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Key Accomplishments</label>
                <textarea
                  rows={3}
                  value={expForm.description || ''}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Key deliverables, architectures designed, team leadership..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setIsAddExpOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" isLoading={actionLoading}>Save Experience</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD EDUCATION ================= */}
      {isAddEduOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Education Entry</h3>
              <button onClick={() => setIsAddEduOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEducation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institution / University *</label>
                <input
                  type="text"
                  required
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree *</label>
                  <input
                    type="text"
                    required
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    placeholder="e.g. Bachelor of Science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={eduForm.fieldOfStudy || ''}
                    onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Years (e.g. 2018 - 2022)</label>
                  <input
                    type="text"
                    value={eduForm.startDate || ''}
                    onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                    placeholder="2018 - 2022"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade / GPA</label>
                  <input
                    type="text"
                    value={eduForm.grade || ''}
                    onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })}
                    placeholder="e.g. 3.9 GPA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setIsAddEduOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" isLoading={actionLoading}>Save Education</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD SKILL ================= */}
      {isAddSkillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Technical Skill</h3>
              <button onClick={() => setIsAddSkillOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={skillForm.skillName}
                  onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  placeholder="e.g. Spring Boot, React, Docker..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={skillForm.proficiencyLevel}
                  onChange={(e: any) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="BEGINNER">Beginner (1-2 yrs)</option>
                  <option value="INTERMEDIATE">Intermediate (2-4 yrs)</option>
                  <option value="ADVANCED">Advanced (4-6 yrs)</option>
                  <option value="EXPERT">Expert (6+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Years of Hands-on Experience</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={skillForm.yearsOfExperience}
                  onChange={(e) => setSkillForm({ ...skillForm, yearsOfExperience: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setIsAddSkillOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" isLoading={actionLoading}>Add Skill</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD RESUME FROM DEVICE (MONGODB STORED) ================= */}
      {isUploadResumeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Device Resume</h3>
                  <p className="text-[11px] text-slate-500">Stored in MongoDB with AI ATS Indexing</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadResumeOpen(false);
                  setSelectedResumeFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadResume} className="space-y-4">
              {/* Drag and drop / Device File Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Choose Resume File from Device *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 hover:bg-brand-50/30 group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedResumeFile(file);
                        if (!resumeForm.title) {
                          setResumeForm({
                            ...resumeForm,
                            title: file.name.replace(/\.[^/.]+$/, "")
                          });
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {selectedResumeFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 break-all max-w-[280px]">
                        {selectedResumeFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {(selectedResumeFile.size / 1024).toFixed(1)} KB • {selectedResumeFile.type || 'Document'}
                      </p>
                      <span className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        File Ready to Store in MongoDB
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to select or drag & drop resume
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        PDF, DOCX, DOC, or TXT (Max 15MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resume Title / Label *</label>
                <input
                  type="text"
                  required
                  value={resumeForm.title}
                  onChange={(e) => setResumeForm({ ...resumeForm, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer Resume 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimaryResume"
                  checked={resumeForm.isPrimary}
                  onChange={(e) => setResumeForm({ ...resumeForm, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="isPrimaryResume" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Set as primary application resume
                </label>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <p>
                  <strong>MongoDB Datastore:</strong> Your resume is encrypted and safely stored in the MongoDB <code className="font-mono text-brand-700">talentflow_resumes</code> collection. Text is extracted for AI ATS analysis against job vacancies.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setIsUploadResumeOpen(false);
                    setSelectedResumeFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={actionLoading}
                  disabled={!selectedResumeFile && !resumeForm.title}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Upload to MongoDB
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CANDIDATE REQUEST RESCHEDULE ================= */}
      {rescheduleModalInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request Interview Reschedule</h3>
                  <p className="text-xs text-slate-500">{rescheduleModalInterview.roundName} • {rescheduleModalInterview.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleModalInterview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rescheduling <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Schedule clash with prior college exam / urgent office deliverable. Kindly consider an alternate slot."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Available Dates & IST Slots (Optional)
                </label>
                <input
                  type="text"
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="e.g. Available tomorrow after 4 PM IST or Friday anytime"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                ℹ️ Once submitted, this interview will be flagged as <strong>RESCHEDULE_REQUESTED</strong>. An automated notification will be sent to the recruiter via Gmail.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRescheduleModalInterview(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={rescheduleLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Submit Request
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

export default CandidateDashboard;
