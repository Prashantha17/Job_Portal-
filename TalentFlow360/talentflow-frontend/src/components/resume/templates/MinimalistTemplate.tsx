import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';

export const MinimalistTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects } = data;

  return (
    <div className="w-full bg-white text-black font-sans p-10 text-[12.5px] leading-relaxed">
      {/* Centered Minimal Header */}
      <header className="text-center pb-6 border-b border-black">
        <h1 className="text-2xl font-normal uppercase tracking-widest text-black">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mt-1">
          {personalInfo.targetRole || 'Professional'}
        </p>
        <div className="flex justify-center flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-neutral-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.linkedinUrl && <span>• LinkedIn</span>}
          {personalInfo.githubUrl && <span>• GitHub</span>}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="py-4 border-b border-neutral-200">
          <p className="text-neutral-800 leading-normal text-justify">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <section className="py-4 border-b border-neutral-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-semibold text-black">
                  <span>{exp.company} — <span className="font-normal italic">{exp.role}</span></span>
                  <span className="text-[11px] font-normal text-neutral-600 font-mono">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside pl-4 mt-1.5 space-y-1 text-neutral-700 text-xs">
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
        <section className="py-4 border-b border-neutral-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-3">
            Selected Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline font-medium text-black">
                  <span className="font-semibold">{proj.title}</span>
                  {proj.technologies && (
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-700 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Education side-by-side */}
      <div className="grid grid-cols-2 gap-8 pt-4">
        {/* Skills */}
        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-2">
              Skills
            </h2>
            <p className="text-xs text-neutral-700 leading-normal">
              {skills.join(' • ')}
            </p>
          </section>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {educations.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="font-semibold text-black">{edu.institution}</div>
                  <div className="text-neutral-700">{edu.degree}, {edu.fieldOfStudy} ({edu.endYear})</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

