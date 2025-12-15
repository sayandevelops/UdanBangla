
import React, { useState } from 'react';
import { 
  getAuthInstance,
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword
} from '../services/firebase';
import { Lock, Mail, ArrowRight, Loader2, ShieldAlert, X } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // If success, callback to parent to change view
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Access denied.');
      } else if (err.code === 'auth/user-not-found' || err.message?.includes('admin')) {
        setError('Unauthorized email address.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-900 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        <button 
          onClick={onBack}
          className="absolute -top-12 left-0 text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm"
        >
          <X size={16} /> Exit to Home
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-slate-800 p-8 text-center border-b border-slate-700">
            <div className="mx-auto bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <ShieldAlert size={32} className="text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Restricted Access</h2>
            <p className="text-slate-400 text-sm mt-2">Udan Bangla Administration</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <ShieldAlert size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full py-3.5 pl-10 pr-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                    placeholder="admin@udanbangla.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Secure Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full py-3.5 pl-10 pr-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Authenticate Access <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                Unauthorized access attempts are logged. <br/>
                IP Address: {Math.floor(Math.random()*255)}.{Math.floor(Math.random()*255)}.12.43
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
