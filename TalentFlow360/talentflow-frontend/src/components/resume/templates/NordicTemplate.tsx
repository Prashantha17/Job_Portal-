import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';
import { Mail, Phone, MapPin } from 'lucide-react';

export const NordicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, certifications, accentColor } = data;

  return (
    <div className="w-full bg-slate-50 text-slate-800 font-sans p-8 text-[12.5px] leading-relaxed">
      {/* Soft Nordic Header Box */}
      <header className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-0.5">
            {personalInfo.targetRole || 'Engineer'}
          </p>
        </div>

        <div className="flex flex-wrap md:flex-col md:items-end gap-1.5 text-xs text-slate-300">
          {personalInfo.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.email}</span>}
          {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.phone}</span>}
          {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {personalInfo.location}</span>}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column 2/3 */}
        <div className="col-span-2 space-y-5">
          {/* Summary */}
          {summary && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                Professional Summary
              </h2>
              <p className="text-slate-600 leading-normal text-justify">{summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {experiences && experiences.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                Work Experience
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-xs">{exp.role}</h3>
                      <span className="text-[10px] font-mono font-medium text-slate-400">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">{exp.company}</div>
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
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                Projects
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="font-bold text-slate-900 text-xs">{proj.title}</h3>
                    {proj.technologies && (
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {proj.technologies.join(', ')}
                      </div>
                    )}
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar 1/3 */}
        <div className="space-y-5">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {educations && educations.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                Education
              </h2>
              <div className="space-y-2">
                {educations.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-slate-800 text-xs">{edu.degree}</div>
                    <div className="text-[11px] text-slate-500">{edu.fieldOfStudy}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{edu.institution} ({edu.endYear})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Certifications
              </h2>
              <ul className="space-y-1 text-xs text-slate-600">
                {certifications.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span style={{ color: accentColor }}>✓</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
