import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { adminApi } from '@/src/lib/api';

const chartData = [
  { name: 'Mon', users: 4000, posts: 2400 },
  { name: 'Tue', users: 3000, posts: 1398 },
  { name: 'Wed', users: 2000, posts: 9800 },
  { name: 'Thu', users: 2780, posts: 3908 },
  { name: 'Fri', users: 1890, posts: 4800 },
  { name: 'Sat', users: 2390, posts: 3800 },
  { name: 'Sun', users: 3490, posts: 4300 },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Users', value: data?.total_users || '0', change: 'Live', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Posts', value: data?.total_posts || '0', change: 'Live', trend: 'up', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Engagement', value: data?.total_engagement || '0', change: 'Live', trend: 'up', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Reports', value: data?.pending_reports || '0', change: 'Action Needed', trend: 'down', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium animate-pulse tracking-wide">Gathering platform insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h2>
        <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl transition-colors", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-lg",
                stat.trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
              )}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
                {parseInt(stat.value).toLocaleString()}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">User Growth & Activity</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold text-indigo-600">Last 7 days</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Last 30 days</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 font-primary">System Health</h3>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Storage Status</p>
                <p className="text-sm text-emerald-600 font-medium mt-0.5">All services optimal</p>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">API Latency</p>
                <p className="text-sm text-indigo-600 font-medium mt-0.5">Average: 42ms</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Realtime Feed</p>
               <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                     <p className="text-xs font-medium text-slate-600">Syncing with main cluster...</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
