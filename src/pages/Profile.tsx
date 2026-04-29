import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Loader2, 
  Shield, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { authApi } from '@/src/lib/api';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_url: ''
  });
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('User not found in storage');
      const user = JSON.parse(userStr);
      
      const res = await authApi.getProfile(user.id, 'admin');
      const profile = res.data;
      
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.mobile || '',
        profile_url: profile.profile_url || ''
      });
      setPreviewUrl(profile.profile_url);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr || '{}');
      
      const data = new FormData();
      data.append('user_id', user.id);
      data.append('user_type', 'admin');
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      if (newProfileImage) {
        data.append('profile', newProfileImage);
      }

      const res = await authApi.updateProfile(data);
      
      // Update local storage user data partially
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Profile</h2>
        <p className="text-slate-500 mt-1">Manage your personal information and security settings.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center relative group">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden ring-4 ring-white shadow-xl mx-auto">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg ring-4 ring-white hover:bg-indigo-700 transition-all active:scale-90"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </div>
            
            <div className="mt-6 space-y-1">
              <h3 className="text-xl font-bold text-slate-900">{formData.name}</h3>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{formData.email}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
              <Shield className="w-4 h-4" />
              Verified Administrator
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100">
            <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Ensure your email and phone are current as they are used for two-factor authentication and official system notifications.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setSuccess(false);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="tel" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setSuccess(false);
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setSuccess(false);
                  }}
                  required
                />
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Profile
              </button>
              
              {success && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in fade-in slide-in-from-left-4 grow">
                  <CheckCircle2 className="w-5 h-5" />
                  Profile updated successfully!
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-rose-600 font-bold animate-in fade-in slide-in-from-left-4 grow">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
