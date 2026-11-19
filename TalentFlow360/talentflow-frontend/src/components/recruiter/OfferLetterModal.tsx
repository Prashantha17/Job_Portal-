import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck,
  Send,
  Eye,
  Download,
  IndianRupee,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { ApplicationResponse, SendOfferLetterRequest } from '../../types/application';
import { applicationService } from '../../services/applicationService';
import { Button } from '../common/Button';

interface OfferLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationResponse | null;
  onSuccess: (updatedApp: ApplicationResponse) => void;
}

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({
  isOpen,
  onClose,
  application,
  onSuccess,
}) => {
  // Mobile/desktop tab view for responsive layout
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Form states
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [annualCtcLpa, setAnnualCtcLpa] = useState<number>(12);
  const [joiningDate, setJoiningDate] = useState('');
  const [jobLocation, setJobLocation] = useState('Bangalore, India (Hybrid)');
  const [reportingManager, setReportingManager] = useState('Director of Engineering');
  const [acceptanceDeadline, setAcceptanceDeadline] = useState('Within 7 business days of issuance');
  const [customRemarks, setCustomRemarks] = useState(
    'We were thoroughly impressed by your technical mastery, architectural vision, and cultural alignment throughout our interview rounds.'
  );
  const [signeeName, setSigneeName] = useState('Siddharth Nair');
  const [signeeTitle, setSigneeTitle] = useState('Head of Talent Acquisition & People Operations');
  const [markAsHired, setMarkAsHired] = useState(false);

  // Status & loading
  const [isSending, setIsSending] = useState(false);
  const [isPreviewingPdf, setIsPreviewingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Format today's date for display
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Default suggested joining date: 30 days from now
  const defaultJoiningDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  };

  useEffect(() => {
    if (application) {
      setCandidateName(application.candidateName || '');
      setCandidateEmail(application.candidateEmail || '');
      setJobTitle(application.jobTitle || '');
      setCompanyName(application.companyName || 'TalentFlow Enterprise');

      // Default CTC from existing offer, expected CTC, or max salary
      const defaultCtc = application.offeredSalaryLpa || application.expectedCtcLpa || (application.maxSalary ? application.maxSalary / 100000 : 12);
      setAnnualCtcLpa(Number(Number(defaultCtc || 12).toFixed(2)));

      setJoiningDate(application.offerJoiningDate || defaultJoiningDate());
      setJobLocation(application.location || 'Bangalore, India (Hybrid)');
      setReportingManager('Director of Engineering / Hiring Lead');
      setAcceptanceDeadline('Within 7 business days of issuance');
      setSigneeName('Siddharth Nair');
      setSigneeTitle('Head of Talent Acquisition & People Operations');
      setMarkAsHired(application.status === 'HIRED');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [application]);

  if (!isOpen || !application) return null;

  // Build the request payload
  const buildPayload = (): SendOfferLetterRequest => ({
    candidateName: candidateName.trim(),
    candidateEmail: candidateEmail.trim(),
    jobTitle: jobTitle.trim(),
    companyName: companyName.trim(),
    annualCtcLpa: Number(annualCtcLpa) || 12,
    joiningDate: joiningDate.trim(),
    jobLocation: jobLocation.trim(),
    reportingManager: reportingManager.trim(),
    acceptanceDeadline: acceptanceDeadline.trim(),
    customRemarks: customRemarks.trim(),
    signeeName: signeeName.trim(),
    signeeTitle: signeeTitle.trim(),
    markAsHired,
  });

  // CTC financial calculations
  const totalLpa = Number(annualCtcLpa) || 12;
  const annualInr = totalLpa * 100000;
  const monthlyInr = Math.round(annualInr / 12);
  const basicSalaryAnnual = Math.round(annualInr * 0.5);
  const hraAnnual = Math.round(annualInr * 0.25);
  const specialAllowanceAnnual = Math.round(annualInr * 0.15);
  const perfBonusAnnual = Math.round(annualInr * 0.1);

  // Handle PDF Preview (opens in new browser tab / downloads raw PDF)
  const handlePreviewPdf = async () => {
    try {
      setIsPreviewingPdf(true);
      setErrorMessage(null);
      const payload = buildPayload();
      const blob = await applicationService.previewOfferLetterPdf(application.id, payload);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err: any) {
      console.error('Failed to preview offer letter PDF:', err);
      setErrorMessage(err?.response?.data?.message || 'Could not compile offer letter PDF preview.');
    } finally {
      setIsPreviewingPdf(false);
    }
  };

  // Handle Send Offer Letter (compiles PDF, saves, updates stage, sends email)
  const handleSendOfferLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !jobTitle.trim() || !companyName.trim()) {
      setErrorMessage('Please fill in candidate name, job title, and company name.');
      return;
    }
    if (!annualCtcLpa || annualCtcLpa <= 0) {
      setErrorMessage('Please enter a valid Annual CTC in LPA.');
      return;
    }

    try {
      setIsSending(true);
      setErrorMessage(null);
      const payload = buildPayload();
      const updatedApp = await applicationService.sendOfferLetter(application.id, payload);
      setSuccessMessage(
        `Official Offer Letter compiled & emailed to ${candidateEmail || candidateName}! Status updated to ${
          markAsHired ? 'HIRED' : 'OFFER_RELEASED'
        }.`
      );
      setTimeout(() => {
        onSuccess(updatedApp);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('Failed to send offer letter:', err);
      setErrorMessage(
        err?.response?.data?.message || 'Failed to dispatch offer letter. Please verify candidate details.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 shrink-0">
              <FileCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Formal Offer Letter Generator & Dispatcher
                </h3>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Apache PDFBox Verified
                </span>
              </div>
              <p className="text-xs text-slate-300">
                1-Click Offer Letter generation with real-time letterhead preview and automated PDF email dispatch.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile View Toggle Tabs */}
        <div className="lg:hidden flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'form'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Edit Terms & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'preview'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" /> Live Letterhead Preview
          </button>
        </div>

        {/* Alert banners for errors & successes */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1 font-bold">{successMessage}</span>
          </div>
        )}

        {/* Split Content Body: Left Form (48%), Right Live Preview (52%) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: EDITABLE FORM */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              activeTab === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-600" /> Candidate & Role Details
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">
                  App #{application.id}
                </span>
              </div>

              {/* Candidate Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Candidate Email *
                  </label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="candidate@example.com"
                    required
                  />
                </div>
              </div>

              {/* Job Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Job Designation *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="e.g. Senior Full Stack Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Employing Company *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="e.g. TalentFlow Tech Ltd"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Compensation & Joining Terms */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-emerald-600" /> Compensation & Schedule
                </h4>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  INR Annual CTC
                </span>
              </div>

              {/* CTC & Joining Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Offered CTC (₹ Lakhs / Annum) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={annualCtcLpa}
                      onChange={(e) => setAnnualCtcLpa(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-12 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900 bg-white"
                      placeholder="14.5"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">LPA</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    ≈ ₹ {monthlyInr.toLocaleString('en-IN')} / month gross
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Proposed Joining Date *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      placeholder="e.g. 15 December 2026"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Standard notice: 30-45 days</p>
                </div>
              </div>

              {/* Location & Reporting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Workplace Location / Mode
                  </label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Bangalore, India (Hybrid)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Reporting Manager / Department
                  </label>
                  <input
                    type="text"
                    value={reportingManager}
                    onChange={(e) => setReportingManager(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Director of Engineering"
                  />
                </div>
              </div>

              {/* Acceptance Deadline */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Offer Acceptance Deadline
                </label>
                <input
                  type="text"
                  value={acceptanceDeadline}
                  onChange={(e) => setAcceptanceDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Within 7 business days of issuance"
                />
              </div>

              {/* Congratulatory Remarks */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Congratulatory Remarks / Personal Welcome Message
                </label>
                <textarea
                  rows={3}
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-normal leading-relaxed"
                  placeholder="Write a warm note highlighting why the hiring panel chose them..."
                />
              </div>

              {/* Authorized Signatory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Authorized Signatory Name
                  </label>
                  <input
                    type="text"
                    value={signeeName}
                    onChange={(e) => setSigneeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Siddharth Nair"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Signatory Title
                  </label>
                  <input
                    type="text"
                    value={signeeTitle}
                    onChange={(e) => setSigneeTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    placeholder="Head of Talent Acquisition"
                  />
                </div>
              </div>

              {/* Target Stage Toggle */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-2">
                  Target Application Status Transition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMarkAsHired(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      !markAsHired
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Stage 7: Offer Released</span>
                    {!markAsHired && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarkAsHired(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      markAsHired
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Stage 8: Direct Hired</span>
                    {markAsHired && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  {markAsHired
                    ? 'Candidate application will be directly moved to the final HIRED stage upon email dispatch.'
                    : 'Candidate application will advance to OFFER_RELEASED stage pending acceptance.'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE LETTERHEAD DOCUMENT PREVIEW */}
          <div
            className={`lg:col-span-7 flex flex-col ${
              activeTab === 'preview' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" /> Live Letterhead Document Preview
              </span>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                Dynamic PDF Simulation
              </span>
            </div>

            {/* Simulated Paper A4 Letter */}
            <div className="flex-1 bg-white border border-slate-300 rounded-2xl shadow-lg p-6 sm:p-8 font-sans text-slate-800 text-xs sm:text-[13px] leading-relaxed overflow-y-auto max-h-[70vh]">
              {/* Top Letterhead Bar */}
              <div className="border-b-2 border-emerald-700 pb-5 mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                      TF
                    </div>
                    <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                      {companyName || 'TalentFlow Enterprise'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Corporate Recruitment & Talent Acquisition Operations
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Ref ID: TF-OFFER-{application.id}-{new Date().getFullYear()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    FORMAL OFFER OF EMPLOYMENT
                  </span>
                  <p className="text-[11px] font-semibold text-slate-500 mt-2">
                    Date of Issue: {todayFormatted}
                  </p>
                </div>
              </div>

              {/* Candidate Addressee */}
              <div className="mb-4">
                <p className="font-bold text-slate-900 text-sm">{candidateName || 'Candidate Name'}</p>
                <p className="text-slate-600">{candidateEmail || 'candidate@example.com'}</p>
                <p className="text-slate-500 text-[11px]">Primary Location: {jobLocation}</p>
              </div>

              {/* Greeting & Opening */}
              <div className="space-y-3 mb-5">
                <p>
                  Dear <strong>{candidateName || 'Candidate'}</strong>,
                </p>
                <p className="text-slate-700">
                  On behalf of <strong>{companyName || 'TalentFlow Enterprise'}</strong>, we are thrilled
                  to extend this formal Letter of Offer for the position of{' '}
                  <strong className="text-slate-900">{jobTitle || 'Software Engineer'}</strong>.
                </p>
                <p className="text-slate-600 italic bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
                  &ldquo;{customRemarks}&rdquo;
                </p>
              </div>

              {/* Compensation Summary Table */}
              <div className="mb-5">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 text-emerald-800">
                  I. Compensation & Remuneration Structure
                </h5>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2 sm:p-2.5">Component</th>
                        <th className="p-2 sm:p-2.5 text-right">Annual (₹ INR)</th>
                        <th className="p-2 sm:p-2.5 text-right">Monthly (₹ INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 sm:p-2.5 font-medium text-slate-800">Basic Salary (50%)</td>
                        <td className="p-2 sm:p-2.5 text-right font-semibold">
                          ₹ {basicSalaryAnnual.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 sm:p-2.5 text-right text-slate-600">
                          ₹ {Math.round(basicSalaryAnnual / 12).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 sm:p-2.5 font-medium text-slate-800">House Rent Allowance (HRA 25%)</td>
                        <td className="p-2 sm:p-2.5 text-right font-semibold">
                          ₹ {hraAnnual.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 sm:p-2.5 text-right text-slate-600">
                          ₹ {Math.round(hraAnnual / 12).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 sm:p-2.5 font-medium text-slate-800">Special Allowances (15%)</td>
                        <td className="p-2 sm:p-2.5 text-right font-semibold">
                          ₹ {specialAllowanceAnnual.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 sm:p-2.5 text-right text-slate-600">
                          ₹ {Math.round(specialAllowanceAnnual / 12).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 sm:p-2.5 font-medium text-slate-800">Performance Incentive (10%)</td>
                        <td className="p-2 sm:p-2.5 text-right font-semibold">
                          ₹ {perfBonusAnnual.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 sm:p-2.5 text-right text-slate-600">
                          ₹ {Math.round(perfBonusAnnual / 12).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50/70 font-extrabold text-emerald-950 border-t-2 border-emerald-300">
                        <td className="p-2 sm:p-2.5">Total Cost to Company (CTC)</td>
                        <td className="p-2 sm:p-2.5 text-right text-sm text-emerald-700">
                          ₹ {totalLpa.toFixed(2)} LPA
                        </td>
                        <td className="p-2 sm:p-2.5 text-right text-sm text-emerald-700">
                          ₹ {monthlyInr.toLocaleString('en-IN')} /mo
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Engagement Terms */}
              <div className="mb-5 space-y-2">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5 text-emerald-800">
                  II. Summary of Employment Terms
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 font-semibold block text-[11px]">Proposed Joining Date:</span>
                    <span className="font-bold text-slate-900">{joiningDate}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 font-semibold block text-[11px]">Reporting Manager:</span>
                    <span className="font-bold text-slate-900">{reportingManager}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 font-semibold block text-[11px]">Workplace Location:</span>
                    <span className="font-bold text-slate-900">{jobLocation}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 font-semibold block text-[11px]">Acceptance Window:</span>
                    <span className="font-bold text-slate-900">{acceptanceDeadline}</span>
                  </div>
                </div>
              </div>

              {/* Signatory & Authorization Stamp */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">Authorized for and on behalf of</p>
                  <p className="font-extrabold text-slate-900">{companyName || 'TalentFlow Enterprise'}</p>
                  <div className="mt-3 py-1 font-serif text-emerald-800 italic font-bold border-b border-dashed border-emerald-400 inline-block">
                    {signeeName}
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{signeeTitle}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[160px]">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider">
                    TalentFlow Verified
                  </span>
                  <span className="text-[9px] text-slate-400">Cryptographically Signed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Candidate will receive a congratulatory email with the <strong>Offer Letter PDF</strong> attached.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSending}
              className="text-xs"
            >
              Cancel
            </Button>

            {/* Preview PDF */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePreviewPdf}
              isLoading={isPreviewingPdf}
              disabled={isSending}
              className="text-xs inline-flex items-center gap-1.5 font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              Preview PDF
            </Button>

            {/* Send Offer Letter & PDF */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSendOfferLetter}
              isLoading={isSending}
              disabled={isPreviewingPdf}
              className="text-xs inline-flex items-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25"
            >
              <Send className="w-3.5 h-3.5" />
              {markAsHired ? 'Approve, Hire & Send Offer Letter' : 'Approve & Send Offer Letter (with PDF)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
