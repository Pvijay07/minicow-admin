import { 
  LayoutDashboard, 
  User,
  Users,
  Menu, 
  LayoutGrid, 
  Flag, 
  PlusCircle,
  Settings,
  LogOut,
  ChevronRight,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const mainItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'User Management', path: '/users' }
];

const communityItems = [
  { icon: Menu, label: 'Channels', path: '/channels' },
  { icon: LayoutGrid, label: 'Post Management', path: '/posts' },
  { icon: Flag, label: 'Reported Posts', path: '/reports' },
  { icon: ClipboardList, label: 'Service Requests', path: '/services' },
  { icon: LayoutGrid, label: 'Gallery', path: '/gallery' },
  { icon: MessageSquare, label: 'Support Tickets', path: '/support' },
];

const settingsItems = [
  { icon: Settings, label: 'Service Config', path: '/services-config' },
];


export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Punganur</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-3 mb-3">
            Main Menu
          </div>
          <div className="space-y-1">
            {mainItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-opacity", "opacity-0 group-hover:opacity-100")} />
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-3 mb-3">
            Community
          </div>
          <div className="space-y-1">
            {communityItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-opacity", "opacity-0 group-hover:opacity-100")} />
              </NavLink>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <NavLink
            to="/posts/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium">New Post</span>
          </NavLink>
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-3 mb-3">
            Settings
          </div>
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-opacity", "opacity-0 group-hover:opacity-100")} />
              </NavLink>
            ))}
          </div>
        </div>
      </nav>


      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

