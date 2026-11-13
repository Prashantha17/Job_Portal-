import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';

export const TwoColumnTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, certifications, accentColor } = data;

  return (
    <div className="w-full bg-white text-slate-800 font-sans flex min-h-[840px] text-[12px] leading-relaxed">
      {/* Left Sidebar (1 col) */}
      <aside className="w-1/3 p-6 text-white space-y-6 shrink-0" style={{ backgroundColor: accentColor }}>
        {/* Name in sidebar */}
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-xs font-semibold text-slate-200 mt-1 uppercase tracking-wider">
            {personalInfo.targetRole || 'Specialist'}
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-2 text-[11px] text-slate-100">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1">
            Contact
          </h2>
          {personalInfo.email && <div className="break-all">{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedinUrl && <div>LinkedIn Profile</div>}
          {personalInfo.githubUrl && <div>GitHub Profile</div>}
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="space-y-2 text-[11px]">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1">
              Skills & Tech
            </h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white/20 text-white font-medium text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <div className="space-y-2.5 text-[11px]">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1">
              Education
            </h2>
            {educations.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
                <div className="font-bold text-white text-xs">{edu.degree}</div>
                <div className="text-slate-200 text-[10px]">{edu.fieldOfStudy}</div>
                <div className="text-slate-300 text-[10px]">{edu.institution}</div>
                <div className="text-slate-300 text-[10px]">Batch: {edu.endYear}</div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="space-y-1.5 text-[11px]">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1">
              Certifications
            </h2>
            {certifications.map((c, i) => (
              <div key={i} className="text-slate-200 text-[10px] leading-tight">
                • {c}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Right Content Area (2 cols) */}
      <main className="w-2/3 p-7 space-y-6">
        {/* Profile Summary */}
        {summary && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider mb-1.5 pb-1 border-b-2" style={{ borderColor: accentColor, color: accentColor }}>
              Professional Profile
            </h2>
            <p className="text-slate-700 leading-normal text-justify text-xs">{summary}</p>
          </section>
        )}

        {/* Work History */}
        {experiences && experiences.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b-2" style={{ borderColor: accentColor, color: accentColor }}>
              Experience & Achievements
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-xs">{exp.role}</h3>
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">{exp.company}</div>
                  {exp.highlights && (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 text-xs">
                      {exp.highlights.map((h, i) => (
                        <li key={i} className="leading-snug">{h}</li>
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
            <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 pb-1 border-b-2" style={{ borderColor: accentColor, color: accentColor }}>
              Key Technical Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="font-bold text-slate-900 text-xs">{proj.title}</div>
                  {proj.technologies && (
                    <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                      Stack: {proj.technologies.join(', ')}
                    </div>
                  )}
                  <p className="text-xs text-slate-700 leading-snug">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
