import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, Award, FileText, Check, ArrowRight, User, Clock, Layers } from 'lucide-react';
import { AtsAnalysisReport } from '../../types/application';
import { Button } from '../common/Button';

interface AtsAnalysisReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AtsAnalysisReport | null;
  loading?: boolean;
  jobTitle?: string;
  candidateName?: string;
}

export const AtsAnalysisReportModal: React.FC<AtsAnalysisReportModalProps> = ({
  isOpen,
  onClose,
  report,
  loading = false,
  jobTitle,
  candidateName,
}) => {
  if (!isOpen) return null;

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

  const getTierColor = (score: number) => {
    if (score >= 85) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', ring: 'text-emerald-500' };
    if (score >= 70) return { bg: 'bg-blue-50 text-blue-800 border-blue-300', ring: 'text-blue-500' };
    if (score >= 55) return { bg: 'bg-amber-50 text-amber-800 border-amber-300', ring: 'text-amber-500' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-300', ring: 'text-rose-500' };
  };

  const colors = report ? getTierColor(report.atsScore) : { bg: 'bg-slate-50 text-slate-800', ring: 'text-slate-500' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-400/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI ATS Resume Compatibility Analysis</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {jobTitle ? `Target Vacancy: ${jobTitle}` : 'Evaluated against job requirements'}
                {candidateName ? ` • ${candidateName}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">Scanning resume keywords & computing ATS match score...</p>
            </div>
          ) : !report ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No ATS analysis report available.
            </div>
          ) : (
            <>
              {/* Overall Score Banner */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {Math.round(report.atsScore)}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">ATS Fit</span>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${colors.bg}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {report.matchTier.replace(/_/g, ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {report.atsScore >= 70 ? 'High Candidate Compatibility' : 'Moderate Alignment — Recommendations Below'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {report.summary}
                    </p>
                  </div>
                </div>

                {report.resumeFileName && (
                  <div className="shrink-0 text-right sm:border-l sm:border-slate-200 sm:pl-4">
                    <span className="text-[10px] text-slate-400 font-medium block">Analyzed Document</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-brand-600" />
                      {report.resumeFileName}
                    </span>
                  </div>
                )}
              </div>

              {/* CANDIDATE PIN-TO-PIN PARSED OVERVIEW */}
              {(report.candidateNameExtracted || report.wordCount || report.contactSummary) && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-sm border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-400/30 flex items-center justify-center font-bold shrink-0">
                        <User className="w-4 h-4 text-brand-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">
                            {report.candidateNameExtracted || candidateName || 'Parsed Candidate'}
                          </h4>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Pin-to-Pin Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {report.detectedDegree || 'Professional Degree'} • {report.detectedYearsExp ? `${report.detectedYearsExp}+ Yrs Experience` : 'Experienced Professional'}
                        </p>
                      </div>
                    </div>

                    {report.wordCount && (
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3 h-3 text-brand-400" />
                          <span><strong>{report.wordCount}</strong> words</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">~{Math.max(1, Math.round(report.wordCount / 200))}m read</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Summary Bar */}
                  {report.contactSummary && (
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {report.contactSummary.split(' | ').map((item, idx) => {
                        const isPassed = item.includes('✓');
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md border font-medium ${
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
                  )}

                  {/* Detected Sections */}
                  {report.detectedSections && report.detectedSections.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mr-1">
                        <Layers className="w-3 h-3 text-brand-400" /> Sections:
                      </span>
                      {report.detectedSections.map((sec, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {sec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4 Score Pillars Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Skills Match</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">{report.skillsScore}/40</span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-brand-600 h-full rounded-full" style={{ width: `${(report.skillsScore / 40) * 100}%` }}></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Experience</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">{report.experienceScore}/30</span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(report.experienceScore / 30) * 100}%` }}></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Keywords</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">{report.keywordScore}/20</span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(report.keywordScore / 20) * 100}%` }}></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Format & Parse</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">{report.formatScore}/10</span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(report.formatScore / 10) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Matched Keywords Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Matched Job Keywords ({report.matchedKeywords?.length || 0})
                  </h4>
                  <span className="text-[10px] text-slate-400">Detected in resume text</span>
                </div>
                {report.matchedKeywords && report.matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {report.matchedKeywords.map((k) => (
                      <span key={k} className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> {k}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific keyword matches found.</p>
                )}
              </div>

              {/* Missing Keywords Grid */}
              {report.missingKeywords && report.missingKeywords.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Missing Job Keywords ({report.missingKeywords.length})
                    </h4>
                    <span className="text-[10px] text-slate-400">Add these to improve your score</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.missingKeywords.map((k) => (
                      <span key={k} className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PIN-TO-PIN BULLET POINT AUDIT & GOOGLE XYZ REWRITES */}
              {report.bulletAudits && report.bulletAudits.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Line-by-Line Bullet Point Audits & AI Rewrites
                      </h4>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Pin-to-Pin Audit
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {report.bulletAudits.map((item, idx) => {
                      const parsed = parseBulletAudit(item);
                      if (!parsed.excerpt) return null;
                      return (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Flagged Bullet Point #{idx + 1}
                              </span>
                              {parsed.flaw && (
                                <span className="text-[10px] text-slate-500 italic max-w-xs text-right truncate">
                                  {parsed.flaw}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-800 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                              "{parsed.excerpt}"
                            </p>
                          </div>

                          {parsed.rewrite && (
                            <div className="bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 space-y-0.5">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-900">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>AI Recommended XYZ Formula Rewrite:</span>
                              </div>
                              <p className="text-xs font-semibold text-emerald-950">
                                "{parsed.rewrite}"
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Identified Mistakes & Red Flags */}
              {report.mistakes && report.mistakes.length > 0 && (
                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200/80 space-y-2">
                  <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Mistakes & Optimization Areas ({report.mistakes.length})
                  </h4>
                  <ul className="text-xs text-rose-800 space-y-1.5">
                    {report.mistakes.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to Improve & Step-by-Step Fixes */}
              {((report.improvements && report.improvements.length > 0) || (report.suggestions && report.suggestions.length > 0)) && (
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> What to Improve & Actionable Fixes
                  </h4>
                  <ul className="text-xs text-indigo-800 space-y-1.5">
                    {(report.improvements && report.improvements.length > 0 ? report.improvements : report.suggestions).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Top Strengths & AI Suggestions */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths Found in Resume
                </h4>
                <ul className="text-xs text-emerald-800 space-y-1.5">
                  {report.topStrengths && report.topStrengths.length > 0 ? (
                    report.topStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">Standard profile format detected.</li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Powered by TalentFlow 360 AI Resume Engine & MongoDB
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
