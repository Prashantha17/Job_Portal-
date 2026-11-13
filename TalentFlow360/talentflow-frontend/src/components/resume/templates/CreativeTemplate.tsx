import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';
import { Mail, Phone, MapPin, Sparkles, ExternalLink } from 'lucide-react';

export const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, accentColor } = data;

  return (
    <div className="w-full bg-slate-50/50 text-slate-800 font-sans p-8 text-[12.5px] leading-relaxed">
      {/* Creative Card Header */}
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {personalInfo.fullName || 'Your Name'}
              </h1>
              <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <p className="text-xs font-bold mt-0.5 uppercase tracking-wider" style={{ color: accentColor }}>
              {personalInfo.targetRole || 'Creative Technologist'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 text-xs text-slate-500">
            {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {personalInfo.email}</span>}
            {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {personalInfo.phone}</span>}
            {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {personalInfo.location}</span>}
          </div>
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: accentColor }}>
            About Me
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Skills Matrix */}
      {skills && skills.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider mb-2.5" style={{ color: accentColor }}>
            Skill Matrix & Toolset
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-xs"
                style={{ backgroundColor: accentColor }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience & Projects */}
      <div className="space-y-6">
        {experiences && experiences.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-xs font-black uppercase tracking-wider mb-4 pb-1 border-b border-slate-100" style={{ color: accentColor }}>
              Experience Journey
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h3 className="font-extrabold text-slate-900 text-xs">{exp.role}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mb-1.5">{exp.company}</div>
                  {exp.highlights && (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-slate-600 text-xs">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b border-slate-100" style={{ color: accentColor }}>
              Featured Showcase Projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>{proj.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </h3>
                  {proj.technologies && (
                    <div className="text-[10px] font-semibold text-brand-600 mt-0.5">
                      {proj.technologies.join(' • ')}
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100" style={{ color: accentColor }}>
              Education
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {educations.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-slate-800">{edu.degree} - {edu.fieldOfStudy}</div>
                  <div className="text-slate-500">{edu.institution} ({edu.endYear})</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

