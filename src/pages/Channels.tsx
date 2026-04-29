import { useState, useEffect } from 'react';
import { Plus, Search, Hash, Lock, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '@/src/lib/api';

export default function Channels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChannels();
  }, [searchTerm]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getChannels(searchTerm);
      setChannels(res.data.channels);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this channel?')) return;
    try {
      await adminApi.deleteChannel(id);
      setChannels(channels.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete channel');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Channels</h2>
          <p className="text-slate-500 mt-1">Configure and manage communication channels.</p>
        </header>
        <button 
          onClick={() => navigate('/channels/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Channel
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search channels..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 m-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading && !channels.length ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading channels...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Channel Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Posts</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {channels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No channels found.
                    </td>
                  </tr>
                ) : channels.map((channel) => (
                  <tr key={channel.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                          {channel.icon_url ? (
                            <img src={channel.icon_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            channel.is_private == 1 ? <Lock className="w-5 h-5 text-slate-400" /> : <Hash className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{channel.name}</div>
                          <div className="text-xs text-slate-400">@{channel.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        channel.is_private == 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {channel.is_private == 0 ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{parseInt(channel.post_count || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{parseInt(channel.member_count || 0)} members</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500">{new Date(channel.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/channels/edit/${channel.id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(channel.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
