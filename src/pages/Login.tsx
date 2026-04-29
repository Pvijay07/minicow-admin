import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { authApi } from '@/src/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authApi.adminLogin(email);
      if (res.status) {
        setStep('otp');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or mobile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authApi.verifyAdminOtp(email, otp);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-2">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Punganur</h1>
          <p className="text-slate-500 font-medium">
            {step === 'login' ? 'Sign in to access your dashboard' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50">
          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 font-medium"
                    placeholder="admin@punganur.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Verification OTP</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 font-medium tracking-[1em]"
                    placeholder="••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400 ml-1">OTP sent to {email}</p>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify & Sign In
                      <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
