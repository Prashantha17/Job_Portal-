import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';

export const TimelineTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, accentColor } = data;

  return (
    <div className="w-full bg-white text-slate-800 font-sans p-8 text-[12.5px] leading-relaxed">
      {/* Header */}
      <header className="flex justify-between items-start border-b pb-4 mb-5" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: accentColor }}>
            {personalInfo.targetRole || 'Software Professional'}
          </p>
        </div>

        <div className="text-right text-xs text-slate-500 space-y-0.5">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-5">
          <p className="text-slate-700 leading-normal text-justify text-xs">{summary}</p>
        </section>
      )}

      {/* Timeline Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider mb-4 pb-1 border-b border-slate-200" style={{ color: accentColor }}>
            Career Timeline
          </h2>
          <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative">
                {/* Node dot */}
                <div
                  className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900 text-xs">{exp.role}</h3>
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-600 mb-1">{exp.company}</div>
                {exp.highlights && (
                  <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 text-xs">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b border-slate-200" style={{ color: accentColor }}>
            Projects & Deliverables
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                  <span>{proj.title}</span>
                  {proj.technologies && (
                    <span className="text-[10px] font-normal text-slate-500 font-mono">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Education */}
      <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-200">
        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: accentColor }}>
              Technical Skills
            </h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {educations && educations.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: accentColor }}>
              Education
            </h2>
            <div className="space-y-1.5 text-xs">
              {educations.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600">{edu.fieldOfStudy} • {edu.institution} ({edu.endYear})</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
