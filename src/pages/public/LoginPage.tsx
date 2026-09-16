import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigate?: (route: string) => void;
  onBack?: () => void;
  onNavigateHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigate,
  onBack,
  onNavigateHome,
}) => {
  const { login } = useAuth();

  const [badgeNumberOrEmail, setBadgeNumberOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoHome = () => {
    if (onNavigateHome) onNavigateHome();
    else if (onNavigate) onNavigate('home');
    else if (onBack) onBack();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const badgeNumber = badgeNumberOrEmail.trim();

    if (!badgeNumber) {
      setError('Please enter your Badge Number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // This calls the real backend: POST /auth/login.
      // No local/mock/fallback credentials are accepted.
      await login(badgeNumber, password);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Invalid badge number or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030303] text-[#F5F5F5] font-['Inter',_sans-serif] flex flex-col justify-between overflow-x-hidden selection:bg-[#2F9BFF] selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* CINEMATIC EARTH-FROM-SPACE BACKGROUND MATCHING HOME PAGE      */}
      {/* ------------------------------------------------------------- */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url('/relic-earth.jpg')`,
          backgroundPosition: 'center 62%',
          filter: 'brightness(1.12) contrast(1.12) saturate(1.15)',
        }}
      >
        {/* Soft, targeted gradient: keeps Earth, atmosphere limb, and city lights clearly visible */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(3, 3, 3, 0.70) 0%, rgba(3, 3, 3, 0.40) 65%, rgba(3, 3, 3, 0.20) 100%)'
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#030303]/70 to-transparent pointer-events-none" />
      </div>

      {/* Top Header Navigation: Minimal BACK TO HOME only */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 text-xs font-['Inter',_sans-serif] font-medium text-[#929292] hover:text-[#F5F5F5] transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#929292] group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO HOME</span>
        </button>
      </header>

      {/* Main 2-Column Split: Left Hero Branding, Right Login Card */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ----------------------------------------------------------- */}
          {/* LEFT SIDE: RELIC BRANDING & HIGH-IMPACT TYPOGRAPHY          */}
          {/* ----------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 select-none">
            {/* RELIC Wordmark */}
            <div className="space-y-2.5">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F5F5] font-['Inter',_sans-serif] uppercase leading-none">
                RELIC
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg font-normal text-[#D4D4D4] max-w-xl leading-snug">
                Risk Evaluation & Location Intelligence for Cashpoints
              </p>
            </div>

            {/* Primary High-Impact Statement */}
            <div className="space-y-1 pt-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5F5F5] leading-[1.12] font-['Inter',_sans-serif] uppercase">
                PREDICT THE RISK.<br />
                LOCATE THE THREAT.<br />
                PREVENT THE FRAUD.
              </h1>
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* RIGHT SIDE: PROFESSIONAL LOGIN CARD                         */}
          {/* ----------------------------------------------------------- */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-[#0c0c0c]/90 border border-[#222222] rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
              
              {/* Card Title */}
              <div className="space-y-1 text-left">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5]">
                  Officer Login
                </h2>
                <p className="text-xs text-[#929292]">
                  Sign in to access the RELIC investigation platform.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Badge Number / Identifier */}
                <div className="space-y-1.5 text-left">
                  <label 
                    htmlFor="officer-badge-input" 
                    className="block text-xs font-semibold text-[#F5F5F5]"
                  >
                    Badge Number
                  </label>
                  <input
                    id="officer-badge-input"
                    type="text"
                    required
                    value={badgeNumberOrEmail}
                    onChange={(e) => setBadgeNumberOrEmail(e.target.value)}
                    placeholder="e.g. CCIB-8842-MH"
                    className="w-full bg-[#080808] border border-[#222222] focus:border-[#2F9BFF] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#929292]/60 focus:outline-none transition-colors font-mono"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="officer-password-input" 
                      className="block text-xs font-semibold text-[#F5F5F5]"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="officer-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-[#080808] border border-[#222222] focus:border-[#2F9BFF] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#929292]/60 focus:outline-none transition-colors font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-[#929292] hover:text-[#F5F5F5] focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* SIGN IN BUTTON */}
                <button
                  id="officer-signin-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#2F9BFF] hover:bg-[#258ae6] active:bg-[#1d76c7] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#2F9BFF]/25 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Authorized Personnel Notice */}
              <div className="text-center pt-2 text-[11px] font-mono text-[#929292]">
                Authorized personnel only.
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Minimal bottom spacing */}
      <div className="h-6 shrink-0 pointer-events-none" />

    </div>
  );
};

