import { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Check,
  Sun,
  Home,
  Star,
  Info
} from 'lucide-react';
import { servicesApi } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  is_active: number;
}

const ICON_OPTIONS = [
  { name: 'Heart', icon: Heart },
  { name: 'Sun', icon: Sun },
  { name: 'Home', icon: Home },
  { name: 'Star', icon: Star },
  { name: 'Info', icon: Info },
];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await servicesApi.getServices();
      setServices(res.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
    };

    setIsSubmitting(true);
    try {
      if (editingService) {
        await servicesApi.adminUpdateService({ id: editingService.id, ...data });
      } else {
        await servicesApi.adminAddService(data);
      }
      await fetchServices();
      setShowModal(false);
      setEditingService(null);
    } catch (err) {
      console.error('Operation failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure? This may affect existing requests.')) return;
    try {
      await servicesApi.adminDeleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const getIcon = (iconName: string) => {
    const Option = ICON_OPTIONS.find(o => o.name === iconName) || ICON_OPTIONS[0];
    return <Option.icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Service Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage the dynamic service types available for users.</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </header>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Services...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  {getIcon(service.icon)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingService(service);
                      setShowModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {service.description || 'No description provided.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Service Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    defaultValue={editingService?.name}
                    placeholder="e.g. Pooja"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICON_OPTIONS.map((opt) => (
                      <label key={opt.name} className="cursor-pointer">
                        <input 
                          type="radio" 
                          name="icon" 
                          value={opt.name} 
                          className="sr-only peer" 
                          defaultChecked={editingService?.icon === opt.name || opt.name === 'Heart'}
                        />
                        <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition-all">
                          <opt.icon className="w-5 h-5" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    name="description"
                    defaultValue={editingService?.description}
                    placeholder="Brief description of the service..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingService ? 'Save Changes' : 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
