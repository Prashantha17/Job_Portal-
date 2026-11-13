import React from 'react';
import { Briefcase, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

export const RecruiterCtaSection: React.FC = () => {
  return (
    <section id="recruiter-cta" className="py-20 bg-gradient-to-br from-brand-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(14,140,233,0.15),transparent_60%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 lg:p-16 backdrop-blur-md shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <Briefcase className="w-3.5 h-3.5" /> For Hiring Teams & Recruiter Leaders
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready to Accelerate Your Engineering Hiring Pipeline?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Post high-visibility vacancies, screen applicants using explainable candidate matching, coordinate interview schedules, and release offers within one unified platform.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero setup fees for first 3 active postings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Smart Skill Matrix scoring for every applicant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Seamless integration with interview calendars</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Enterprise RBAC and candidate data privacy</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full sm:w-auto shrink-0">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="px-8 py-4 font-bold text-sm shadow-xl shadow-brand-600/30"
              onClick={() => { window.location.hash = '#recruiter-hub'; }}
            >
              Post a Job Opening / Enter Recruiter Hub
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => { window.location.hash = '#recruiter-hub'; }}
            >
              Recruiter Operations & ATS Funnel
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

