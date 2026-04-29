import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Hash, Lock, Globe, Info, Loader2, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '@/src/lib/api';

export default function ChannelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    description: '',
    is_private: 0,
    status: 1,
  });
  const [icon, setIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      fetchChannel();
    }
  }, [id]);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getChannels();
      const channel = res.data.channels.find((c: any) => c.id == id);
      if (channel) {
        setFormData({
          name: channel.name,
          handle: channel.handle,
          description: channel.description,
          is_private: parseInt(channel.is_private),
          status: parseInt(channel.status),
        });
        if (channel.icon_url) setIconPreview(channel.icon_url);
      }
    } catch (err) {
      console.error('Failed to fetch channel', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = new FormData();
      if (isEditing) data.append('id', id as string);
      data.append('name', formData.name);
      data.append('handle', formData.handle);
      data.append('description', formData.description);
      data.append('is_private', formData.is_private.toString());
      data.append('status', formData.status.toString());
      if (icon) data.append('icon', icon);

      if (isEditing) {
        await adminApi.updateChannel(data);
      } else {
        await adminApi.addChannel(data);
      }
      navigate('/channels');
    } catch (err: any) {
      alert(err.message || 'Failed to save channel');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium">Loading channel data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Channel' : 'Create New Channel'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isEditing ? 'Modify the channel settings.' : 'Set up a new space for communication.'}
          </p>
        </header>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            disabled={submitting}
            onClick={() => navigate('/channels')}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Update Channel' : 'Create Channel'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider w-full">Channel Icon</label>
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-indigo-400 transition-all">
                  {iconPreview ? (
                    <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-all" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleIconChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">Square aspect ratio recommended</p>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Display Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Announcements"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Handle</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text"
                    placeholder="e.g. announcements"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
            <textarea 
              placeholder="What is this channel about?"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px] resize-none font-medium"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Privacy Level</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_private: 0 })}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${
                  formData.is_private === 0 
                    ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10" 
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${formData.is_private === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-bold ${formData.is_private === 0 ? 'text-indigo-900' : 'text-slate-900'}`}>Public</p>
                  <p className="text-xs text-slate-500 mt-0.5">Anyone in the community can view and join.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_private: 1 })}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${
                  formData.is_private === 1 
                    ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10" 
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${formData.is_private === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-bold ${formData.is_private === 1 ? 'text-indigo-900' : 'text-slate-900'}`}>Private</p>
                  <p className="text-xs text-slate-500 mt-0.5">Only invited members can view and join.</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl flex items-start gap-4 text-white shadow-xl shadow-slate-200">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Info className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-bold">Channel Guidelines</h4>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">Consider setting clear descriptions to help users understand the purpose of this channel. Privacy changes are effective immediately.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
