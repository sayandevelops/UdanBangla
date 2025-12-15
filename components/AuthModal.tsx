
import React, { useState, useEffect, useRef } from 'react';
import { 
  auth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile
} from '../services/firebase';
import { X, Mail, Lock, User, Loader2, ArrowRight, Smartphone, CheckCircle, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMethod = 'EMAIL' | 'PHONE';
type AuthMode = 'LOGIN' | 'SIGNUP';

// Extend Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('PHONE');
  const [mode, setMode] = useState<AuthMode>('LOGIN'); // Only relevant for Email
  
  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Phone State
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      setShowOtpInput(false);
      setOtp('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers ---

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier && recaptchaRef.current) {
      try {
        // Mock Verifier
        window.recaptchaVerifier = new RecaptchaVerifier(recaptchaRef.current, {}, auth);
      } catch (err) {
        console.error("Recaptcha setup error:", err);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'SIGNUP') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
          await updateProfile(result.user, { displayName: name });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') setError('Invalid email or password.');
      else if (err.code === 'auth/email-already-in-use') setError('Email already registered.');
      else if (err.code === 'auth/weak-password') setError('Password too weak.');
      else setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number with country code (e.g., +91).');
      return;
    }

    setLoading(true);
    setupRecaptcha();

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      // Demo helper
      alert("Demo OTP: 123456");
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!confirmationResult) {
      setError("Session expired. Please send OTP again.");
      setLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderGoogleButton = () => (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Continue with Google
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl animate-slide-up">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-8 pt-10 pb-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="mt-2 text-slate-500 text-sm">
            Login to Udan Bangla to continue.
          </p>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <div className="mb-4 p-3 text-sm text-center text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Social Auth */}
          {renderGoogleButton()}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Method Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => { setAuthMethod('PHONE'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                authMethod === 'PHONE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Smartphone size={16} /> Phone
            </button>
            <button
              onClick={() => { setAuthMethod('EMAIL'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                authMethod === 'EMAIL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mail size={16} /> Email
            </button>
          </div>

          {/* Phone Auth Form */}
          {authMethod === 'PHONE' && (
            <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              {!showOtpInput ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Mobile Number</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Smartphone size={18} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="block w-full py-3 pl-10 pr-3 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {/* Invisible Recaptcha Container */}
                  <div ref={recaptchaRef}></div>
                </div>
              ) : (
                <div className="space-y-1 animate-fade-in">
                  <div className="flex justify-between items-center mb-1">
                     <label className="text-sm font-medium text-slate-700">Enter OTP</label>
                     <button type="button" onClick={() => setShowOtpInput(false)} className="text-xs text-primary-600 hover:underline">Change Number</button>
                  </div>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <CheckCircle size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="block w-full py-3 pl-10 pr-3 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all tracking-widest text-lg"
                      placeholder="123456"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Check your phone for the 6-digit code.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-3.5 text-base font-bold text-white transition-all bg-primary-600 rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-200/50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {showOtpInput ? 'Verify OTP' : 'Send OTP'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Email Auth Form */}
          {authMethod === 'EMAIL' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-in">
              {mode === 'SIGNUP' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full py-3 pl-10 pr-3 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email or Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full py-3 pl-10 pr-3 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                    placeholder="you@example.com or 'demo'"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full py-3 pl-10 pr-3 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-3.5 mt-6 text-base font-bold text-white transition-all bg-primary-600 rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-200/50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {mode === 'LOGIN' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-sm text-slate-500">
                  {mode === 'LOGIN' ? "New here?" : "Have an account?"}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                    className="ml-1 font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {mode === 'LOGIN' ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
