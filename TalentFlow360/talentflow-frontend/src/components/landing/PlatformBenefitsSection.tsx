import React from 'react';
import { Sparkles, GitPullRequest, Calendar, BarChart3, ShieldCheck, Zap, FileText } from 'lucide-react';
import { Badge } from '../common/Badge';

export const PlatformBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Sparkles className="w-6 h-6 text-brand-600" />,
      title: 'Smart Candidate Matching Engine',
      description: 'Configurable skill-based recommendation algorithm evaluating candidate proficiency, years of experience, certifications, and educational pedigree with an explainable matching score.',
      badge: 'Core Feature'
    },
    {
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      title: 'AI Resume Builder Studio',
      description: '10 ATS-optimized designer templates, live dual-pane preview, AI bullet-point enhancer, and 1-click vector PDF generation tailored to Indian tech ecosystem job postings.',
      badge: 'Candidate Studio',
      actionUrl: '#resume-builder',
      actionText: 'Build AI Resume →'
    },
    {
      icon: <GitPullRequest className="w-6 h-6 text-indigo-600" />,
      title: 'Real-World 10-Stage ATS Pipeline',
      description: 'Move candidates frictionlessly through Applied, Shortlisted, Tech & HR Interviews, all the way to Hired. Every step updates audit logs and emits in-app notifications.',
      badge: 'Enterprise ATS'
    },
    {
      icon: <Calendar className="w-6 h-6 text-teal-600" />,
      title: 'Complete Interview Lifecycle',
      description: 'Coordinate multi-panel interviews, send automated calendar invites, allow candidate self-confirmation or rescheduling, and gather structured interviewer feedback scorecards.',
      badge: 'Integrated Scheduling'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
      title: 'Real-time Recruitment Analytics',
      description: 'Live visibility into candidate pipelines, vacancy time-to-hire, recruiter activity velocity, stage-by-stage drop-off analytics, and executive hiring reports.',
      badge: 'Intelligence'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Role-Based Access Control (4 Roles)',
      description: 'Strict architectural segregation for Job Seekers, Recruiters, HR Managers, and Super Administrators powered by Spring Security 6 and stateless JWT tokens.',
      badge: 'Security & Compliance'
    },
    {
      icon: <Zap className="w-6 h-6 text-cyan-600" />,
      title: 'High-Performance Spring Boot 3.4',
      description: 'Engineered with Java 25, HikariCP connection pooling, MySQL 8.4 database normalization, Flyway schema migrations, and OpenAPI 3 Swagger documentation.',
      badge: 'Cloud Native'
    }
  ];

  return (
    <section id="benefits" className="pt-12 pb-16 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <Badge variant="primary" size="sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Platform Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Real-World Recruitment Workflows
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Engineered from the ground up to replace fragmented spreadsheets, disorganized emails, and basic CRUD toys with a production-grade hiring engine.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                    {benefit.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {benefit.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center text-xs font-semibold">
                {(benefit as any).actionUrl ? (
                  <a href={(benefit as any).actionUrl} className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-bold">
                    {(benefit as any).actionText}
                  </a>
                ) : (
                  <span className="text-brand-600 hover:text-brand-700 cursor-pointer">Learn how it works →</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

