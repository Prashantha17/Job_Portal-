import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

export const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, certifications, accentColor } = data;

  return (
    <div className="w-full bg-white text-slate-800 font-sans p-8 text-[13px] leading-relaxed">
      {/* Header */}
      <header className="border-b-2 pb-5 mb-5" style={{ borderColor: accentColor }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: accentColor }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p className="text-sm font-bold text-slate-600 mt-0.5 tracking-wide uppercase">
          {personalInfo.targetRole || 'Software Professional'}
        </p>

        {/* Contact info bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
          {personalInfo.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: accentColor }} />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" style={{ color: accentColor }} />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedinUrl && (
            <span className="flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5" style={{ color: accentColor }} />
              LinkedIn
            </span>
          )}
          {personalInfo.githubUrl && (
            <span className="flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" style={{ color: accentColor }} />
              GitHub
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
            Executive Summary
          </h2>
          <p className="text-slate-700 leading-normal text-justify">{summary}</p>
        </section>
      )}

      {/* Two-column body */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left main: Experience & Projects (2 cols) */}
        <div className="col-span-2 space-y-5">
          {/* Work Experience */}
          {experiences && experiences.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b border-slate-200" style={{ color: accentColor }}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative">
                    <div className="flex justify-between items-baseline flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm">{exp.role}</h3>
                      <span className="text-[11px] font-semibold text-slate-500 font-mono">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mb-1.5">
                      {exp.company} {exp.location && `• ${exp.location}`}
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

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b border-slate-200" style={{ color: accentColor }}>
                Key Technical Projects
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-xs">{proj.title}</h3>
                      {proj.role && <span className="text-[11px] text-slate-500">{proj.role}</span>}
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">
                        Tech Stack: {proj.technologies.join(', ')}
                      </div>
                    )}
                    <p className="text-xs text-slate-700 leading-snug">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar: Skills, Education, Certs (1 col) */}
        <div className="space-y-5">
          {/* Technical Skills */}
          {skills && skills.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200" style={{ color: accentColor }}>
                Core Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {educations && educations.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200" style={{ color: accentColor }}>
                Education
              </h2>
              <div className="space-y-2.5">
                {educations.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-900 text-xs">{edu.degree}</h3>
                    <div className="text-[11px] text-slate-600">{edu.fieldOfStudy}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{edu.institution}</div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Graduated: {edu.endYear}</span>
                      {edu.grade && <span className="font-semibold text-slate-600">{edu.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-2 pb-1 border-b border-slate-200" style={{ color: accentColor }}>
                Certifications
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {certifications.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="font-bold" style={{ color: accentColor }}>•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

