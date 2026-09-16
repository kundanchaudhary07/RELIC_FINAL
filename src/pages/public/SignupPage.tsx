import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Building2, Phone, BadgeCheck, ArrowRight, Eye, EyeOff, Camera, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { BackButton } from '../../components/common/BackButton';
import { CameraFaceScanner } from '../../components/auth/CameraFaceScanner';

interface SignupPageProps {
  onSuccess: () => void;
  onNavigate?: (route: string) => void;
  onBack?: () => void;
  onNavigateLogin?: () => void;
  onNavigateHome?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSuccess,
  onNavigate,
  onBack,
  onNavigateLogin,
  onNavigateHome,
}) => {
  const { signup } = useAuth();
  
  // Selected Role: strictly POLICE or CYBER
  const [selectedRole, setSelectedRole] = useState<'POLICE' | 'CYBER'>('CYBER');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [officialId, setOfficialId] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Photo registration state
  const [registeredPhoto, setRegisteredPhoto] = useState<string | null>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleGoHome = () => {
    if (onNavigateHome) onNavigateHome();
    else if (onNavigate) onNavigate('home');
  };

  const handleGoLogin = () => {
    if (onNavigateLogin) onNavigateLogin();
    else if (onNavigate) onNavigate('login');
  };

  const handleOpenPhotoCapture = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !officialId.trim() || !officialEmail.trim() || !department.trim() || !phoneNumber.trim() || !password) {
      setError('Please complete all mandatory credentials.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Open real-time camera registration
    setShowCameraScanner(true);
  };

  const handlePhotoRegistrationSuccess = (capturedPhotoUrl: string) => {
    setRegisteredPhoto(capturedPhotoUrl);
    setShowCameraScanner(false);

    const appRole: UserRole = selectedRole === 'POLICE' ? 'POLICE_OFFICER' : 'CYBERCRIME_INVESTIGATOR';
    
    // Complete registration
    signup({
      name: fullName.trim(),
      email: officialEmail.trim(),
      role: appRole,
      badgeId: officialId.trim(),
      department: department.trim(),
      phoneNumber: phoneNumber.trim(),
      password: password,
      registeredPhoto: capturedPhotoUrl,
      station: department.trim(),
    });

    setSignupSuccess(true);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#030712] transition-colors font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Top Back Navigation */}
        <div className="flex justify-start">
          <BackButton
            label="Back to Home"
            onClick={onBack ? onBack : handleGoHome}
          />
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur space-y-6">
          
          {/* Header without logo and subtitle */}
          <div className="text-center pb-1">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white">
              Create Account
            </h2>
          </div>

          {signupSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-600 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">
                  Registration Successful
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Your biometric face photo and credentials for <span className="font-semibold text-slate-900 dark:text-white">{fullName}</span> have been registered. You can now proceed to login.
                </p>
              </div>

              {registeredPhoto && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-md">
                    <img src={registeredPhoto} alt="Registered Identity" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                    Registered Biometric Photo
                  </span>
                </div>
              )}

              <button
                onClick={handleGoLogin}
                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
              >
                <span>PROCEED TO LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleOpenPhotoCapture} className="space-y-5">
              
              {error && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. ROLE SELECTION (POLICE vs CYBER ONLY) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Role Mandate
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('POLICE');
                      setDepartment('State Police Tactical Command, Western Zone');
                    }}
                    className={`py-3 px-4 rounded-xl border text-xs font-['Space_Grotesk'] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      selectedRole === 'POLICE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>POLICE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('CYBER');
                      setDepartment('Cyber Crime Investigation Cell & Digital Forensics');
                    }}
                    className={`py-3 px-4 rounded-xl border text-xs font-['Space_Grotesk'] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      selectedRole === 'CYBER'
                        ? 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-sm ring-2 ring-cyan-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <BadgeCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>CYBER</span>
                  </button>
                </div>
              </div>

              {/* 2. CREDENTIAL FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {selectedRole === 'POLICE' ? 'Officer Full Name *' : 'Forensic Investigator Name *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedRole === 'POLICE' ? 'e.g. ACP Neha Sharma' : 'e.g. Insp. Vikram Rao'}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                {/* Official ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {selectedRole === 'POLICE' ? 'IPS / Police Badge Number *' : 'CCIB / Cyber Agent ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    placeholder={selectedRole === 'POLICE' ? 'IPS-3391-CR' : 'CCIB-8842-MH'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Official Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {selectedRole === 'POLICE' ? 'Police Department Email *' : 'Cyber Security Official Email *'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      placeholder={selectedRole === 'POLICE' ? 'officer.ips@police.gov.in' : 'analyst.cyber@cyberpolice.gov.in'}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={selectedRole === 'POLICE' ? '+91 98211 67890' : '+91 98200 12345'}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Department / Organization */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedRole === 'POLICE' ? 'Police Station / Tactical Unit *' : 'Cyber Forensic Unit / Lab *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder={selectedRole === 'POLICE' ? 'e.g. Tactical Bureau, Western Command' : 'e.g. Cybercrime Forensics & Financial Intelligence'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Real-time photo preview if already taken */}
              {registeredPhoto && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/50">
                      <img src={registeredPhoto} alt="Captured face" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Face Photo Registered</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Biometric telemetry verified</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCameraScanner(true)}
                    className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Retake
                  </button>
                </div>
              )}

              {/* Submit / Proceed to Camera Registration */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-slate-950 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>PROCEED TO REAL-TIME PHOTO REGISTRATION</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* Navigation link to Login */}
          <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Already registered? </span>
            <button
              onClick={handleGoLogin}
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-bold focus:outline-none cursor-pointer"
            >
              Sign In
            </button>
          </div>

        </div>
      </div>

      {/* REAL-TIME CAMERA PHOTO REGISTRATION MODAL */}
      {showCameraScanner && (
        <CameraFaceScanner
          mode="register"
          userName={fullName || 'New Officer'}
          userRole={selectedRole}
          onSuccess={handlePhotoRegistrationSuccess}
          onCancel={() => setShowCameraScanner(false)}
        />
      )}

    </div>
  );
};

