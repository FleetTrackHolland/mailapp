import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { RocketLaunchIcon, GlobeAltIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useGoogleLogin } from '@react-oauth/google';

// Simple SVG Icons for Socials
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);
const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.82 14.5c-.03-2.63 2.14-3.9 2.24-3.96-1.22-1.79-3.12-2.03-3.8-2.06-1.62-.16-3.16 1.01-3.99 1.01-.83 0-2.11-.99-3.44-.96-1.72.03-3.32.96-4.22 2.44-1.81 2.97-.47 7.37 1.3 9.77.86 1.17 1.88 2.47 3.12 2.42 1.2-.05 1.67-.78 3.13-.78 1.45 0 1.88.78 3.15.75 1.3-.03 2.17-1.16 3.02-2.31 1.05-1.42 1.48-2.81 1.5-2.88-.03-.02-2.98-1.07-3.01-3.44zM14.55 6.11c.64-.78 1.08-1.87.96-2.96-1.01.04-2.22.68-2.88 1.48-.59.7-.1 1.83.1 2.94 1.1-.09 2.13-.74 2.82-1.46z"/>
  </svg>
);


export default function Login({ onLogin }) {
  const { t, language, setLanguage, languagesList } = useLanguage();
  const { appConfig } = useApp();
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState('');

  // Helper to read/write DB
  const getUsersDb = () => {
    const db = localStorage.getItem('fleettrack_users');
    return db ? JSON.parse(db) : [];
  };
  
  const saveUserToDb = (userObj) => {
    const users = getUsersDb();
    const existingIndex = users.findIndex(u => u.email === userObj.email);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userObj };
    } else {
      users.push(userObj);
    }
    localStorage.setItem('fleettrack_users', JSON.stringify(users));
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setIsLoading(true);
      setLoadingProvider('google');
      const userInfoObj = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      }).then(res => res.json());

      let users = getUsersDb();
      let existingUser = users.find(u => u.email === userInfoObj.email);
      let mockUser;

      if (existingUser) {
        mockUser = { ...existingUser, avatar: userInfoObj.picture || existingUser.avatar, name: userInfoObj.name || existingUser.name };
        // Ensure their admin status is always set even if they existed already
        if (userInfoObj.email === 'doganagahm@gmail.com') {
          mockUser.plan = 'Enterprise';
          mockUser.isDemo = false;
        }
      } else {
        const isAdmin = userInfoObj.email === 'doganagahm@gmail.com';
        mockUser = { 
          id: Date.now(), 
          role: 'owner', 
          isDemo: isAdmin ? false : false, // We set everyone to non-demo for testing as per previous step, but let's be explicit
          authProvider: 'google', 
          plan: isAdmin ? 'Enterprise' : 'Professional', 
          email: userInfoObj.email,
          name: userInfoObj.name || 'Google User',
          avatar: userInfoObj.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${userInfoObj.email}`
        };
      }
      saveUserToDb(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      setIsLoading(false);
      onLogin(mockUser);
    } catch (err) {
      setIsLoading(false);
      setError('Failed to fetch Google user profile.');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Login Failed'),
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
  });

  // Mock Authentication Flow
  const handleAuth = (provider) => {
    setError('');

    // Pre-flight validation for email login/register
    if (provider === 'email') {
      if (!isLoginView && !name.trim()) {
        return setError(t('errFullName'));
      }
      if (!email || !email.includes('@')) {
        return setError(t('errValidEmail'));
      }
      if (!password || password.length < 5) {
        return setError(t('errPasswordLen'));
      }
    }

    setIsLoading(true);
    setLoadingProvider(provider);

    // Simulate network delay
    setTimeout(() => {
      let users = getUsersDb();
      let mockUser = null;
      let targetEmail = email;

      if (provider === 'google') targetEmail = 'dogan@gmail.com';
      else if (provider === 'microsoft') targetEmail = 'dogan@outlook.com';
      else if (provider === 'apple') targetEmail = 'dogan@icloud.com';

      const existingUser = users.find(u => u.email === targetEmail);

      if (provider === 'email') {
        if (isLoginView) {
          // Login Mode
          if (!existingUser) {
            setIsLoading(false);
            return setError(t('errNoAccount'));
          }
          if (existingUser.password !== password) {
            setIsLoading(false);
            return setError(t('errWrongPassword'));
          }
          mockUser = existingUser;
        } else {
          // Register Mode
          if (existingUser) {
            setIsLoading(false);
            return setError(t('errAccountExists'));
          }
          mockUser = { id: Date.now(), name, email, password, role: 'owner', isDemo: true, authProvider: 'email', plan: 'Free Demo', avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}` };
          saveUserToDb(mockUser);
        }
      } else if (provider !== 'demo') {
        // Social Logins (Fallback for Microsoft/Apple)
        if (existingUser) {
          mockUser = existingUser;
        } else {
          const isAdmin = targetEmail === 'doganagahm@gmail.com';
          mockUser = { 
            id: Date.now(), 
            role: 'owner', 
            isDemo: isAdmin ? false : false, 
            authProvider: provider, 
            plan: isAdmin ? 'Enterprise' : 'Professional', 
            email: targetEmail 
          };
          saveUserToDb(mockUser);
        }
      } else {
        // Demo Fallback User
        mockUser = { id: 9999, name: 'Demo User', email: 'demo@fleettrack.io', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=demo', authProvider: 'demo', isDemo: true, plan: 'Free Demo' };
      }

      localStorage.setItem('user', JSON.stringify(mockUser));
      setIsLoading(false);
      onLogin(mockUser);
    }, 1500);
  };

    // Use the central languagesList from Context, no local definition needed.

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 my-8">
        <div className="glass-deep rounded-[2rem] p-8 md:p-10 border shadow-2xl" style={{ borderColor: 'var(--border)' }}>
          
          {/* Logo / Brand */}
          <div className="mb-8 flex justify-center">
            {appConfig.logoUrl ? (
              <img src={appConfig.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
            ) : (
              <div className="h-14 w-14 bg-gradient-to-br from-[#007AFF] to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <RocketLaunchIcon className="h-7 w-7 text-white" />
              </div>
            )}
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {isLoginView ? `${t('loginTo')}${appConfig.companyName}` : t('createAccountTitle')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isLoginView ? t('welcomeBack') : t('signUpTrial')}
            </p>
          </div>

          <div className="flex bg-gray-100/50 p-1 rounded-xl mb-8 border border-gray-200/50 shadow-inner max-w-[240px] mx-auto">
            <button
              type="button"
              onClick={() => { setIsLoginView(true); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${isLoginView ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => { setIsLoginView(false); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!isLoginView ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('signUp')}
            </button>
          </div>

          {/* Social Logins */}
          <div className="space-y-3 mb-6">
            <button type="button" disabled={isLoading} onClick={() => loginWithGoogle()} className="w-full glass-overlay flex items-center justify-center gap-3 py-3 rounded-xl border hover:bg-white/40 dark:hover:bg-white/10 transition-colors text-sm font-bold shadow-sm disabled:opacity-50" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              {isLoading && loadingProvider === 'google' ? <span className="animate-spin h-5 w-5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full"></span> : <><GoogleIcon /> {t('continueGoogle')}</>}
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-40">{t('orEmail')}</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
          </div>

          {/* Email / Password Form */}
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}
            
            {!isLoginView && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">{t('fullName')}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => {setName(e.target.value); setError('');}}
                    disabled={isLoading}
                    placeholder="John Doe" 
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#007AFF] focus:border-[#007AFF] block px-4 py-2.5 shadow-sm transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">{t('emailAddress')}</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => {setEmail(e.target.value); setError('');}}
                  disabled={isLoading}
                  placeholder="name@company.com" 
                  className={`w-full bg-gray-50/50 border text-gray-900 text-sm rounded-xl focus:ring-[#007AFF] focus:border-[#007AFF] block pl-11 p-2.5 shadow-sm transition-colors ${error.includes('email') ? 'border-red-400' : 'border-gray-200'}`}
                  onKeyDown={e => e.key === 'Enter' && handleAuth('email')}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="block text-xs font-bold text-gray-500">{t('password')}</label>
                <a href="#" className="font-semibold text-xs text-[#007AFF] hover:underline">{t('forgot')}</a>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => {setPassword(e.target.value); setError('');}}
                  disabled={isLoading}
                  placeholder="••••••••" 
                  className={`w-full bg-gray-50/50 border text-gray-900 text-sm rounded-xl focus:ring-[#007AFF] focus:border-[#007AFF] block pl-11 p-2.5 shadow-sm transition-colors ${error.includes('Password') ? 'border-red-400' : 'border-gray-200'}`}
                  onKeyDown={e => e.key === 'Enter' && handleAuth('email')}
                />
              </div>
            </div>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => handleAuth('email')}
              className="w-full bg-[#007AFF] text-white py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-blue-600 transition-all shadow-md mt-2 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading && loadingProvider === 'email' ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : (isLoginView ? t('signIn') : t('createAccountBtn'))}
            </button>
          </div>

          {/* Demo Fallback */}
          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs text-gray-500 mb-2">{t('justLookingAround')}</p>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => handleAuth('demo')}
              className="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-[#007AFF] bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading && loadingProvider === 'demo' && <span className="animate-spin h-3 w-3 border-[1.5px] border-[#007AFF] border-t-transparent rounded-full"></span>}
              {t('tryFreeDemo')}
            </button>
          </div>

        </div>

        {/* Global Language Selector */}
        <div className="mt-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 opacity-60" style={{ color: 'var(--text-secondary)' }}>
            <GlobeAltIcon className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('language')}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-[350px]">
            {languagesList.map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  language === lang.code 
                    ? 'bg-[#007AFF] text-white shadow-sm' 
                    : 'glass-overlay hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
                style={language !== lang.code ? { color: 'var(--text-secondary)' } : {}}
              >
                <span className="text-sm leading-none">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
