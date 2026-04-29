import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Shield, User, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { adminApi } from '@/src/lib/api';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports({ status: filter });
      setReports(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDown = async (postId: number) => {
    if (!window.confirm('Are you sure you want to block this post?')) return;
    try {
      await adminApi.blockPost(postId);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDismiss = async (reportId: number) => {
    if (!window.confirm('Dismiss this report?')) return;
    try {
      await adminApi.dismissReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Reported Content</h2>
        <p className="text-slate-500 mt-1">Review and take action on flagged posts and comments.</p>
      </header>

      <div className="flex items-center gap-4">
        {['pending', 'resolved', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all capitalize ${
              filter === status 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {loading && !reports.length ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All clear!</h3>
            <p className="text-slate-500 mt-1">No {filter} reports to review at this time.</p>
          </div>
        ) : reports.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    report.post_status === 'active' ? 'bg-amber-50 text-amber-600' :
                    report.post_status === 'blocked' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {report.post_status === 'active' ? <AlertCircle className="w-5 h-5" /> :
                     report.post_status === 'blocked' ? <CheckCircle className="w-5 h-5" /> :
                     <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Report #{report.id}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post ID: {report.post_id}</span>
                      {report.channel_name && (
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">#{report.channel_name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for report</p>
                    <p className="text-sm text-slate-900 font-medium">{report.reason || report.title}</p>
                    {report.description && <p className="text-xs text-slate-500 mt-1">{report.description}</p>}
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Content</p>
                    <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 italic">
                      "{report.post_text}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    Reporter: <span className="text-slate-700 font-bold">{report.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Flagged on: <span className="text-slate-700 font-bold">{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                {report.post_status === 'active' && (
                  <button 
                    onClick={() => handleTakeDown(report.post_id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                  >
                    <Shield className="w-4 h-4" />
                    Take Down
                  </button>
                )}
                <button 
                  onClick={() => handleDismiss(report.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
                >
                  <XCircle className="w-4 h-4" />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
