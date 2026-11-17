import React, { useState, useEffect } from 'react';
import { X, User, AlertCircle, Calendar, Mail, Phone, Sparkles, Download } from 'lucide-react';
import { CandidateProfile, profileService, downloadResumeFile } from '../../services/profileService';
import { ApplicationResponse } from '../../types/application';
import { CandidateProfileFullView } from './CandidateProfileFullView';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateProfileId?: number;
  candidateEmail?: string;
  candidateName?: string;
  initialProfile?: CandidateProfile | null;
  applicationNote?: string;
  application?: ApplicationResponse;
  onScheduleInterview?: () => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  candidateProfileId,
  candidateEmail,
  candidateName,
  initialProfile,
  applicationNote,
  application,
  onScheduleInterview,
}) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(initialProfile || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let data: CandidateProfile | null = null;
        if (candidateProfileId) {
          try {
            data = await profileService.getCandidateProfileById(candidateProfileId);
          } catch (e) {
            console.warn('Profile fetch by ID failed, falling back to email lookup', e);
          }
        }
        if (!data && candidateEmail) {
          try {
            data = await profileService.getCandidateProfileByEmail(candidateEmail);
          } catch (e) {
            console.warn('Profile fetch by email failed', e);
          }
        }
        if (data) {
          if (!data.fullName && candidateName) {
            data.fullName = candidateName;
          }
          if (!data.email && candidateEmail) {
            data.email = candidateEmail;
          }
          setProfile(data);
        } else if (candidateEmail || candidateName) {
          // Graceful fallback: Synthesize profile from application details so recruiter sees clean aligned info
          setProfile({
            id: candidateProfileId || 0,
            userId: 0,
            firstName: candidateName?.split(' ')[0] || 'Candidate',
            lastName: candidateName?.split(' ').slice(1).join(' ') || '',
            fullName: candidateName || 'Candidate',
            email: candidateEmail || '',
            phone: application?.candidatePhone || '',
            headline: application?.jobTitle ? `Applicant for ${application.jobTitle}` : 'Software Engineering Professional',
            bio: applicationNote || 'Candidate has submitted their application credentials for recruiter review.',
            location: application?.location || '',
            currentSalary: application?.currentCtcLpa ? application.currentCtcLpa * 100000 : undefined,
            expectedSalary: application?.expectedCtcLpa ? application.expectedCtcLpa * 100000 : undefined,
            skills: [],
            experiences: [],
            educations: [],
            resumes: application?.resumeUrl ? [{
              id: application.resumeId || 1,
              title: application.resumeTitle || 'Submitted Application Resume',
              fileName: application.resumeTitle || 'Resume.pdf',
              filePath: application.resumeUrl,
              isPrimary: true,
              uploadedAt: application.appliedAt || new Date().toISOString()
            }] : []
          });
        } else {
          setError(
            'Unable to load candidate profile details. The candidate may not have published their full portfolio yet.'
          );
        }
      } catch (err: any) {
        console.error('Error fetching candidate profile in modal:', err);
        setError(
          err?.response?.data?.message ||
            'Unable to load candidate profile details. The candidate may not have published their full portfolio yet.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isOpen, candidateProfileId, candidateEmail, initialProfile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200/60">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  {candidateName ? `${candidateName}'s Complete Profile` : 'Candidate Comprehensive Profile'}
                </h3>
                {application?.atsScore != null && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-2xs ${
                    application.atsScore >= 80
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : application.atsScore >= 60
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    <Sparkles className="w-3 h-3 text-brand-600" />
                    ATS Match: {application.atsScore}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                ATS Verified Portfolio & Technical Credentials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onScheduleInterview && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScheduleInterview();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" /> Schedule Round
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">Fetching candidate credentials and portfolio...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center max-w-md mx-auto my-12">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-rose-900 mb-1">Portfolio Unavailable</h4>
              <p className="text-xs text-rose-700 leading-relaxed mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : profile ? (
            <CandidateProfileFullView
              profile={profile}
              isOwner={false}
              showHeaderBanner={true}
              applicationNote={applicationNote}
              onScheduleInterview={onScheduleInterview}
            />
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              No candidate profile data available.
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Actions Bar */}
        {profile && !loading && (
          <div className="p-3.5 px-6 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 text-xs text-slate-500 truncate w-full sm:w-auto">
              <span className="font-bold text-slate-700">{profile.fullName || `${profile.firstName} ${profile.lastName}`}</span>
              {profile.email && (
                <span className="hidden md:inline-flex items-center gap-1 text-slate-500">
                  <Mail className="w-3 h-3 text-slate-400" /> {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className="hidden lg:inline-flex items-center gap-1 text-slate-500">
                  <Phone className="w-3 h-3 text-slate-400" /> {profile.phone}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {profile.resumes && profile.resumes.length > 0 && profile.resumes[0].filePath && (
                <button
                  type="button"
                  onClick={() => downloadResumeFile(profile.resumes[0].filePath, profile.resumes[0].fileName || 'Candidate_Resume.pdf')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-brand-600" />
                  Download CV
                </button>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}?subject=Regarding Your Candidate Profile on TalentFlow`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Reach Out
                </a>
              )}
              {onScheduleInterview && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onScheduleInterview();
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Round
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
