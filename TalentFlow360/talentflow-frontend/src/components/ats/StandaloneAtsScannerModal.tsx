import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Upload, FileText, CheckCircle2, AlertTriangle,
  Award, ArrowRight, RefreshCw, Check, Briefcase, Zap, ShieldAlert,
  HelpCircle, Lock, User, Clock, Layers
} from 'lucide-react';
import { Button } from '../common/Button';
import { applicationService } from '../../services/applicationService';
import profileService, { ResumeItem } from '../../services/profileService';
import { AtsAnalysisReport } from '../../types/application';
import { useAuth } from '../../context/AuthContext';

interface StandaloneAtsScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBuilder?: () => void;
  onNavigateToJobs?: () => void;
}

export const StandaloneAtsScannerModal: React.FC<StandaloneAtsScannerModalProps> = ({
  isOpen,
  onClose,
  onNavigateToBuilder,
  onNavigateToJobs,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [savedResumes, setSavedResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AtsAnalysisReport | null>(null);

  const POPULAR_ROLES = [
    'Full Stack Engineer',
    'Java Backend Developer',
    'Frontend React Specialist',
    'DevOps & Cloud Engineer',
    'Data Scientist / AI Engineer',
  ];

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      profileService.getCandidateProfile()
        .then((prof) => {
          if (prof?.resumes && prof.resumes.length > 0) {
            setSavedResumes(prof.resumes);
            const primary = prof.resumes.find((r) => r.isPrimary) || prof.resumes[0];
            if (primary) setSelectedResumeId(primary.id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleRunScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!file && !selectedResumeId) {
      setError('Please choose a resume file from your device or select a saved resume.');
      return;
    }

    try {
      setScanning(true);
      setError(null);
      const res = await applicationService.auditResumeStandalone(
        file || undefined,
        !file && selectedResumeId ? selectedResumeId : undefined,
        targetRole
      );
      setReport(res);
    } catch (err: any) {
      console.error('Standalone ATS Audit failed:', err);
      setError(err?.response?.data?.message || 'Failed to analyze resume. Please check file format.');
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setReport(null);
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300', label: 'ATS-Optimized' };
    if (score >= 65) return { bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-800 border-blue-300', label: 'Competitive' };
    if (score >= 50) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-800 border-amber-300', label: 'Moderate Match' };
    return { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-800 border-rose-300', label: 'Needs Improvement' };
  };

  const parseBulletAudit = (auditStr: string) => {
    try {
      const excerptMatch = auditStr.match(/EXCERPT:\s*"([^"]+)"/);
      const flawMatch = auditStr.match(/\|\s*FLAW:\s*(.+?)\s*\|\s*REWRITE:/);
      const rewriteMatch = auditStr.match(/REWRITE:\s*"([^"]+)"/);

      const excerpt = excerptMatch ? excerptMatch[1] : '';
      const flaw = flawMatch ? flawMatch[1] : '';
      const rewrite = rewriteMatch ? rewriteMatch[1] : '';

      return { excerpt, flaw, rewrite };
    } catch {
      return { excerpt: auditStr, flaw: '', rewrite: '' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Banner */}
        <div className="p-4 sm:p-5 px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  AI ATS Resume Score & Mistakes Audit
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/30 text-brand-300 border border-brand-400/30">
                  Instant Checker
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Upload your resume from your device to see your ATS Score, critical mistakes, and step-by-step improvements.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* Authentication Gate: Only available after logging in */}
          {!isAuthenticated ? (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Sign In to Use AI ATS Resume Checker</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  AI ATS Resume Scoring, mistake detection, and step-by-step improvements are exclusive to registered candidates. Please sign in to analyze your resume.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  className="w-full sm:w-auto text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Sign In to Candidate Account
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Step: When not yet analyzed or in scanning mode */}
              {!report && (
            <div className="space-y-5">
              {/* Target Role Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Target Job Role or Industry Focus:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Helps tailor keyword matching</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer, DevOps Specialist..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                {/* Quick Role Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 mr-1">Quick Picks:</span>
                  {POPULAR_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        targetRole === role
                          ? 'bg-brand-50 text-brand-700 border-brand-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved Resume Chooser (if authenticated and has resumes) */}
              {isAuthenticated && savedResumes.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Option A: Pick Saved Resume from Profile
                  </label>
                  <select
                    value={file ? '' : (selectedResumeId || '')}
                    onChange={(e) => {
                      setSelectedResumeId(Number(e.target.value));
                      setFile(null);
                    }}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {savedResumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.fileName}) {r.isPrimary ? '★ Primary' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Upload Resume from Device Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAuthenticated && savedResumes.length > 0 ? 'Option B: Upload Resume from Device (.pdf, .docx, .txt) *' : 'Upload Resume File from Device (.pdf, .docx, .txt) *'}
                </label>
                <div className="relative border-2 border-dashed border-brand-300 hover:border-brand-500 rounded-3xl p-8 text-center transition-colors bg-brand-50/20 hover:bg-brand-50/40 group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFile(f);
                        setSelectedResumeId(null);
                        setError(null);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-sm border border-emerald-200">
                        <FileText className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 break-all max-w-sm">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
                      </p>
                      <span className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Ready for AI ATS Scan
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                        <Upload className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        Click to select or drag & drop resume file
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports PDF, DOCX, DOC, or TXT (Max 15MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleRunScan}
                  isLoading={scanning}
                  disabled={!file && !selectedResumeId}
                  leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                  className="w-full sm:w-auto px-8 shadow-md shadow-brand-500/20"
                >
                  {scanning ? 'Scanning Resume Keywords & Structure...' : 'Analyze Resume ATS Score & Mistakes'}
                </Button>
              </div>
            </div>
          )}

          {/* Results Step: Full ATS Audit Scorecard, Mistakes, and Improvements */}
          {report && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Score Banner with Radial Score */}
              {(() => {
                const color = getScoreColor(report.atsScore);
                return (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-brand-50/30 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      {/* Score Circle */}
                      <div className="relative w-24 h-24 rounded-3xl bg-white shadow-md border-2 border-slate-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                          {Math.round(report.atsScore)}%
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">ATS Score</span>
                      </div>

                      <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                          <h4 className="text-lg font-bold text-slate-900">
                            {color.label}
                          </h4>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${color.badge}`}>
                            {report.matchTier.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Target Role: <strong className="text-slate-800">{report.jobTitle}</strong> • {report.resumeFileName}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          {report.summary}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                      className="shrink-0 text-xs"
                    >
                      Test Another Resume
                    </Button>
                  </div>
                );
              })()}

              {/* CANDIDATE PIN-TO-PIN PARSED OVERVIEW CARD */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-md border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-400/30 flex items-center justify-center font-bold shrink-0">
                      <User className="w-5 h-5 text-brand-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">
                          {report.candidateNameExtracted || 'Parsed Candidate Profile'}
                        </h4>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Pin-to-Pin Extraction Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {report.detectedDegree || 'Professional Degree'} • {report.detectedYearsExp ? `${report.detectedYearsExp}+ Yrs Experience` : 'Entry / Experienced Professional'}
                      </p>
                    </div>
                  </div>

                  {report.wordCount && (
                    <div className="flex items-center gap-3 text-xs text-slate-300 sm:text-right shrink-0">
                      <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-400" />
                        <span><strong>{report.wordCount}</strong> words</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">~{Math.max(1, Math.round(report.wordCount / 200))} min read</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact & Footprint Verification Bar */}
                {report.contactSummary && (
                  <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Contact & Footprint:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {report.contactSummary.split(' | ').map((item, idx) => {
                        const isPassed = item.includes('✓');
                        return (
                          <span
                            key={idx}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border ${
                              isPassed
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {item}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Detected ATS Sections */}
                {report.detectedSections && report.detectedSections.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-400" /> Detected ATS Document Sections ({report.detectedSections.length})
                      </span>
                      <span className="text-[10px] text-slate-500">Standard single-column parser hierarchy</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {report.detectedSections.map((sec, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-400" /> {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4 Score Breakdown Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">Skills & Tech</span>
                    <span className="font-mono font-bold text-slate-900">{report.skillsScore}/35</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${(report.skillsScore / 35) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Tech stack coverage</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">Impact Metrics</span>
                    <span className="font-mono font-bold text-slate-900">{report.experienceScore}/25</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(report.experienceScore / 25) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Measurable numbers (%)</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">ATS Layout</span>
                    <span className="font-mono font-bold text-slate-900">{report.formatScore}/25</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(report.formatScore / 25) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Headings & parsing</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">Action Verbs</span>
                    <span className="font-mono font-bold text-slate-900">{report.keywordScore}/15</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(report.keywordScore / 15) * 100}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Active vs passive words</span>
                </div>
              </div>

              {/* PIN-TO-PIN BULLET POINT AUDIT & GOOGLE XYZ REWRITES */}
              {report.bulletAudits && report.bulletAudits.length > 0 && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border border-amber-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Line-by-Line Bullet Point Audits & AI Rewrites
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Real bullet points parsed from your resume analyzed with Google XYZ formula suggestions
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Pin-to-Pin Audit
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {report.bulletAudits.map((item, idx) => {
                      const parsed = parseBulletAudit(item);
                      if (!parsed.excerpt) return null;
                      return (
                        <div
                          key={idx}
                          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 transition-all hover:border-brand-300"
                        >
                          {/* Candidate Excerpt */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                Flagged Bullet Point #{idx + 1} (From Your Resume)
                              </span>
                              {parsed.flaw && (
                                <span className="text-[11px] text-slate-500 italic max-w-xs text-right truncate">
                                  {parsed.flaw}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-800 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                              "{parsed.excerpt}"
                            </p>
                          </div>

                          {/* AI XYZ Rewrite */}
                          {parsed.rewrite && (
                            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>AI Recommended XYZ Formula Rewrite:</span>
                              </div>
                              <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                                "{parsed.rewrite}"
                              </p>
                              <span className="text-[10px] text-emerald-700 block mt-0.5">
                                Formula: Accomplished [X] as measured by [Y], by doing [Z]
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CRITICAL MISTAKES & RED FLAGS SECTION */}
              <div className="p-5 rounded-3xl bg-rose-50/80 border border-rose-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-950">
                        Mistakes & Red Flags Detected ({report.mistakes?.length || 0})
                      </h4>
                      <p className="text-[11px] text-rose-700">
                        Items that can trigger ATS filters or cause recruiters to reject your resume
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-800">
                    Needs Attention
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {report.mistakes && report.mistakes.length > 0 ? (
                    report.mistakes.map((mistake, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-2xl border border-rose-200/80 flex items-start gap-3 shadow-2xs"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-800 font-medium leading-relaxed">
                          {mistake}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero critical red flags detected! Your resume adheres to standard ATS hygiene.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* WHAT TO IMPROVE & STEP-BY-STEP RECOMMENDATIONS SECTION */}
              <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-950">
                        What to Improve & Step-by-Step Fixes ({report.improvements?.length || report.suggestions?.length || 0})
                      </h4>
                      <p className="text-[11px] text-indigo-700">
                        Actionable enhancements to elevate your ATS score above 85%
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-800">
                    AI Guidance
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {(report.improvements && report.improvements.length > 0 ? report.improvements : report.suggestions).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-2xl border border-indigo-200/70 flex items-start gap-3 shadow-2xs"
                    >
                      <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-800 font-medium leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords Matrix: Matched vs Missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Keywords */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Detected Keywords ({report.matchedKeywords?.length || 0})
                  </h4>
                  {report.matchedKeywords && report.matchedKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {report.matchedKeywords.map((k) => (
                        <span key={k} className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-600" /> {k}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No standard technical keywords parsed.</p>
                  )}
                </div>

                {/* Missing Keywords to Add */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    Keywords to Consider Adding ({report.missingKeywords?.length || 0})
                  </h4>
                  {report.missingKeywords && report.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {report.missingKeywords.slice(0, 8).map((k) => (
                        <span key={k} className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {k}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">All essential tech keywords present.</p>
                  )}
                </div>
              </div>

              {/* Key Strengths */}
              {report.topStrengths && report.topStrengths.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand-600" /> Key Strengths Found in Resume
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5">
                    {report.topStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Quick Links to Act on Results */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-700 text-center sm:text-left">
                  <strong className="text-brand-900 block font-bold">Ready to fix these mistakes?</strong>
                  <span>Use our AI Resume Builder to generate ATS-optimized bullet points and formatting.</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onNavigateToBuilder && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onNavigateToBuilder();
                      }}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                      className="text-xs"
                    >
                      Open AI Resume Builder
                    </Button>
                  )}
                  {onNavigateToJobs && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onNavigateToJobs();
                      }}
                      className="text-xs"
                    >
                      Browse Vacancies
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          </>
        )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-sans">
            Powered by TalentFlow 360 AI Resume Intelligence
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

      </div>
    </div>
  );
};
