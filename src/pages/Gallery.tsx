import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Plus, 
  X, 
  Loader2, 
  AlertCircle,
  Eye,
  Maximize2
} from 'lucide-react';
import { servicesApi } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

interface GalleryImage {
  id: number;
  image_url: string;
  caption: string;
  created_at: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await servicesApi.getGallery();
      setImages(res.data);
    } catch (err) {
      console.error('Failed to fetch gallery', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!formData.get('image')) return;

    setIsUploading(true);
    try {
      await servicesApi.adminAddGalleryImage(formData);
      await fetchGallery();
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await servicesApi.adminDeleteGalleryImage(id);
      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Gallery Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Showcase recent images to build trust and engagement.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
      </header>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading gallery...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
          <div className="inline-flex p-6 bg-slate-50 rounded-3xl mb-4">
            <ImageIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Gallery is empty</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Start uploading images to showcase your Minicow services and community.</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
          >
            Upload your first image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={image.image_url} 
                  alt={image.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setSelectedImage(image)}
                    className="p-2 bg-white text-slate-900 rounded-lg hover:bg-indigo-600 hover:text-white transition-all transform -translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-white text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {image.caption && (
                <div className="p-4 border-t border-slate-50">
                  <p className="text-sm font-medium text-slate-700 line-clamp-1">{image.caption}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Upload to Gallery</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form className="p-6 space-y-6" onSubmit={handleUpload}>
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors group">
                  <input 
                    type="file" 
                    name="image"
                    accept="image/*"
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Click or drag image here</p>
                    <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Caption (Optional)</label>
                  <input 
                    type="text" 
                    name="caption"
                    placeholder="Describe this image..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="flex-[2] px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-slate-900/95 z-[60] flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
          <img 
            src={selectedImage.image_url} 
            alt={selectedImage.caption}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-90 duration-300"
          />
          {selectedImage.caption && (
            <p className="mt-6 text-white text-lg font-medium tracking-wide text-center max-w-2xl">
              {selectedImage.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
