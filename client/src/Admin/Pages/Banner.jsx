import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance.jsx";
import { showToast } from "@/utils/customToast.jsx";
import { Trash2, Edit, Upload, Loader2, Plus, X, Image as ImageIcon } from "lucide-react";

const BannerManagement = () => {
  // --- Global States ---
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- ADD BANNER STATES ---
  const [newTitle, setNewTitle] = useState("");
  const [newSubheading, setNewSubheading] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newPreview, setNewPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- EDIT & VIEW STATES ---
  const [viewImage, setViewImage] = useState(null); // Keeps image modal functionality (optional)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubheading, setEditSubheading] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // ==========================
  // 1. FETCH BANNERS
  // ==========================
  useEffect(() => {
    fetchBanners();
  }, [refreshKey]);

  const fetchBanners = async () => {
    try {
      const res = await axiosInstance.get("/banners");
      setBanners(res.data);
    } catch (error) {
      showToast("Error fetching banners", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // 2. CREATE (UPLOAD) LOGIC
  // ==========================
  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showToast("File too large (Max 5MB)", "error");
      setNewImage(file);
      setNewPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle || !newImage) return showToast("Title and Image are required", "error");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("subheading", newSubheading);
    formData.append("bannerImage", newImage);

    try {
      await axiosInstance.post("/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Banner created successfully!", "success");
      setNewTitle("");
      setNewSubheading("");
      setNewImage(null);
      setNewPreview(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      showToast(error.response?.data?.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================
  // 3. EDIT & DELETE LOGIC
  // ==========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axiosInstance.delete(`/banners/${id}`);
      setBanners(banners.filter((b) => b._id !== id));
      showToast("Banner deleted", "success");
    } catch (error) {
      showToast("Delete failed", "error");
    }
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setEditTitle(banner.title);
    setEditSubheading(banner.subheading);
    setEditPreview(banner.image);
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showToast("File too large", "error");
      setEditImageFile(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("subheading", editSubheading);
    if (editImageFile) formData.append("bannerImage", editImageFile);

    try {
      const res = await axiosInstance.put(`/banners/${editingBanner._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBanners(banners.map((b) => (b._id === editingBanner._id ? res.data.banner : b)));
      showToast("Banner updated", "success");
      setIsEditOpen(false);
    } catch (error) {
      showToast("Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // ==========================
  // 4. RENDER
  // ==========================
  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Banner Management</h1>
            <p className="text-slate-500 mt-1">Manage your website's hero sliders and visuals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: UPLOAD FORM --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-8">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-slate-600" /> Add New Banner
              </h2>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Summer Sale" 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Subheading</label>
                <input 
                  type="text" 
                  value={newSubheading} 
                  onChange={(e) => setNewSubheading(e.target.value)}
                  placeholder="e.g. 50% Off Everything" 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Banner Image <span className="text-red-500">*</span></label>
                
                {/* Custom Upload Area */}
                <div className="relative group cursor-pointer">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleNewImageChange} 
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" 
                    />
                    <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${newPreview ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                        {newPreview ? (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden shadow-sm">
                                <img src={newPreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <>
                                <div className="p-3 bg-slate-100 rounded-full mb-3">
                                    <Upload className="w-6 h-6 text-slate-500" />
                                </div>
                                <p className="text-sm font-medium text-slate-700">Click to upload</p>
                                <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG (Max 5MB)</p>
                            </>
                        )}
                    </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2 mt-2"
              >
                {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Publish Banner"}
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: BANNER LIST --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-400" />
                    <p>Loading banners...</p>
                </div>
            ) : banners.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No banners found</h3>
                    <p className="mt-1">Get started by creating a new banner.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Preview</th>
                                <th className="px-6 py-4 font-medium">Details</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {banners.map((banner) => (
                            <tr key={banner._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 w-32">
                                    <div 
                                        className="h-16 w-28 bg-slate-100 rounded-md overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition"
                                        onClick={() => setViewImage(banner.image)}
                                        title="Click to view full image"
                                    >
                                        <img src={banner.image} alt="Thumbnail" className="h-full w-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-slate-900 line-clamp-1">{banner.title}</p>
                                    <p className="text-slate-500 text-xs mt-1 line-clamp-1">{banner.subheading || "No subheading"}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => openEditModal(banner)} 
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(banner._id)} 
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>

      </div>

      {/* --- IMAGE MODAL --- */}
      {viewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-all" onClick={() => setViewImage(null)}>
          <div className="relative max-w-5xl w-full">
            <button className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors">
                <X className="w-8 h-8" />
            </button>
            <img src={viewImage} alt="Full Banner" className="w-full h-auto rounded-lg shadow-2xl max-h-[85vh] object-contain mx-auto" />
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Edit Banner</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <input 
                        type="text" 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)} 
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2" 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Subheading</label>
                    <input 
                        type="text" 
                        value={editSubheading} 
                        onChange={(e) => setEditSubheading(e.target.value)} 
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2" 
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Image</label>
                    <div className="flex items-start gap-4 p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <img src={editPreview} alt="Preview" className="h-16 w-24 object-cover rounded-md border border-slate-300 bg-white" />
                        <div className="flex-1">
                            <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 h-8 px-3 py-1 shadow-sm transition-colors">
                                Change Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleEditFileChange} />
                            </label>
                            <p className="text-xs text-slate-500 mt-1">Leave blank to keep current image.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                    <button 
                        type="button" 
                        onClick={() => setIsEditOpen(false)}
                        className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 h-10 px-4 py-2"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isUpdating} 
                        className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-900/90 h-10 px-4 py-2"
                    >
                        {isUpdating ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BannerManagement;