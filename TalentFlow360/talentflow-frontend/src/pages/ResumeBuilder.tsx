import React, { useState } from 'react';
import {
  ArrowLeft, Sparkles, Download, Save, RefreshCw, Palette, Layout,
  User, Briefcase, GraduationCap, Award, Plus, Trash2, CheckCircle2,
  ZoomIn, ZoomOut, FileText, Check, Wand2, Lock, ShieldCheck, ArrowRight, LogIn
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ResumePreview } from '../components/resume/ResumePreview';
import {
  ResumeData,
  TemplateId,
  AccentColor,
  ResumeExperience,
  ResumeEducation
} from '../types/resumeBuilder';
import {
  getSampleResumeData,
  generateAISummary,
  enhanceAIBullet,
  suggestAISkills
} from '../utils/aiResumeGenerator';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';

interface ResumeBuilderProps {
  onBack?: () => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onBack }) => {
  const { user, isAuthenticated, login } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>(getSampleResumeData());
  const [activeStep, setActiveStep] = useState<'info' | 'summary' | 'experience' | 'skills' | 'education'>('info');
  const [scale, setScale] = useState(0.85);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleQuickDemoLogin = async () => {
    try {
      setQuickLoginLoading(true);
      await login({
        email: 'alex.morgan@example.com',
        password: 'Candidate@123'
      });
      showToast('Welcome back, Alex! AI Resume Builder unlocked.');
    } catch (err: any) {
      showToast('Demo login error: ' + (err.message || 'Please use standard login'));
    } finally {
      setQuickLoginLoading(false);
    }
  };

  // 10 Distinct Templates definition
  const TEMPLATES: { id: TemplateId; name: string; tag: string; desc: string }[] = [
    { id: 'modern', name: 'Silicon Valley', tag: 'Tech Favorite', desc: 'Clean two-column layout with skills sidebar & teal accents.' },
    { id: 'executive', name: 'Executive Navy', tag: 'Leadership', desc: 'Deep navy header banner with structured sections.' },
    { id: 'minimalist', name: 'Minimalist Clean', tag: 'ATS Gold', desc: 'Pure black & white typography with elegant hairline dividers.' },
    { id: 'creative', name: 'Creative Indigo', tag: 'Design & UI/UX', desc: 'Vibrant pill badges, portfolio showcase, and modern cards.' },
    { id: 'two-column', name: 'Two-Column Specialist', tag: 'DevOps / Cloud', desc: 'Contrasting colored sidebar for skills and contact info.' },
    { id: 'harvard', name: 'Harvard Classic', tag: 'Ivy League', desc: 'Timeless serif typography, centered header, academic standard.' },
    { id: 'startup', name: 'Startup One-Pager', tag: 'High Density', desc: 'Compact grid formatted for 6-second rapid recruiter scans.' },
    { id: 'nordic', name: 'Nordic Slate', tag: 'Modern European', desc: 'Rounded dark header card with soft contrast badges.' },
    { id: 'timeline', name: 'Timeline Milestone', tag: 'Career Growth', desc: 'Chronological timeline rail connecting career nodes.' },
    { id: 'indian-tech', name: 'Indian Tech Enterprise', tag: 'Bengaluru / Pune', desc: 'Notice period, total exp highlights, and tech matrix.' },
  ];

  const ACCENT_COLORS: { color: AccentColor; label: string }[] = [
    { color: '#0284c7', label: 'Ocean Blue' },
    { color: '#0d9488', label: 'Teal' },
    { color: '#4f46e5', label: 'Indigo' },
    { color: '#16a34a', label: 'Emerald' },
    { color: '#9333ea', label: 'Purple' },
    { color: '#e11d48', label: 'Rose' },
    { color: '#ea580c', label: 'Warm Amber' },
    { color: '#0f172a', label: 'Dark Slate' },
  ];

  // 1-Click Auto-Fill from Candidate Profile
  const handleAutoFillFromProfile = async () => {
    try {
      setAutoFillLoading(true);
      const profile = await profileService.getCandidateProfile();

      const experiences: ResumeExperience[] = (profile.experiences || []).map((exp, idx) => ({
        id: `exp-${idx}-${Date.now()}`,
        company: exp.companyName || 'Company',
        role: exp.jobTitle || 'Role',
        location: exp.location || '',
        startDate: exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2022',
        endDate: exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2023'),
        current: !!exp.isCurrent,
        highlights: exp.description
          ? exp.description.split('\n').filter(Boolean)
          : ['Engineered scalable software solutions adhering to clean coding standards and automated tests.']
      }));

      const educations: ResumeEducation[] = (profile.educations || []).map((edu, idx) => ({
        id: `edu-${idx}-${Date.now()}`,
        institution: edu.institution || 'University',
        degree: edu.degree || 'Bachelor Degree',
        fieldOfStudy: edu.fieldOfStudy || 'Computer Science',
        startYear: edu.startDate ? new Date(edu.startDate).getFullYear().toString() : '2018',
        endYear: edu.endDate ? new Date(edu.endDate).getFullYear().toString() : '2022',
        grade: edu.grade || ''
      }));

      const skills: string[] = (profile.skills || []).map(s => s.skillName);

      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          fullName: profile.fullName || user?.firstName ? `${user?.firstName} ${user?.lastName || ''}`.trim() : prev.personalInfo.fullName,
          targetRole: profile.headline || prev.personalInfo.targetRole,
          email: profile.email || user?.email || prev.personalInfo.email,
          phone: profile.phone || prev.personalInfo.phone,
          location: profile.location || prev.personalInfo.location,
          linkedinUrl: profile.linkedinUrl || prev.personalInfo.linkedinUrl,
          githubUrl: profile.githubUrl || prev.personalInfo.githubUrl,
          portfolioUrl: profile.websiteUrl || prev.personalInfo.portfolioUrl
        },
        summary: profile.bio || prev.summary,
        experiences: experiences.length > 0 ? experiences : prev.experiences,
        educations: educations.length > 0 ? educations : prev.educations,
        skills: skills.length > 0 ? skills : prev.skills
      }));

      showToast('Successfully imported all details from your TalentFlow candidate profile!');
    } catch (err: any) {
      console.warn('Could not auto-fill profile:', err);
      showToast('Could not load profile. Please make sure you are logged in as a candidate.');
    } finally {
      setAutoFillLoading(false);
    }
  };

  // AI Generation Handlers
  const handleGenerateSummary = (tone: 'technical' | 'executive' | 'creative') => {
    const generated = generateAISummary(
      resumeData.personalInfo.targetRole || 'Software Engineer',
      resumeData.totalExperienceYears || '3+ years',
      tone
    );
    setResumeData(prev => ({ ...prev, summary: generated }));
    showToast(`AI generated a new ${tone} professional summary!`);
  };

  const handleEnhanceBullet = (expIndex: number, bulletIndex: number) => {
    const raw = resumeData.experiences[expIndex]?.highlights[bulletIndex] || '';
    const enhanced = enhanceAIBullet(raw, resumeData.personalInfo.targetRole);
    const updated = [...resumeData.experiences];
    updated[expIndex].highlights[bulletIndex] = enhanced;
    setResumeData(prev => ({ ...prev, experiences: updated }));
    showToast('AI enhanced the bullet point with action verbs and metrics!');
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = [...resumeData.experiences];
    updated[expIndex].highlights.push('Spearheaded key feature implementation and optimized database performance.');
    setResumeData(prev => ({ ...prev, experiences: updated }));
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...resumeData.experiences];
    updated[expIndex].highlights.splice(bulletIndex, 1);
    setResumeData(prev => ({ ...prev, experiences: updated }));
  };

  const handleSuggestSkills = () => {
    const suggested = suggestAISkills(resumeData.personalInfo.targetRole);
    // Combine unique
    const merged = Array.from(new Set([...resumeData.skills, ...suggested]));
    setResumeData(prev => ({ ...prev, skills: merged }));
    showToast(`AI suggested ${suggested.length} skills tailored for "${resumeData.personalInfo.targetRole}"!`);
  };

  const handleDownloadPdf = () => {
    // Set document title so the browser print dialog defaults to e.g. "Aarav_Patel_Resume.pdf"
    const originalTitle = document.title;
    const cleanName = resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume';
    document.title = `${cleanName}_Resume`;
    window.print();
    document.title = originalTitle;
  };

  const handleSaveToMyResumes = async () => {
    try {
      setSaveLoading(true);
      const cleanName = resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'My';
      await profileService.uploadResume({
        title: `${resumeData.personalInfo.targetRole || 'Software'} Resume (${resumeData.templateId})`,
        fileName: `${cleanName}_AI_Resume.pdf`,
        filePath: 'generated://ai-resume-builder',
        isPrimary: true
      });
      showToast('Resume saved to your primary TalentFlow resume pool for 1-click job applications!');
    } catch (err: any) {
      showToast('Please log in as a candidate to save resumes to your profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Access Restriction Gate: User MUST be logged in to build resumes
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full mb-6">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-slate-600 hover:text-slate-900"
            >
              Back to Home
            </Button>
          )}
        </div>

        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background glowing blur decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />

            {/* Lock & Sparkles Badge */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Lock className="w-9 h-9" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Sign-In Required
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Sign In to Build Your AI Resume
            </h1>

            <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
              The <strong>TalentFlow 360 AI Resume Studio</strong> is exclusively accessible to registered members. Sign in with your candidate account to unlock all 10 designer templates, AI bullet enhancers, and 1-click profile synchronization.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => (window.location.hash = '#login')}
                leftIcon={<LogIn className="w-5 h-5" />}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/25 px-8"
              >
                Sign In to Continue
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.hash = '#register')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto border-slate-300 hover:border-purple-400 text-slate-700 hover:text-purple-700 px-6"
              >
                Create Free Candidate Account
              </Button>
            </div>

            {/* 1-Click Demo Login Option */}
            <div className="pt-6 border-t border-slate-100 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Fast Evaluation & Testing:
              </span>
              <button
                onClick={handleQuickDemoLogin}
                disabled={quickLoginLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 text-xs font-bold transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                {quickLoginLoading ? 'Signing in demo user...' : '1-Click Candidate Demo Login (Alex Morgan)'}
              </button>
            </div>

            {/* Features preview grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">
                  10
                </div>
                <h3 className="text-xs font-bold text-slate-900">10 Designer Templates</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Silicon Valley, Harvard Classic, Startup, Indian IT & more.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-2">
                  <Wand2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">AI Bullet Enhancer</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">STAR-method action verbs with quantifiable metrics.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">1-Click Profile Sync</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Auto-fill education, experience, and skills in seconds.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs mb-2">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Vector PDF Export</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Pixel-perfect A4 printing ready for recruiter submission.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800">
      {/* Top Studio Control Bar (Hidden on print) */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}
            <div>
              <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                AI Resume Builder Studio
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                  10 Templates
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Enter basic details or 1-click auto-fill, choose your design, and export in vector-crisp PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoFillFromProfile}
                isLoading={autoFillLoading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-brand-600" />}
              >
                1-Click Auto-Fill
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToMyResumes}
              isLoading={saveLoading}
              leftIcon={<Save className="w-3.5 h-3.5 text-slate-600" />}
            >
              Save to Portal
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPdf}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="bg-brand-600 hover:bg-brand-700 shadow-sm"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </nav>

      {/* Toast alert banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 p-3 px-5 bg-slate-900 text-white rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Work Area */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 print:p-0 print:m-0">
        {/* Template Selector Carousel (10 Templates) */}
        <section className="mb-6 print:hidden">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-brand-600" /> Select from 10 Professional Templates:
            </h2>
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-1">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.color}
                    onClick={() => setResumeData(prev => ({ ...prev, accentColor: c.color }))}
                    className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                      resumeData.accentColor === c.color ? 'scale-125 border-slate-900 shadow-md' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 overflow-x-auto pb-1">
            {TEMPLATES.map((t, idx) => {
              const active = resumeData.templateId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setResumeData(prev => ({ ...prev, templateId: t.id }))}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                    active
                      ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/30 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 font-bold">#{idx + 1}</div>
                  <div className="font-extrabold text-xs text-slate-900 truncate mt-0.5">{t.name}</div>
                  <div className="text-[9.5px] font-bold text-brand-700 truncate">{t.tag}</div>
                  {active && (
                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Split Screen Layout: Left Form + Right Live A4 Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: SIMPLE INPUT FORM WITH AI ASSISTANTS */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-5 print:hidden">
            {/* Step Navigation Tabs */}
            <div className="flex border-b border-slate-200 pb-2 gap-1 overflow-x-auto text-xs">
              {[
                { id: 'info', label: '1. Basic Info', icon: User },
                { id: 'summary', label: '2. Summary', icon: Wand2 },
                { id: 'experience', label: '3. Experience', icon: Briefcase },
                { id: 'skills', label: '4. Skills', icon: Award },
                { id: 'education', label: '5. Education', icon: GraduationCap },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeStep === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStep(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                      active ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: BASIC INFO */}
            {activeStep === 'info' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Candidate Contact & Target Role
                  </h3>
                  <button
                    onClick={handleAutoFillFromProfile}
                    className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Fill
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.fullName}
                      onChange={e => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                      placeholder="e.g. Aarav Patel"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Job Title *</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.targetRole}
                      onChange={e => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, targetRole: e.target.value }
                      }))}
                      placeholder="e.g. Senior Full Stack Java Engineer"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={e => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      placeholder="aarav@example.com"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number (+91) *</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.phone}
                      onChange={e => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Location / Base City</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={e => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                      placeholder="Bengaluru, Karnataka, India"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Experience</label>
                    <input
                      type="text"
                      value={resumeData.totalExperienceYears || ''}
                      onChange={e => setResumeData(prev => ({ ...prev, totalExperienceYears: e.target.value }))}
                      placeholder="e.g. 4+ Years"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Notice Period</label>
                    <input
                      type="text"
                      value={resumeData.currentNoticePeriod || ''}
                      onChange={e => setResumeData(prev => ({ ...prev, currentNoticePeriod: e.target.value }))}
                      placeholder="e.g. Immediate / 15 Days"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button size="sm" variant="primary" onClick={() => setActiveStep('summary')}>
                    Next: Summary &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: SUMMARY WITH AI ENGINE */}
            {activeStep === 'summary' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Executive Summary & AI Generation
                  </h3>
                </div>

                <div className="p-3 bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 rounded-2xl border border-brand-200/80 space-y-2">
                  <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    AI Summary Generators:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateSummary('technical')}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white border border-brand-300 text-brand-800 hover:bg-brand-50 transition-colors shadow-xs"
                    >
                      ⚡ Technical & Results
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateSummary('executive')}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-50 transition-colors shadow-xs"
                    >
                      👑 Executive Leadership
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateSummary('creative')}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white border border-purple-300 text-purple-800 hover:bg-purple-50 transition-colors shadow-xs"
                    >
                      🎨 Product & Design
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Summary Text (Review & Edit):
                  </label>
                  <textarea
                    rows={5}
                    value={resumeData.summary}
                    onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Enter or generate your professional summary..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button size="sm" variant="outline" onClick={() => setActiveStep('info')}>
                    &larr; Back
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => setActiveStep('experience')}>
                    Next: Experience &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: WORK EXPERIENCE WITH AI BULLET ENHANCER */}
            {activeStep === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Work Experience ({resumeData.experiences.length})
                  </h3>
                  <button
                    onClick={() => {
                      const newExp: ResumeExperience = {
                        id: `exp-${Date.now()}`,
                        company: 'Company Name',
                        role: 'Software Engineer',
                        location: 'Bengaluru, India',
                        startDate: '2023',
                        endDate: 'Present',
                        current: true,
                        highlights: ['Architected scalable microservices and led sprint deliveries.']
                      };
                      setResumeData(prev => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
                    }}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Role
                  </button>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {resumeData.experiences.map((exp, expIdx) => (
                    <div key={exp.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-xs text-slate-800">Role #{expIdx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = [...resumeData.experiences];
                            updated.splice(expIdx, 1);
                            setResumeData(prev => ({ ...prev, experiences: updated }));
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={e => {
                              const updated = [...resumeData.experiences];
                              updated[expIdx].company = e.target.value;
                              setResumeData(prev => ({ ...prev, experiences: updated }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Title / Designation</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={e => {
                              const updated = [...resumeData.experiences];
                              updated[expIdx].role = e.target.value;
                              setResumeData(prev => ({ ...prev, experiences: updated }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={e => {
                              const updated = [...resumeData.experiences];
                              updated[expIdx].startDate = e.target.value;
                              setResumeData(prev => ({ ...prev, experiences: updated }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">End Date</label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={e => {
                              const updated = [...resumeData.experiences];
                              updated[expIdx].endDate = e.target.value;
                              setResumeData(prev => ({ ...prev, experiences: updated }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      {/* Bullet points with 1-click AI Enhancer */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-bold text-slate-600 block">
                          Achievements & Impact Bullets:
                        </label>
                        {exp.highlights.map((h, bIdx) => (
                          <div key={bIdx} className="space-y-1 bg-white p-2 rounded-xl border border-slate-200/60">
                            <textarea
                              rows={2}
                              value={h}
                              onChange={e => {
                                const updated = [...resumeData.experiences];
                                updated[expIdx].highlights[bIdx] = e.target.value;
                                setResumeData(prev => ({ ...prev, experiences: updated }));
                              }}
                              className="w-full text-[11.5px] p-1.5 rounded border border-slate-200 focus:outline-none"
                            />
                            <div className="flex justify-between items-center pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleEnhanceBullet(expIdx, bIdx)}
                                className="text-[10.5px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-600" /> ✨ AI Polish Bullet
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveBullet(expIdx, bIdx)}
                                className="text-[10.5px] text-slate-400 hover:text-rose-600"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddBullet(expIdx)}
                          className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1 pt-1"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet Point
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button size="sm" variant="outline" onClick={() => setActiveStep('summary')}>
                    &larr; Back
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => setActiveStep('skills')}>
                    Next: Skills &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 4: SKILLS & AI RECOMMENDATIONS */}
            {activeStep === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Technical & Professional Skills ({resumeData.skills.length})
                  </h3>
                  <button
                    onClick={handleSuggestSkills}
                    className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl flex items-center gap-1 border border-indigo-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    AI Suggest Skills
                  </button>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[100px]">
                  {resumeData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center gap-1.5 shadow-2xs"
                    >
                      {skill}
                      <button
                        onClick={() => {
                          const updated = [...resumeData.skills];
                          updated.splice(idx, 1);
                          setResumeData(prev => ({ ...prev, skills: updated }));
                        }}
                        className="text-slate-400 hover:text-rose-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add custom skill input */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Add Skill (Press Enter):</label>
                  <input
                    type="text"
                    placeholder="e.g. Docker, GraphQL, Kubernetes..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !resumeData.skills.includes(val)) {
                          setResumeData(prev => ({ ...prev, skills: [...prev.skills, val] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button size="sm" variant="outline" onClick={() => setActiveStep('experience')}>
                    &larr; Back
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => setActiveStep('education')}>
                    Next: Education &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 5: EDUCATION & PROJECTS */}
            {activeStep === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Education & Key Projects
                  </h3>
                </div>

                {/* Education list */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Degree & College</span>
                  {resumeData.educations.map((edu, eIdx) => (
                    <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-500">Institution / College</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={e => {
                              const updated = [...resumeData.educations];
                              updated[eIdx].institution = e.target.value;
                              setResumeData(prev => ({ ...prev, educations: updated }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={e => {
                              const updated = [...resumeData.educations];
                              updated[eIdx].degree = e.target.value;
                              setResumeData(prev => ({ ...prev, educations: updated }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Graduation Year</label>
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={e => {
                              const updated = [...resumeData.educations];
                              updated[eIdx].endYear = e.target.value;
                              setResumeData(prev => ({ ...prev, educations: updated }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button size="sm" variant="outline" onClick={() => setActiveStep('skills')}>
                    &larr; Back
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleDownloadPdf}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Finish & Download PDF
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: LIVE INTERACTIVE A4 PREVIEW (Zoomable & Responsive) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-2xs print:hidden">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-600" />
                Live A4 Print Preview ({resumeData.templateId})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setScale(s => Math.max(0.65, Math.round((s - 0.05) * 100) / 100))}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-600 w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(s => Math.min(1.15, Math.round((s + 0.05) * 100) / 100))}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleDownloadPdf}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="ml-2 py-1 px-3 text-xs"
                >
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Resume Sheet Preview Area */}
            <div className="bg-slate-200/70 rounded-3xl p-4 md:p-6 overflow-x-auto shadow-inner border border-slate-300/60 flex justify-center">
              <ResumePreview data={resumeData} scale={scale} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
