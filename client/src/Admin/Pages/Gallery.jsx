import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/api/axiosInstance.jsx";
import { showToast } from "@/utils/customToast.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  Eye,
  UploadCloud, 
  Loader2,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  ListFilter,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const GalleryManager = () => {
  const [galleries, setGalleries] = useState([]);
  const [isNewTitle, setIsNewTitle] = useState(true);
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await axiosInstance.get("/gallery/all");
      setGalleries(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleUpload = async () => {
    if (!title || selectedFiles.length === 0)
      return showToast("error", "Title and images required");

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > MAX_FILE_SIZE
    );
    if (oversizedFiles.length > 0) {
      return showToast("error", "One or more files exceed the 5MB limit");
    }

    const formData = new FormData();
    formData.append("title", title);
    selectedFiles.forEach((file) => formData.append("images", file));

    setLoading(true);
    try {
      await axiosInstance.post("/gallery/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", "Images Added Successfully");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchGalleries();
    } catch (err) {
      console.log(err);
      showToast("error", "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axiosInstance.patch(`/gallery/update-visibility/${id}`, {
        isPublic: newStatus
      });
      
      setGalleries(prev => prev.map(g => 
        g._id === id ? { ...g, isPublic: newStatus } : g
      ));
      
      showToast("success", newStatus ? "Gallery is Public" : "Gallery is Hidden");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update status");
    }
  };

  const toggleTabDisplay = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axiosInstance.patch(`/gallery/update-tabs/${id}`, {
        showInTabs: newStatus
      });
      
      setGalleries(prev => prev.map(g => 
        g._id === id ? { ...g, showInTabs: newStatus } : g
      ));
      
      showToast("success", newStatus ? "Title added to Tabs" : "Title removed from Tabs");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update tab status");
    }
  };

  const deleteSingleImage = async (galleryId, imageUrl) => {
    try {
      await axiosInstance.patch(`/gallery/delete-image/${galleryId}`, {
        imageUrl,
      });
      showToast("success", "Image deleted");
      fetchGalleries();
    } catch (err) {
      console.log(err);
      showToast("error", "Delete failed");
    }
  };

  const deleteFullGallery = async (id) => {
    if (!window.confirm("Are you sure? This deletes the folder and all images.")) return;
    try {
      await axiosInstance.delete(`/gallery/delete/${id}`);
      showToast("success", "Gallery removed");
      fetchGalleries();
    } catch (err) {
      console.log(err);
      showToast("error", "Delete failed");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGalleries = galleries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(galleries.length / itemsPerPage);

  return (
    <div className="relative min-h-screen p-4 md:p-8 bg-slate-50/50 font-sans text-slate-900">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-xl border">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-600">Processing Request...</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gallery Manager</h1>
          <p className="text-slate-500 max-w-2xl">
            Upload new assets, manage existing collections, and control how they appear on your live website.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Upload & List (Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Modern Upload Card */}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pt-5 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  Upload Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Destination Logic */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destination</label>
                        <Select
                        value={isNewTitle ? "NEW" : title}
                        onValueChange={(v) => {
                            setIsNewTitle(v === "NEW");
                            setTitle(v === "NEW" ? "" : v);
                        }}
                        >
                        <SelectTrigger className="h-10 bg-white border-slate-200 focus:ring-blue-500">
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NEW" className="text-blue-600 font-medium">+ Create New Folder</SelectItem>
                            <Separator className="my-1"/>
                            {galleries.map((g) => (
                            <SelectItem key={g._id} value={g.title}>{g.title}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>

                    {isNewTitle && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Folder Name</label>
                        <Input
                            placeholder="e.g., Summer Collection"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-10 border-slate-200 focus-visible:ring-blue-500"
                        />
                        </div>
                    )}
                  </div>

                  {/* Right: Dropzone Style Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Files</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            group border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center 
                            cursor-pointer transition-all duration-200 text-center px-4
                            ${selectedFiles.length > 0 
                                ? "border-green-400 bg-green-50/50" 
                                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                            }
                        `}
                    >
                        <Input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                        />
                        
                        {selectedFiles.length > 0 ? (
                            <div className="flex flex-col items-center text-green-600 animate-in zoom-in-50">
                                <CheckCircle2 className="h-8 w-8 mb-2" />
                                <span className="text-sm font-medium">{selectedFiles.length} files selected</span>
                                <span className="text-xs opacity-70">Click to change</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                <ImageIcon className="h-8 w-8 mb-2" />
                                <span className="text-sm font-medium">Click to browse</span>
                                <span className="text-xs opacity-70">or drag files here</span>
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <Button 
                        onClick={handleUpload} 
                        disabled={selectedFiles.length === 0 || loading} 
                        className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base shadow-md"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4"/>}
                        Start Upload
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Management Table */}
            <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col">
               <CardHeader className="bg-white border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  Current Galleries
                </CardTitle>
              </CardHeader>
              
              <div className="flex-1 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="w-[40%] pl-6">Directory</TableHead>
                      <TableHead>Status Overview</TableHead>
                      <TableHead className="text-right pr-6">Quick Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentGalleries.length === 0 ? (
                         <TableRow>
                            <TableCell colSpan={3} className="h-32 text-center text-slate-400">
                                No galleries found. create one above.
                            </TableCell>
                         </TableRow>
                    ) : (
                        currentGalleries.map((g) => (
                        <TableRow key={g._id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="py-4 pl-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg border bg-white shadow-sm text-slate-500">
                                <FolderOpen className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                <span className="font-semibold text-slate-800">{g.title}</span>
                                <span className="text-xs text-slate-500">{g.imagePaths.length} images stored</span>
                                </div>
                            </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                {g.isPublic ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">Public</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50">Hidden</Badge>
                                )}
                                {g.showInTabs && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100 shadow-none">On Menu</Badge>
                                )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <div className="flex items-center justify-end gap-1">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                                            <DialogHeader className="p-6 pb-2">
                                                <DialogTitle className="flex items-center gap-2">
                                                    <FolderOpen className="h-5 w-5 text-slate-400"/> 
                                                    {g.title} <span className="text-slate-400 font-normal text-sm">({g.imagePaths.length} items)</span>
                                                </DialogTitle>
                                            </DialogHeader>
                                            <ScrollArea className="flex-1 p-6 pt-2">
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {g.imagePaths.map((path, idx) => (
                                                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                                                        <img src={path} alt="" className="w-full h-full object-cover"/>
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Button 
                                                                variant="destructive" size="icon" className="h-8 w-8 rounded-full"
                                                                onClick={() => deleteSingleImage(g._id, path)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                    
                                    <Button 
                                        variant="ghost" size="icon" 
                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => deleteFullGallery(g._id)}
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t bg-slate-50/30 text-sm text-slate-500">
                    <span className="pl-2">Page {currentPage} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}>
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}>
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: Visibility Control Center */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-indigo-100 h-auto bg-gradient-to-b from-white to-slate-50/50">
              <CardHeader className="pb-4 border-b border-indigo-50 bg-indigo-50/30">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-indigo-900">
                  <Globe className="h-4 w-4 text-indigo-600" /> 
                  Control Center
                </CardTitle>
                <CardDescription className="text-indigo-900/60">
                  Manage website visibility and menu links.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-4">
                <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                    <div className="space-y-4">
                    {galleries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 border-2 border-dashed rounded-xl">
                            <AlertCircle className="h-8 w-8 mb-2 opacity-50"/>
                            <p className="text-sm">No items to configure.</p>
                        </div>
                    ) : (
                        galleries.map((gallery) => (
                        <div 
                            key={gallery._id} 
                            className="group flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2 font-medium text-slate-800">
                                    <FolderOpen className="h-4 w-4 text-indigo-400"/>
                                    {gallery.title}
                                </div>
                                {gallery.isPublic && (
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                )}
                            </div>

                            {/* Control 1: Is Public? */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        Public Access
                                    </span>
                                    <span className="text-[10px] text-slate-400">Visible on website</span>
                                </div>
                                <Switch 
                                    checked={gallery.isPublic}
                                    onCheckedChange={() => toggleVisibility(gallery._id, gallery.isPublic)}
                                    className="data-[state=checked]:bg-green-600"
                                />
                            </div>

                            {/* Control 2: Show in Tabs? */}
                            <div className={`
                                flex items-center justify-between p-2 rounded-lg transition-colors
                                ${gallery.isPublic ? "bg-slate-50" : "bg-slate-100/50 opacity-60 pointer-events-none"}
                            `}>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-medium flex items-center gap-2 ${gallery.showInTabs && gallery.isPublic ? "text-blue-600" : "text-slate-600"}`}>
                                        Show in Tabs
                                    </span>
                                    <span className="text-[10px] text-slate-400">Add to filter menu</span>
                                </div>
                                <Switch 
                                    checked={gallery.showInTabs}
                                    disabled={!gallery.isPublic}
                                    onCheckedChange={() => toggleTabDisplay(gallery._id, gallery.showInTabs)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </div>
                        ))
                    )}
                    </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GalleryManager;