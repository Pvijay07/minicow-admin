import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail,
  Calendar,
  MessageSquare,
  Loader2,
  AlertCircle,
  User
} from 'lucide-react';
import { servicesApi } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

type RequestStatus = 'Pending' | 'Contacted' | 'Completed' | 'Cancelled';

interface ServiceRequest {
  id: number;
  user_id: number;
  service_type: string;
  status: RequestStatus;
  details: string;
  admin_notes: string;
  created_at: string;
  user_name: string;
  user_phone: string;
  user_email: string;
}

export default function ServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await servicesApi.adminGetServiceRequests(filterStatus);
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: RequestStatus, notes: string) => {
    setIsUpdating(true);
    try {
      await servicesApi.adminUpdateServiceRequest({ id, status, admin_notes: notes });
      await fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to update request', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Contacted': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const filteredRequests = requests.filter(req => 
    req.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.user_phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Service Requests</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage Minicow service bookings and user follow-ups.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search requests..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64 text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-600 cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
          <div className="inline-flex p-4 bg-slate-50 rounded-2xl mb-4">
            <ClipboardList className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No requests found</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">There are currently no service requests matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
               <div className={cn(
                 "absolute left-0 top-0 bottom-0 w-1.5",
                 req.status === 'Pending' ? "bg-amber-400" :
                 req.status === 'Contacted' ? "bg-blue-400" :
                 req.status === 'Completed' ? "bg-emerald-400" : "bg-rose-400"
               )} />
               
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                 <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     <span className={cn(
                       "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                       getStatusColor(req.status)
                     )}>
                       {req.status}
                     </span>
                     <h4 className="text-lg font-bold text-slate-900">{req.service_type} Request</h4>
                     <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                       <Calendar className="w-3 h-3" />
                       {new Date(req.created_at).toLocaleDateString()}
                     </span>
                   </div>
                   
                   <div className="flex flex-wrap items-center gap-6">
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                         <Phone className="w-4 h-4 text-slate-500" />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                         <p className="text-sm font-bold text-slate-700">{req.user_phone || 'N/A'}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                         <User className="w-4 h-4 text-slate-500" />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</p>
                         <p className="text-sm font-bold text-slate-700">{req.user_name}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                         <Mail className="w-4 h-4 text-slate-500" />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                         <p className="text-sm font-bold text-slate-700">{req.user_email || 'N/A'}</p>
                       </div>
                     </div>
                   </div>

                   {req.details && (
                     <div className="p-4 bg-slate-50 rounded-xl flex gap-3">
                       <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                       <p className="text-sm text-slate-600 leading-relaxed italic">"{req.details}"</p>
                     </div>
                   )}
                 </div>

                 <div className="flex items-center gap-3 shrink-0">
                   <button 
                     onClick={() => setSelectedRequest(req)}
                     className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                   >
                     Take Action
                   </button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Update Request</h3>
                <p className="text-sm text-slate-500">Update status and add notes for {selectedRequest.user_name}.</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateStatus(
                selectedRequest.id, 
                formData.get('status') as RequestStatus, 
                formData.get('notes') as string
              );
            }}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                <select 
                  name="status"
                  defaultValue={selectedRequest.status}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700"
                >
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Notes</label>
                <textarea 
                  name="notes"
                  defaultValue={selectedRequest.admin_notes}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px] text-sm font-medium"
                  placeholder="Add any follow-up notes here..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-[2] px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
