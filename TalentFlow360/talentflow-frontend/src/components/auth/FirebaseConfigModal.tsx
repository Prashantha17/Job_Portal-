import React, { useState, useEffect } from 'react';
import {
  X, Flame, CheckCircle2, AlertCircle, ExternalLink, Trash2
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  FirebaseConfig,
  getFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  parseFirebaseConfigSnippet,
  signInWithGoogleReal
} from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToDemo?: () => void;
  targetRole?: 'ROLE_JOB_SEEKER' | 'ROLE_RECRUITER';
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToDemo,
  targetRole = 'ROLE_JOB_SEEKER',
}) => {
  const { loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'paste' | 'manual' | 'guide'>('paste');
  const [snippetText, setSnippetText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [appId, setAppId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
      setError(null);
      setSuccessNotice(null);
    }
  }, [isOpen]);

  const loadCurrentConfig = () => {
    const existing = getFirebaseConfig();
    if (existing) {
      setApiKey(existing.apiKey || '');
      setAuthDomain(existing.authDomain || '');
      setProjectId(existing.projectId || '');
      setAppId(existing.appId || '');
      setStorageBucket(existing.storageBucket || '');
      setMessagingSenderId(existing.messagingSenderId || '');
      setIsConfigured(true);
    } else {
      setIsConfigured(false);
    }
  };

  if (!isOpen) return null;

  const handleParseSnippet = (text: string) => {
    setSnippetText(text);
    const parsed = parseFirebaseConfigSnippet(text);
    if (parsed) {
      setApiKey(parsed.apiKey);
      setAuthDomain(parsed.authDomain);
      setProjectId(parsed.projectId);
      if (parsed.appId) setAppId(parsed.appId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      setSuccessNotice('Firebase configuration successfully parsed from snippet!');
      setError(null);
    }
  };

  const handleSaveAndLaunch = async () => {
    setError(null);
    setSuccessNotice(null);

    // If paste tab had text and fields aren't populated yet, try parsing
    if (activeTab === 'paste' && snippetText && (!apiKey || !authDomain)) {
      const parsed = parseFirebaseConfigSnippet(snippetText);
      if (parsed) {
        setApiKey(parsed.apiKey);
        setAuthDomain(parsed.authDomain);
        setProjectId(parsed.projectId);
        if (parsed.appId) setAppId(parsed.appId);
      }
    }

    if (!apiKey || !authDomain || !projectId) {
      setError('Please provide at least apiKey, authDomain, and projectId.');
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      appId: appId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
    };

    const saved = saveFirebaseConfig(config);
    if (!saved) {
      setError('Failed to save configuration to local storage.');
      return;
    }

    setIsConfigured(true);
    setSuccessNotice('Firebase credentials saved successfully! Launching Google sign-in...');

    // Attempt real Google OAuth popup
    try {
      setConnecting(true);
      const googlePayload = await signInWithGoogleReal(targetRole);
      await loginWithGoogle(googlePayload);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setSuccessNotice('Firebase config saved! (Google sign-in popup was closed)');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(
          'Firebase domain unauthorized. Please go to Firebase Console > Authentication > Settings > Authorized domains, and add "localhost".'
        );
      } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setError(
          'Google Provider is not enabled in your Firebase Project. In Firebase Console, go to Authentication > Sign-in method and enable "Google".'
        );
      } else {
        setError(err.message || 'Google sign-in failed. Please verify your Firebase project settings.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleClear = () => {
    clearFirebaseConfig();
    setApiKey('');
    setAuthDomain('');
    setProjectId('');
    setAppId('');
    setSnippetText('');
    setIsConfigured(false);
    setSuccessNotice('Firebase configuration removed.');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Attach Firebase for Real Google Sign-In
                </h3>
                {isConfigured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300">
                    Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect your Firebase project to trigger real Google OAuth login with your Gmail account.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Notices */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {successNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1">{successNotice}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-slate-100 flex gap-4 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'paste'
                ? 'border-orange-500 text-orange-600 font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Paste Config Snippet
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'manual'
                ? 'border-orange-500 text-orange-600 font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Manual Fields
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'guide'
                ? 'border-orange-500 text-orange-600 font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Setup Guide (3 Steps)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Paste your Firebase Config snippet or JSON:
              </label>
              <textarea
                rows={6}
                value={snippetText}
                onChange={(e) => handleParseSnippet(e.target.value)}
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "your-project.firebaseapp.com",\n  projectId: "your-project-id",\n  appId: "1:123456789:web:abcdef"\n};`}
                className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner"
              />
              <p className="text-[11px] text-slate-500">
                Tip: Copy the whole <code className="text-orange-600 font-mono">firebaseConfig</code> code snippet from your Firebase Console. TalentFlow auto-parses the keys.
              </p>

              {apiKey && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <div className="font-bold text-slate-700">Detected Keys:</div>
                  <div className="text-slate-600 truncate">
                    <span className="font-semibold">Project ID:</span> {projectId || 'N/A'}
                  </div>
                  <div className="text-slate-600 truncate">
                    <span className="font-semibold">Auth Domain:</span> {authDomain || 'N/A'}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API Key *
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Auth Domain *
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="your-app.firebaseapp.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project ID *
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="talentflow-app"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    App ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:123456789:web:..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="font-extrabold text-amber-900 block mb-1">
                  How to get your free Firebase Google Sign-In keys:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-amber-800 text-[11px] leading-relaxed">
                  <li>
                    Go to{' '}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline text-amber-900 inline-flex items-center gap-0.5"
                    >
                      console.firebase.google.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and create or open a project.
                  </li>
                  <li>
                    In left sidebar, click <strong>Build &gt; Authentication &gt; Sign-in method</strong>, choose <strong>Google</strong>, and enable it (set public support email).
                  </li>
                  <li>
                    In <strong>Project Settings &gt; General &gt; Your apps</strong>, click Web icon (<code className="font-mono">&lt;/&gt;</code>) to register an app.
                  </li>
                  <li>
                    Copy the <code className="font-mono">firebaseConfig</code> object and paste it here in the <strong>Paste Config Snippet</strong> tab!
                  </li>
                </ol>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong>Note:</strong> By default, Firebase authorizes <code className="font-mono">localhost</code> so your Google popup works instantly on port 5173 / 3000.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            {onSwitchToDemo && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToDemo();
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Use Demo Chooser Instead &rarr;
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={connecting}
              onClick={handleSaveAndLaunch}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              <Flame className="w-4 h-4 mr-1.5 fill-white" />
              Save & Launch Google Sign-In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
