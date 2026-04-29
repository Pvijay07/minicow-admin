import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { authApi, SITE_URL } from '../lib/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile: string;
  city: string;
  status: string;
  created_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const resData = await authApi.listUsers();
      if (resData.status) {
        setUsers(resData.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.phone || '').includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium animate-pulse">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 mt-1">Manage and interact with platform users.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100">
                        {user.profile ? (
                          <img 
                            src={`${SITE_URL}/public/uploads/users/${user.profile}`} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as any).src = 'https://ui-avatars.com/api/?name=' + user.name;
                            }}
                          />
                        ) : (
                          <User className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name || 'Anonymous'}</div>
                        <div className="text-xs text-slate-400">ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {user.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {user.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {user.city || 'Not set'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      user.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/support?userId=${user.id}`)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors title='Chat with User'"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
