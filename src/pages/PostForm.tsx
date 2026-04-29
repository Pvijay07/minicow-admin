import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Image as ImageIcon, Loader2, Plus, AlertCircle } from 'lucide-react';
import { adminApi } from '@/src/lib/api';

export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    post_text: '',
    channel_id: '',
    status: 'active',
    comment_section: 1,
  });
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchChannels = async () => {
    try {
      const res = await adminApi.getChannels();
      setChannels(res.data.channels);
    } catch (err) {
      console.error('Failed to fetch channels', err);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPostById(id!);
      const post = res.data.post;
      
      setFormData({
        post_text: post.post_text || '',
        channel_id: post.channel_id?.toString() || '',
        status: post.status || 'active',
        comment_section: Number(post.comment_section) ?? 1,
      });

      if (post.media && Array.from(post.media).length > 0) {
        const existingPreviews = post.media.map((m: any) => m.media_url);
        setMediaPreviews(existingPreviews);
      }
      
    } catch (err) {
      console.error('Failed to fetch post', err);
      setError('Failed to load post data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      setMedia(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.channel_id) {
      setError('Please select a channel');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      if (isEditing) {
        data.append('post_id', id!);
      }
      data.append('post_text', formData.post_text);
      data.append('channel_id', formData.channel_id);
      data.append('status', formData.status);
      data.append('comment_section', formData.comment_section.toString());
      
      media.forEach((file) => {
        data.append('media[]', file);
      });

      if (isEditing) {
        await adminApi.updatePost(data);
      } else {
        await adminApi.addPost(data);
      }
      navigate('/posts');
    } catch (err: any) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium">Loading post data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-primary">
            {isEditing ? 'Edit Post' : 'Compose Post'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isEditing ? 'Modify your content.' : 'Publish an update or announcement to the community.'}
          </p>
        </header>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            disabled={submitting}
            onClick={() => navigate('/posts')}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Update Post' : 'Publish Now'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Target Channel</label>
              <select 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
                value={formData.channel_id}
                onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
                required
              >
                <option value="">Select a channel...</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>#{channel.handle} ({channel.name})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Posting As</label>
              <div className="w-full px-5 py-3.5 bg-slate-100 border border-transparent rounded-2xl text-slate-500 font-bold flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white">P</div>
                Petsfolio (System Admin)
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Post Content</label>
            <textarea 
              placeholder="What's happening? Share it with the world..."
              className="w-full px-6 py-6 min-h-[250px] focus:outline-none bg-slate-50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-lg text-slate-800 placeholder:text-slate-400"
              value={formData.post_text}
              onChange={(e) => setFormData({ ...formData, post_text: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-200 transition-all hover:bg-indigo-50/30 group">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                Allow Community Comments
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${formData.comment_section === 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                  {formData.comment_section === 1 ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <p className="text-xs text-slate-500 max-w-md">When enabled, members can like, dislike, and reply to this post. If disabled, the interaction section will be hidden.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer scale-110">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.comment_section === 1}
                onChange={(e) => setFormData({ ...formData, comment_section: e.target.checked ? 1 : 0 })}
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Media Attachments</label>
              <span className="text-[10px] font-bold text-slate-400">{media.length}/5 files</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {media.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 hover:border-indigo-300 hover:text-indigo-500 transition-all group"
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold">Add Media</span>
                </button>
              )}
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleMediaChange}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-300">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Ready to publish?</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">This post will be immediately visible to all members of the selected channel. Ensure your content follows community guidelines.</p>
            </div>
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Confirm & Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
