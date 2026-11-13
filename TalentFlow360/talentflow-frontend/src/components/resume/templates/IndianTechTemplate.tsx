import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';
import { Mail, Phone, Linkedin, Github, CheckCircle2 } from 'lucide-react';

export const IndianTechTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const {
    personalInfo,
    summary,
    experiences,
    educations,
    skills,
    projects,
    certifications,
    totalExperienceYears,
    currentNoticePeriod,
    accentColor
  } = data;

  return (
    <div className="w-full bg-white text-slate-800 font-sans p-7 text-[12px] leading-relaxed">
      {/* Header with Indian Tech Hiring Highlights Banner */}
      <header className="border-b-2 pb-4 mb-4" style={{ borderColor: accentColor }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: accentColor }}>
              {personalInfo.targetRole || 'Senior Software Engineer'}
            </p>
          </div>

          {/* Quick IT recruiter screening pill box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[10.5px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <div>
              <span className="text-slate-400 block font-semibold">Total Experience:</span>
              <strong className="text-slate-900">{totalExperienceYears || '4+ Years'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Notice Period:</span>
              <strong className="text-emerald-700">{currentNoticePeriod || 'Immediate / 15 Days'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Location / Base:</span>
              <strong className="text-slate-900">{personalInfo.location || 'Bengaluru, India'}</strong>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-600">
          {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" style={{ color: accentColor }} /> {personalInfo.email}</span>}
          {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" style={{ color: accentColor }} /> {personalInfo.phone}</span>}
          {personalInfo.linkedinUrl && <span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" style={{ color: accentColor }} /> LinkedIn</span>}
          {personalInfo.githubUrl && <span className="flex items-center gap-1"><Github className="w-3.5 h-3.5" style={{ color: accentColor }} /> GitHub</span>}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-wider mb-1" style={{ color: accentColor }}>
            Executive Summary
          </h2>
          <p className="text-slate-700 text-xs leading-normal text-justify">{summary}</p>
        </section>
      )}

      {/* Technical Skill Matrix */}
      {skills && skills.length > 0 && (
        <section className="mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
          <h2 className="text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
            Core Technical Skills & Stack
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200/90 shadow-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Professional Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-wider mb-2.5 pb-0.5 border-b border-slate-200" style={{ color: accentColor }}>
            Professional Work Experience
          </h2>
          <div className="space-y-3.5">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                  <span>{exp.role} — <span style={{ color: accentColor }}>{exp.company}</span></span>
                  <span className="text-[10px] font-mono font-medium text-slate-500">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate} {exp.location && `(${exp.location})`}
                  </span>
                </div>
                {exp.highlights && (
                  <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 text-xs mt-1">
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

      {/* Major Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-wider mb-2 pb-0.5 border-b border-slate-200" style={{ color: accentColor }}>
            Key Projects & Architectural Contributions
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-xs">{proj.title}</span>
                  {proj.technologies && (
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Certifications Row */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        {educations && educations.length > 0 && (
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
              Education
            </h2>
            <div className="space-y-1 text-xs">
              {educations.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600">{edu.fieldOfStudy} • {edu.institution} ({edu.endYear})</div>
                  {edu.grade && <div className="text-[10px] text-slate-500">Score / CGPA: {edu.grade}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications && certifications.length > 0 && (
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
              Certifications
            </h2>
            <ul className="space-y-1 text-xs text-slate-700">
              {certifications.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

