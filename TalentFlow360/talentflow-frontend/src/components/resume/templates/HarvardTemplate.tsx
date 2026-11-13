import React from 'react';
import { ResumeData } from '../../../types/resumeBuilder';

export const HarvardTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, certifications } = data;

  return (
    <div className="w-full bg-white text-black font-serif p-10 text-[12px] leading-relaxed">
      {/* Centered Harvard Header */}
      <header className="text-center pb-3 border-b-2 border-black">
        <h1 className="text-2xl font-bold tracking-wide uppercase text-black">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <div className="text-[11px] text-black mt-1 font-sans">
          {[personalInfo.location, personalInfo.phone, personalInfo.email, personalInfo.linkedinUrl && 'LinkedIn', personalInfo.githubUrl && 'GitHub']
            .filter(Boolean)
            .join(' | ')}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 font-sans">
            Professional Summary
          </h2>
          <p className="text-black text-justify leading-normal">{summary}</p>
        </section>
      )}

      {/* Education First (Harvard standard) */}
      {educations && educations.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2 font-sans">
            Education
          </h2>
          <div className="space-y-2">
            {educations.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline font-bold text-black text-xs">
                  <span>{edu.institution}</span>
                  <span className="font-normal font-sans text-[11px]">{edu.endYear}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs italic text-black">
                  <span>{edu.degree} in {edu.fieldOfStudy}</span>
                  {edu.grade && <span className="font-normal font-sans text-[11px] not-italic">GPA: {edu.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2.5 font-sans">
            Professional Experience
          </h2>
          <div className="space-y-3.5">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-black text-xs">
                  <span>{exp.company}</span>
                  <span className="font-normal font-sans text-[11px]">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="italic text-xs text-black mb-1">
                  {exp.role} {exp.location && `| ${exp.location}`}
                </div>
                {exp.highlights && (
                  <ul className="list-disc list-outside pl-4 space-y-1 text-black text-xs">
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

      {/* Selected Technical Projects */}
      {projects && projects.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2 font-sans">
            Technical Projects & Initiatives
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-black">{proj.title}</span>
                  {proj.technologies && (
                    <span className="font-sans text-[10px] text-neutral-600">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-black mt-0.5 leading-snug">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Certifications */}
      <section className="mt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 font-sans">
          Technical Skills & Certifications
        </h2>
        {skills && skills.length > 0 && (
          <div className="text-xs text-black">
            <strong className="font-sans text-[11px] uppercase tracking-wider">Skills:</strong> {skills.join(', ')}
          </div>
        )}
        {certifications && certifications.length > 0 && (
          <div className="text-xs text-black mt-1">
            <strong className="font-sans text-[11px] uppercase tracking-wider">Certifications:</strong> {certifications.join('; ')}
          </div>
        )}
      </section>
    </div>
  );
};

