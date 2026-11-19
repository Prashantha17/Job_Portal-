import React from 'react';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award,
  FileText, Globe, Linkedin, Github, ExternalLink, ShieldCheck,
  Calendar, Edit3, IndianRupee, Sparkles, Download
} from 'lucide-react';
import { CandidateProfile, downloadResumeFile } from '../../services/profileService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatSingleSalary } from '../../utils/currencyFormatter';

interface CandidateProfileFullViewProps {
  profile: CandidateProfile;
  isOwner?: boolean;
  showHeaderBanner?: boolean;
  onEditProfile?: () => void;
  onNavigateTab?: (tab: string) => void;
  onScheduleInterview?: () => void;
  applicationNote?: string;
}

export const CandidateProfileFullView: React.FC<CandidateProfileFullViewProps> = ({
  profile,
  isOwner = false,
  showHeaderBanner = true,
  onEditProfile,
  onNavigateTab,
  onScheduleInterview,
  applicationNote,
}) => {
  const getProficiencyBadge = (level: string) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADVANCED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatSafeDate = (dateStr?: string, showMonth: boolean = true): string => {
    if (!dateStr) return '';
    const trimmed = String(dateStr).trim();
    if (/^\d{4}$/.test(trimmed)) return trimmed;
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', showMonth ? { month: 'short', year: 'numeric' } : { year: 'numeric' });
    }
    return trimmed;
  };

  const calculateHike = (current?: number, expected?: number): number | null => {
    if (!current || !expected || current <= 0) return null;
    const diff = expected - current;
    return Math.round((diff / current) * 100);
  };

  const hikePercent = calculateHike(profile.currentSalary, profile.expectedSalary);
  const primaryResume = profile.resumes && profile.resumes.length > 0
    ? (profile.resumes.find(r => r.isPrimary) || profile.resumes[0])
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner: Seamlessly Aligned */}
      {showHeaderBanner && (
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          {/* Subtle Ambient Decorative Glow */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar + Identity Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 min-w-0 w-full md:w-auto">
              {/* Avatar Box with Initials */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-400 to-indigo-400 p-1 shadow-xl shrink-0 mx-auto sm:mx-0">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl uppercase tracking-wider">
                  {profile.firstName ? profile.firstName.charAt(0) : 'C'}
                  {profile.lastName ? profile.lastName.charAt(0) : ''}
                </div>
              </div>

              {/* Name, Headline, and Contact Chips */}
              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Candidate Profile'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Candidate
                  </span>
                </div>

                <p className="text-sm font-semibold text-brand-200">
                  {profile.headline || 'Software Engineering Professional'}
                </p>

                {/* Contact & Meta Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-300">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                  {profile.totalExperienceYears != null && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Briefcase className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                      <span>{profile.totalExperienceYears} Yrs Experience</span>
                    </span>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{profile.email}</span>
                    </a>
                  )}
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{profile.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Portfolio Links & Action Buttons */}
            <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-center sm:justify-start gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800 w-full md:w-auto">
              <div className="flex items-center gap-2 flex-wrap">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-blue-400/60" />
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3 text-purple-400/60" />
                  </a>
                )}
              </div>

              {primaryResume && (
                <button
                  type="button"
                  onClick={() => downloadResumeFile(primaryResume.filePath, primaryResume.fileName || primaryResume.title || 'Candidate_Resume.pdf', primaryResume.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Download candidate's verified resume PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CV</span>
                </button>
              )}
              {isOwner && onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brand-600" /> Edit Profile
                </button>
              )}
              {!isOwner && onScheduleInterview && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onScheduleInterview}
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  className="shadow-md bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                >
                  Schedule Round
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recruiter Cover Note / Application Remark if present */}
      {applicationNote && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Applicant's Submission Note / Cover Letter:</span>
          </div>
          <p className="text-amber-950 leading-relaxed whitespace-pre-line">{applicationNote}</p>
        </div>
      )}

      {/* 2. Grid: About + Compensation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Professional Summary */}
        <Card className="p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" /> Professional Summary
              </h3>
              {isOwner && onEditProfile && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onEditProfile}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" /> ✨ AI Generate
                  </button>
                  <button
                    onClick={onEditProfile}
                    className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Bio
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {profile.bio ||
                'No summary provided yet. Candidate has not filled out a detailed bio statement.'}
            </p>

            {!profile.bio && isOwner && onEditProfile && (
              <div className="mt-4 p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <p className="text-xs text-purple-900 font-medium">
                    No summary written yet? Let AI synthesize an ATS-optimized bio from your skills, experience, education, and resume.
                  </p>
                </div>
                <button
                  onClick={onEditProfile}
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap transition-colors cursor-pointer"
                >
                  ✨ AI Write Summary
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* CTC & Compensation Profile */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" /> Salary Expectations
              </h3>
              {hikePercent !== null && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    hikePercent >= 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {hikePercent >= 0 ? `+${hikePercent}% Hike` : `${hikePercent}%`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl flex flex-col justify-between border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current</span>
                <span className="text-sm font-black text-slate-900 mt-1">
                  {profile.currentSalary ? formatSingleSalary(profile.currentSalary) : 'Not disclosed'}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Target CTC</span>
                <span className="text-sm font-black text-emerald-700 mt-1">
                  {profile.expectedSalary ? formatSingleSalary(profile.expectedSalary) : 'Negotiable'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Compensation formatted in Indian standard LPA
          </p>
        </Card>
      </div>

      {/* 3. Technical Skills Matrix */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-600" /> Technical Skills & Proficiency Matrix
              </h3>
              {profile.skills && profile.skills.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {profile.skills.length} skills
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified skills, declared proficiency tiers, and hands-on experience
            </p>
          </div>
          {isOwner && onNavigateTab && (
            <button
              onClick={() => onNavigateTab('skills')}
              className="text-xs font-bold text-brand-600 hover:underline cursor-pointer shrink-0"
            >
              Manage Skills &rarr;
            </button>
          )}
        </div>

        {profile.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {profile.skills.map((skill) => (
              <div
                key={skill.id || skill.skillName}
                className="px-3.5 py-2 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-brand-300 transition-all flex items-center gap-2.5 shadow-2xs hover:shadow-xs"
              >
                <span className="text-xs font-bold text-slate-800">{skill.skillName}</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getProficiencyBadge(
                    skill.proficiencyLevel
                  )}`}
                >
                  {skill.proficiencyLevel}
                </span>
                {skill.yearsOfExperience != null && (
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">
                    {skill.yearsOfExperience}y
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-400">No technical skills added yet.</p>
          </div>
        )}
      </Card>

      {/* 4. Work Experience Timeline (Pixel-Perfect Alignment Guaranteed) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" /> Work Experience & Career Journey
              </h3>
              {profile.experiences && profile.experiences.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {profile.experiences.length} positions
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Employment history, engineering roles, and achievements
            </p>
          </div>
          {isOwner && onNavigateTab && (
            <button
              onClick={() => onNavigateTab('experience')}
              className="text-xs font-bold text-brand-600 hover:underline cursor-pointer shrink-0"
            >
              + Add Experience
            </button>
          )}
        </div>

        {profile.experiences && profile.experiences.length > 0 ? (
          <div className="space-y-1">
            {profile.experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="flex gap-4 group">
                {/* Left Timeline Column: Guaranteed 100% Dead-Center Alignment */}
                <div className="flex flex-col items-center shrink-0 w-6">
                  {/* Timeline Dot */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs mt-3.5 shrink-0 ${
                      exp.isCurrent
                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                        : 'bg-brand-600 ring-4 ring-brand-100'
                    }`}
                  />
                  {/* Vertical connecting line stops at the last element */}
                  {idx < profile.experiences.length - 1 && (
                    <div className="w-0.5 bg-slate-200 flex-1 my-1.5" />
                  )}
                </div>

                {/* Right Experience Card */}
                <div className="flex-1 pb-5 min-w-0">
                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{exp.jobTitle}</h4>
                          <span className="text-xs font-bold text-brand-600">@ {exp.companyName}</span>
                        </div>
                        {exp.location && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" /> {exp.location}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs shrink-0">
                        {exp.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Current Role
                          </span>
                        )}
                        <span className="text-slate-500 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {formatSafeDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatSafeDate(exp.endDate)}
                        </span>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pt-2 border-t border-slate-200/60">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-400">No work experience entries recorded.</p>
          </div>
        )}
      </Card>

      {/* 5. Education Background */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-600" /> Academic & Educational Background
              </h3>
              {profile.educations && profile.educations.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {profile.educations.length} degrees
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Degrees, universities, and academic credentials</p>
          </div>
          {isOwner && onNavigateTab && (
            <button
              onClick={() => onNavigateTab('education')}
              className="text-xs font-bold text-brand-600 hover:underline cursor-pointer shrink-0"
            >
              + Add Education
            </button>
          )}
        </div>

        {profile.educations && profile.educations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.educations.map((edu, idx) => (
              <div
                key={edu.id || idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{edu.degree}</h4>
                    {edu.grade && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 shrink-0">
                        {edu.grade}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-xs text-slate-500 font-medium">Major: {edu.fieldOfStudy}</p>
                  )}
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-[11px] text-slate-400 font-medium pt-0.5">
                      {formatSafeDate(edu.startDate, false)} — {edu.endDate ? formatSafeDate(edu.endDate, false) : 'Graduated'}
                    </p>
                  )}
                  {edu.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200/50 mt-1">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-400">No academic degrees listed yet.</p>
          </div>
        )}
      </Card>

      {/* 6. Attached Resumes & Portfolio Documents */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" /> Attached Resumes & CV Artifacts
              </h3>
              {profile.resumes && profile.resumes.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {profile.resumes.length} files
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified resumes and ATS portfolio documents
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#resume-builder';
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                AI Builder
              </button>
            )}
            {isOwner && onNavigateTab && (
              <button
                onClick={() => onNavigateTab('resumes')}
                className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
              >
                Upload / Manage &rarr;
              </button>
            )}
          </div>
        </div>

        {profile.resumes && profile.resumes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.resumes.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{res.title}</h4>
                      {res.isPrimary && (
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {res.fileName} • {formatSafeDate(res.uploadedAt)}
                    </span>
                  </div>
                </div>

                {res.filePath && (
                  <button
                    type="button"
                    onClick={() => downloadResumeFile(res.filePath, res.fileName || res.title || 'Resume.pdf', res.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-400">No resumes uploaded to portfolio yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
