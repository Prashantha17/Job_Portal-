import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

export const ExecutiveTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, accentColor } = data;

  return (
    <div className="w-full bg-white text-slate-800 font-serif text-[13px] leading-relaxed">
      {/* Executive Dark Top Banner */}
      <header className="p-8 text-white" style={{ backgroundColor: accentColor }}>
        <h1 className="text-3xl font-bold tracking-normal font-sans uppercase">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p className="text-sm font-semibold text-slate-200 mt-1 tracking-wider uppercase font-sans">
          {personalInfo.targetRole || 'Executive Leadership'}
        </p>

        {/* Contact details */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 text-xs text-slate-200 font-sans">
          {personalInfo.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {personalInfo.email}</span>}
          {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {personalInfo.phone}</span>}
          {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {personalInfo.location}</span>}
          {personalInfo.linkedinUrl && <span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</span>}
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Executive Summary */}
        {summary && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 pb-1 border-b-2 font-sans" style={{ borderColor: accentColor }}>
              Executive Profile
            </h2>
            <p className="mt-2 text-slate-700 leading-relaxed text-justify">{summary}</p>
          </section>
        )}

        {/* Professional Experience */}
        {experiences && experiences.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 pb-1 border-b-2 font-sans" style={{ borderColor: accentColor }}>
              Professional Experience
            </h2>
            <div className="mt-3 space-y-5">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-sans">
                    <h3 className="font-bold text-slate-950 text-sm">{exp.role}</h3>
                    <span className="text-xs font-semibold text-slate-600">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs italic text-slate-600 mb-2">
                    {exp.company} {exp.location && `| ${exp.location}`}
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
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

        {/* Key Projects & Initiatives */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 pb-1 border-b-2 font-sans" style={{ borderColor: accentColor }}>
              Strategic Initiatives & Projects
            </h2>
            <div className="mt-3 space-y-3 font-sans">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-xs">{proj.title}</h3>
                    {proj.role && <span className="text-[11px] text-slate-500 font-serif italic">{proj.role}</span>}
                  </div>
                  {proj.technologies && (
                    <div className="text-[11px] font-semibold text-slate-500 mb-0.5">
                      Core Frameworks: {proj.technologies.join(', ')}
                    </div>
                  )}
                  <p className="text-xs text-slate-700 leading-snug font-serif">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Core Competencies Split */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          {educations && educations.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-1 border-b font-sans" style={{ borderColor: accentColor }}>
                Academic Background
              </h2>
              <div className="mt-2 space-y-2 font-sans">
                {educations.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-900 text-xs">{edu.degree}</h3>
                    <div className="text-xs text-slate-600">{edu.fieldOfStudy}</div>
                    <div className="text-[11px] text-slate-500">{edu.institution} ({edu.endYear})</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills && skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-1 border-b font-sans" style={{ borderColor: accentColor }}>
                Executive Competencies
              </h2>
              <div className="mt-2 flex flex-wrap gap-1 font-sans">
                {skills.map((s, i) => (
                  <span key={i} className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

