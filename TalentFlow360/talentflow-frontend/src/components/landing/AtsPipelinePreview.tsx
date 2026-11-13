import React, { useState } from 'react';
import { GitBranch, CheckCircle2, Clock, Users, FileText, Send, Calendar, Award, CheckSquare, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface PipelineStage {
  id: number;
  name: string;
  code: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  automatedActions: string[];
  avgDays: string;
}

export const AtsPipelinePreview: React.FC = () => {
  const stages: PipelineStage[] = [
    {
      id: 1,
      name: 'Applied',
      code: 'APPLIED',
      icon: <Send className="w-4 h-4" />,
      color: 'bg-blue-500',
      description: 'Candidate submits application via portal with attached resume and profile portfolio.',
      automatedActions: ['Resume text parsing', 'Skill match score calculation', 'Application confirmation email sent'],
      avgDays: 'Instant'
    },
    {
      id: 2,
      name: 'Under Review',
      code: 'UNDER_REVIEW',
      icon: <FileText className="w-4 h-4" />,
      color: 'bg-indigo-500',
      description: 'Recruiter or hiring manager evaluates profile compatibility, portfolio, and work history.',
      automatedActions: ['Audit log entry created', 'Reviewer assigned in recruiter queue'],
      avgDays: '1-2 Days'
    },
    {
      id: 3,
      name: 'Shortlisted',
      code: 'SHORTLISTED',
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'bg-teal-500',
      description: 'Candidate passes initial screening criteria and is approved for interview rounds.',
      automatedActions: ['Status notification sent to candidate', 'Interview scheduling link unlocked'],
      avgDays: '2 Days'
    },
    {
      id: 4,
      name: 'Technical Interview',
      code: 'TECH_INTERVIEW',
      icon: <Calendar className="w-4 h-4" />,
      color: 'bg-amber-500',
      description: 'In-depth technical assessment with senior engineers covering architecture and coding skills.',
      automatedActions: ['Calendar invitation sent', 'Feedback evaluation scorecard generated'],
      avgDays: '3-4 Days'
    },
    {
      id: 5,
      name: 'HR Interview',
      code: 'HR_INTERVIEW',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-purple-500',
      description: 'Culture fit, compensation expectations, team dynamics, and availability alignment.',
      automatedActions: ['HR scorecard logged', 'Candidate satisfaction poll recorded'],
      avgDays: '2 Days'
    },
    {
      id: 6,
      name: 'Selected',
      code: 'SELECTED',
      icon: <Award className="w-4 h-4" />,
      color: 'bg-emerald-500',
      description: 'Hiring committee and department head finalize affirmative decision for offer.',
      automatedActions: ['Executive signoff logged', 'Offer requisition draft initialized'],
      avgDays: '1 Day'
    },
    {
      id: 7,
      name: 'Offer Released',
      code: 'OFFER_RELEASED',
      icon: <CheckSquare className="w-4 h-4" />,
      color: 'bg-cyan-500',
      description: 'Formal employment offer letter sent with compensation breakdown and joining dates.',
      automatedActions: ['Secure offer letter PDF generated', 'Candidate acceptance deadline timer set'],
      avgDays: '3 Days'
    },
    {
      id: 8,
      name: 'Hired',
      code: 'HIRED',
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'bg-green-600',
      description: 'Offer accepted! Candidate transitions seamlessly into company onboarding.',
      automatedActions: ['Candidate profile converted to Employee record', 'Vacancy fill metric reported'],
      avgDays: 'Final'
    },
    {
      id: 9,
      name: 'Rejected',
      code: 'REJECTED',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-rose-500',
      description: 'Respectful and constructive feedback sent to candidate if not selected.',
      automatedActions: ['Personalized feedback email sent', 'Profile retained in talent pool for future openings'],
      avgDays: 'Archived'
    },
    {
      id: 10,
      name: 'Withdrawn',
      code: 'WITHDRAWN',
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-slate-400',
      description: 'Candidate voluntarily withdraws application at any point in the lifecycle.',
      automatedActions: ['Recruiter queue freed', 'Withdrawal reason survey logged'],
      avgDays: 'Closed'
    }
  ];

  const [activeStage, setActiveStage] = useState<PipelineStage>(stages[0]);

  return (
    <section id="ats-pipeline" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="primary" size="sm" className="bg-brand-900/60 border-brand-700 text-brand-300">
            <GitBranch className="w-3.5 h-3.5 text-brand-400" /> Complete Hiring Lifecycle
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            10-Stage Enterprise ATS Recruitment Pipeline
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every application status change is transactionally recorded with full audit trails, automated candidate communications, and interviewer feedback forms.
          </p>
        </div>

        {/* Stages Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mb-8">
          {stages.map((stage) => {
            const isSelected = activeStage.id === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage)}
                className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-24 cursor-pointer ${isSelected
                  ? 'bg-slate-800 border-brand-500 shadow-md ring-2 ring-brand-500/40'
                  : 'bg-slate-850/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{stage.id}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></span>
                </div>
                <div className="font-semibold text-xs text-slate-200 line-clamp-1">
                  {stage.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 sm:p-8 backdrop-blur-sm max-w-4xl mx-auto shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl text-white shadow-md ${activeStage.color}`}>
                {activeStage.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{activeStage.name}</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                    STAGE_{activeStage.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Average duration: {activeStage.avgDays}</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-700">
              <span className="text-brand-400 font-semibold">Audit Logging</span>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Stage Objective & Overview
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {activeStage.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Automated System Triggers & Notifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeStage.automatedActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/80 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

