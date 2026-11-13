import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';

export const StartupTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, accentColor } = data;

  return (
    <div className="w-full bg-white text-slate-800 font-sans p-6 text-[11.5px] leading-snug">
      {/* Compact Top Header */}
      <header className="flex justify-between items-start border-b pb-3 mb-3" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
            {personalInfo.targetRole || 'Growth Engineer'}
          </div>
        </div>

        <div className="text-right text-[10.5px] text-slate-500 space-y-0.5">
          <div>{personalInfo.email} • {personalInfo.phone}</div>
          <div>{personalInfo.location} • {personalInfo.linkedinUrl && 'LinkedIn'} • {personalInfo.githubUrl && 'GitHub'}</div>
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <div className="mb-3 text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200/60">
          "{summary}"
        </div>
      )}

      {/* Dense 2-Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Main 8 Cols: Experience & Projects */}
        <div className="col-span-8 space-y-3">
          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-wider mb-2 text-slate-900 border-b pb-0.5" style={{ borderColor: accentColor }}>
                Experience
              </h2>
              <div className="space-y-2.5">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                      <span>{exp.role} @ <span style={{ color: accentColor }}>{exp.company}</span></span>
                      <span className="text-[10px] font-mono font-normal text-slate-500">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.highlights && (
                      <ul className="list-disc list-outside pl-3.5 space-y-0.5 text-slate-700 text-[11px] mt-0.5">
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
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-wider mb-2 text-slate-900 border-b pb-0.5" style={{ borderColor: accentColor }}>
                Key Technical Builds
              </h2>
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="font-bold text-slate-900 text-[11.5px] flex justify-between">
                      <span>{proj.title}</span>
                      {proj.technologies && (
                        <span className="font-mono text-[9.5px] text-slate-400">
                          {proj.technologies.slice(0, 4).join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-600 mt-0.5">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Side 4 Cols: Skills, Education, Quick Stats */}
        <div className="col-span-4 space-y-3">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-wider mb-1.5 text-slate-900 border-b pb-0.5" style={{ borderColor: accentColor }}>
                Skills & Stack
              </h2>
              <div className="flex flex-wrap gap-1">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {educations && educations.length > 0 && (
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-wider mb-1.5 text-slate-900 border-b pb-0.5" style={{ borderColor: accentColor }}>
                Education
              </h2>
              <div className="space-y-1.5">
                {educations.map((edu) => (
                  <div key={edu.id} className="text-[10.5px]">
                    <div className="font-bold text-slate-800">{edu.degree}</div>
                    <div className="text-slate-600">{edu.fieldOfStudy}</div>
                    <div className="text-slate-400 font-mono text-[9.5px]">{edu.institution} ({edu.endYear})</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Impact Stats Box */}
          <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: accentColor }}>
            <div className="font-bold text-[10px] uppercase tracking-wider">Candidate Snapshot</div>
            <div className="mt-1 text-[11px] space-y-0.5">
              <div>🎯 <strong>Role:</strong> {personalInfo.targetRole || 'Full Stack'}</div>
              <div>⚡ <strong>Availability:</strong> Immediate / 15d</div>
              <div>🌐 <strong>Location:</strong> {personalInfo.location || 'India'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

