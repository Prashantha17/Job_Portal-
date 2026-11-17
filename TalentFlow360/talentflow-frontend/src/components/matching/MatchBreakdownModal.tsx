import React from 'react';
import { X, CheckCircle2, AlertCircle, Award, Briefcase, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { MatchBreakdown } from '../../types/matching';
import { Button } from '../common/Button';

interface MatchBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  breakdown: MatchBreakdown;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  breakdown
}) => {
  if (!isOpen) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'EXCEPTIONAL_MATCH':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'STRONG_MATCH':
        return 'bg-brand-50 text-brand-700 border-brand-300';
      case 'GOOD_MATCH':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'MODERATE_MATCH':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'EXCEPTIONAL_MATCH':
        return 'Exceptional Match (90-100%)';
      case 'STRONG_MATCH':
        return 'Strong Fit (75-89%)';
      case 'GOOD_MATCH':
        return 'Good Match (60-74%)';
      case 'MODERATE_MATCH':
        return 'Moderate Fit (40-59%)';
      default:
        return 'Low Alignment (< 40%)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                AI Matchmaking Engine
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(breakdown.matchTier)}`}>
                {getTierLabel(breakdown.matchTier)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Score Hero */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-indigo-200 font-semibold uppercase tracking-wider block">Overall Fit Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-white">{breakdown.totalScore}%</span>
              <span className="text-xs text-indigo-300 font-medium">Algorithmic Index</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>

        {/* 4 Category Breakdown Progress Bars */}
        <div className="space-y-4 mb-6">
          {/* 1. Skills (50%) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Award className="w-4 h-4 text-brand-600" />
                Technical Skills Fit (50%)
              </span>
              <span className="text-brand-700 font-black">{breakdown.skillsScore} / 50.0</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.skillsScore / 50.0) * 100}%` }}
              />
            </div>
          </div>

          {/* 2. Experience (20%) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Experience Seniority Fit (20%)
              </span>
              <span className="text-emerald-700 font-black">{breakdown.experienceScore} / 20.0</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.experienceScore / 20.0) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{breakdown.experienceSummary}</p>
          </div>

          {/* 3. Location (15%) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800">
                <MapPin className="w-4 h-4 text-purple-600" />
                Workplace & Location Fit (15%)
              </span>
              <span className="text-purple-700 font-black">{breakdown.locationScore} / 15.0</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.locationScore / 15.0) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{breakdown.locationSummary}</p>
          </div>

          {/* 4. Salary (15%) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800">
                <DollarSign className="w-4 h-4 text-amber-600" />
                Compensation / CTC Alignment (15%)
              </span>
              <span className="text-amber-700 font-black">{breakdown.salaryScore} / 15.0</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.salaryScore / 15.0) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{breakdown.salarySummary}</p>
          </div>
        </div>

        {/* Skill Gap Analysis Pills */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Skill Gap Analysis</h4>
          
          {/* Matched Required */}
          {breakdown.matchedRequiredSkills.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matched Mandatory Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchedRequiredSkills.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Matched Preferred */}
          {breakdown.matchedPreferredSkills.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-blue-800 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Matched Preferred Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchedPreferredSkills.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Required */}
          {breakdown.missingRequiredSkills.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Missing Mandatory Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.missingRequiredSkills.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Preferred */}
          {breakdown.missingPreferredSkills.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                Optional / Nice-to-Have Skills Not In Profile:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.missingPreferredSkills.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Breakdown
          </Button>
        </div>
      </div>
    </div>
  );
};
