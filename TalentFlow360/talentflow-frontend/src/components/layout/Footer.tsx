import React from 'react';
import { Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                TalentFlow<span className="text-brand-400 font-black">360</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade recruitment lifecycle management and talent intelligence platform.
              Bridging job seekers, recruiters, HR leaders, and administrators with intelligent matching and automated workflows.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">


            </div>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Candidates</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#jobs" className="hover:text-white transition-colors">Browse Vacancies</a></li>
              <li><a href="#jobs" className="hover:text-white transition-colors">Smart Skill Matcher</a></li>
              <li><a href="#jobs" className="hover:text-white transition-colors">Resume Screening</a></li>
              <li><a href="#jobs" className="hover:text-white transition-colors">Application Tracker</a></li>
              <li><a href="#jobs" className="hover:text-white transition-colors">Interview Schedules</a></li>
            </ul>
          </div>

          {/* Recruiters & HR */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Employers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#recruiter-hub" className="hover:text-white transition-colors">Post a Vacancy (Recruiter Hub)</a></li>
              <li><a href="#ats-pipeline" className="hover:text-white transition-colors">10-Stage ATS Pipeline</a></li>
              <li><a href="#recruiter-hub" className="hover:text-white transition-colors">Candidate Shortlisting & Screening</a></li>
              <li><a href="#recruiter-hub" className="hover:text-white transition-colors">Recruiter Operations</a></li>
            </ul>
          </div>

          {/* Platform & Architecture */}
          <div>


          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} TalentFlow 360 Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
