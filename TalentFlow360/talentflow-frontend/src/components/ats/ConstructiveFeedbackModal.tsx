import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Target, ArrowRight, BookOpen, Lightbulb, HeartHandshake, Loader2, Award, Building2 } from 'lucide-react';
import { ConstructiveFeedback } from '../../types/chat';
import chatService from '../../services/chatService';

interface ConstructiveFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
}

export const ConstructiveFeedbackModal: React.FC<ConstructiveFeedbackModalProps> = ({
  isOpen,
  onClose,
  applicationId,
}) => {
  const [feedback, setFeedback] = useState<ConstructiveFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    chatService.getConstructiveFeedback(applicationId)
      .then((data) => {
        if (isMounted) {
          setFeedback(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load constructive feedback:', err);
        if (isMounted) {
          setError(err?.response?.data?.message || 'Could not load feedback at this time.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-slate-100 max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white text-base">Constructive Skill Gap & Growth Analysis</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Career Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center space-x-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{feedback?.companyName || 'Hiring Team'}</span>
                <span>•</span>
                <span className="text-slate-400">{feedback?.jobTitle || 'Application Analysis'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Generating personalized feedback and skill gap analysis...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-600 space-y-2">
              <p className="font-medium">{error}</p>
              <button
                onClick={onClose}
                className="text-xs text-slate-500 underline hover:text-slate-800"
              >
                Close
              </button>
            </div>
          ) : feedback ? (
            <>
              {/* Score & Tier Banner */}
              <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-base font-bold leading-none">{Math.round(feedback.atsScore)}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-indigo-200 mt-0.5">Match</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      {feedback.matchTier.replace('_', ' ')} Compatibility
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluated against the exact technical requirements of {feedback.jobTitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                    Stage: {feedback.applicationStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Constructive Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Evaluation Overview</span>
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                  {feedback.constructiveSummary}
                </div>
              </div>

              {/* Strengths & Missing Gaps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Strengths */}
                <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your Standout Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {feedback.identifiedStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Skill Gaps */}
                <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900 font-semibold text-sm">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span>Target Competencies to Bridge</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.criticalSkillGaps.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Candidates demonstrating direct, measurable ownership in these areas were prioritized.
                  </p>
                </div>
              </div>

              {/* Recommended 3-Step Action Plan */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Personalized 3-Step Career Action Plan</span>
                </h4>
                <div className="space-y-2.5">
                  {feedback.recommendedActionPlan.map((action, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start space-x-3 shadow-xs hover:border-indigo-300 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume & Interview Pro Tips */}
              {feedback.resumeOptimizationTips && feedback.resumeOptimizationTips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>Resume Optimization Recommendations</span>
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
                    {feedback.resumeOptimizationTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Encouragement Note */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3">
                <HeartHandshake className="w-7 h-7 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {feedback.encouragementNote}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            Got it, Thank You
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConstructiveFeedbackModal;
