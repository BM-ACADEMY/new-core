import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/api/axiosInstance.jsx";
import { showToast } from "@/utils/customToast.jsx";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Trash2, 
  Eye, 
  Upload, 
  Loader2, 
  FolderOpen,
  ChevronLeft,
  ChevronRight
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

  useEffect(() => { fetchGalleries(); }, []);

  const fetchGalleries = async () => {
    try {
      const res = await axiosInstance.get("/gallery/all");
      setGalleries(res.data);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const handleUpload = async () => {
    if (!title || selectedFiles.length === 0) return showToast("error", "Title and images required");

    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      return showToast("error", "One or more files exceed the 5MB limit");
    }

    const formData = new FormData();
    formData.append("title", title);
    selectedFiles.forEach(file => formData.append("images", file));

    setLoading(true);
    try {
      await axiosInstance.post("/gallery/upload", formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      showToast("success", "Images Added Successfully");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchGalleries();
    } catch (err) { 
      showToast("error", "Upload failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  const deleteSingleImage = async (galleryId, imageUrl) => {
    try {
      await axiosInstance.patch(`/gallery/delete-image/${galleryId}`, { imageUrl });
      showToast("success", "Image deleted");
      fetchGalleries();
    } catch (err) { showToast("error", "Delete failed"); }
  };

  const deleteFullGallery = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axiosInstance.delete(`/gallery/delete/${id}`);
      showToast("success", "Gallery removed");
      fetchGalleries();
    } catch (err) { showToast("error", "Delete failed"); }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGalleries = galleries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(galleries.length / itemsPerPage);

  return (
    /* Adjusted padding: p-3 for mobile, sm:p-6 for tablet, md:p-10 for desktop */
    <div className="relative min-h-screen bg-background p-3 sm:p-6 md:p-10">
      
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Uploading assets...</p>
          </div>
        </div>
      )}

      {/* Added mx-auto and refined max-width for better centering */}
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Gallery Manager</h1>
          <p className="text-sm text-muted-foreground">Organize and manage your media library (Max 5MB per file).</p>
        </div>

        <Separator />

        <Card className="shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-medium uppercase text-muted-foreground">Target Folder</label>
                <Select value={isNewTitle ? "NEW" : title} onValueChange={(v) => { setIsNewTitle(v === "NEW"); setTitle(v === "NEW" ? "" : v); }}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW" className="text-primary font-medium">+ Create New</SelectItem>
                    {galleries.map(g => <SelectItem key={g._id} value={g.title}>{g.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {isNewTitle && (
                <div className="md:col-span-3 space-y-1.5 animate-in slide-in-from-left-2">
                  <label className="text-xs font-medium uppercase text-muted-foreground">Folder Name</label>
                  <Input placeholder="Enter title..." value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
              )}

              <div className={`space-y-1.5 ${isNewTitle ? 'md:col-span-4' : 'md:col-span-7'}`}>
                <label className="text-xs font-medium uppercase text-muted-foreground">Images</label>
                <Input ref={fileInputRef} type="file" multiple accept="image/*" className="cursor-pointer" onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
              </div>

              <div className="md:col-span-2">
                <Button onClick={handleUpload} disabled={selectedFiles.length === 0} className="w-full font-medium">Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Section: Responsive horizontal padding */}
        <Card className="shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40%] pl-4 sm:pl-6">Directory Name</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="hidden sm:table-cell">Modified</TableHead>
                  <TableHead className="text-right pr-4 sm:pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGalleries.map((g) => (
                  <TableRow key={g._id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="py-4 pl-4 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="hidden xs:flex h-9 w-9 items-center justify-center rounded-md border bg-background text-muted-foreground"><FolderOpen className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm truncate max-w-[150px] sm:max-w-none">{g.title}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {g._id.slice(-6)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{g.imagePaths.length} <span className="hidden xs:inline ml-1">items</span></Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{new Date(g.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right pr-4 sm:pr-6 space-x-1 sm:space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3"><Eye className="sm:mr-2 h-3.5 w-3.5" /> <span className="hidden sm:inline">View</span></Button>
                        </DialogTrigger>
                        {/* Modal padding and width check */}
                        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                          <DialogHeader className="p-4 sm:p-6 border-b">
                            <DialogTitle>{g.title}</DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                              {g.imagePaths.map((path, idx) => (
                                <div key={idx} className="group relative aspect-square rounded-md border bg-background overflow-hidden shadow-sm">
                                  <img src={path} className="h-full w-full object-cover" alt="gallery-item" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => deleteSingleImage(g._id, path)}><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => deleteFullGallery(g._id)}><Trash2 className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t bg-muted/20 gap-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing <span className="font-medium text-foreground">{indexOfFirstItem + 1}</span> to <span className="font-medium text-foreground">{Math.min(indexOfLastItem, galleries.length)}</span> of <span className="font-medium text-foreground">{galleries.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1} className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs font-medium">Page {currentPage} of {totalPages || 1}</div>
              <Button 
                variant="outline" size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0} className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GalleryManager;