import { useState, useEffect } from 'react';
import { Search, Filter, Edit2, Trash2, Eye, MessageSquare, Heart, Clock, Plus, Loader2, Pin, PinOff, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '@/src/lib/api';

type PostStatus = 'admin' | 'user' | 'scheduled' | 'blocked';

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<PostStatus>('admin');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, status]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPosts({ 
        status: status, 
        search: searchTerm 
      });
      setPosts(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (id: number) => {
    try {
      await adminApi.togglePin(id);
      fetchPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle pin');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await adminApi.deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  const handleBlock = async (id: number, currentStatus: string) => {
    try {
      if (currentStatus === 'blocked') {
        await adminApi.unblockPost(id);
      } else {
        await adminApi.blockPost(id);
      }
      fetchPosts();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Posts</h2>
          <p className="text-slate-500 mt-1">Monitor and moderate all user-generated content.</p>
        </header>
        <button 
          onClick={() => navigate('/posts/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['admin', 'user', 'scheduled', 'blocked'] as PostStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    status === s 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 m-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 divide-y divide-slate-100">
          {loading && !posts.length ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-20 text-center text-slate-500 font-medium">
              No posts found in this category.
            </div>
          ) : posts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-slate-50/50 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      post.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                      post.status === 'blocked' ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {post.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                    {post.channel_name && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                        #{post.channel_name}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {post.post_text}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                        {post.profile_url && <img src={post.profile_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{post.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Heart className="w-4 h-4" />
                        {post.likes_count}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments_count}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleTogglePin(post.id)}
                    className={`p-2 rounded-lg transition-all ${
                      post.is_pinned == 1 
                        ? 'text-amber-600 bg-amber-50' 
                        : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                    title={post.is_pinned == 1 ? "Unpin Post" : "Pin Post"}
                  >
                    {post.is_pinned == 1 ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleBlock(post.id, post.status)}
                    className={`p-2 rounded-lg transition-all ${
                      post.status === 'blocked'
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title={post.status === 'blocked' ? "Unblock Post" : "Block Post"}
                  >
                    {post.status === 'blocked' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  </button>
                  <Link 
                    to={`/posts/edit/${post.id}`}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
