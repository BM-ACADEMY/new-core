import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance.jsx";
import { showToast } from "@/utils/customToast.jsx";
import { useAuth } from "@/Context/Authcontext";
import {
  Type, List as ListIcon, Trash2, Plus, X, Image as ImageIcon,
  CheckCircle, Edit2, ChevronDown, Save, Loader, Layers,
  Quote, Link, Circle, Upload
} from "lucide-react";
import BlogPreview from "./BlogPreview";

const BlogCreate = ({ switchToView, editingBlog }) => {
  const { user, loading: authLoading } = useAuth();

  const [meta, setMeta] = useState({
    title: "", mainHeading: "", slug: "", description: "", tags: "", category: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [sections, setSections] = useState([
    { id: Date.now(), isCompleted: false, items: [] }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState({ sectionIdx: null, itemIdx: null });
  const activeSectionIndex = sections.findIndex(s => !s.isCompleted);

  useEffect(() => {
    if (!authLoading && !user) showToast("Login required", "error");
  }, [user, authLoading]);

  // --- POPULATE DATA FOR EDITING ---
  useEffect(() => {
    if (editingBlog) {
      setMeta({
        title: editingBlog.title || "",
        mainHeading: editingBlog.mainHeading || "",
        slug: editingBlog.slug || "",
        description: editingBlog.description || "",
        tags: Array.isArray(editingBlog.tags) ? editingBlog.tags.join(",") : editingBlog.tags || "",
        category: editingBlog.category || "",
      });

      if (editingBlog.coverImage && editingBlog.coverImage.url) {
        setCoverPreview(editingBlog.coverImage.url);
      }

      if (editingBlog.contentBlocks && editingBlog.contentBlocks.length > 0) {
        setSections([{
          id: Date.now(),
          isCompleted: false,
          items: editingBlog.contentBlocks
        }]);
      }
    }
  }, [editingBlog]);

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && !meta.slug && !editingBlog) {
      setMeta((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      }));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const addItemToSection = (type) => {
    const activeIdx = sections.findIndex(s => !s.isCompleted);
    if (activeIdx === -1) return;
    let baseData = {};
    if (type === 'list' || type === 'checklist') baseData = { heading: "", items: [""], listType: type };
    else if (type === 'quote') baseData = { text: "", author: "" };
    else if (type === 'button') baseData = { text: "Click Me", url: "", style: "primary" };
    else if (type === 'accordion') baseData = { title: "Accordion Title", content: "" };
    else if (type === 'image') baseData = { text: "", url: "", alt: "" }; 
    else baseData = { text: "", url: "" };
    const newItem = { type: type === 'checklist' ? 'list' : type, data: baseData };
    const newSections = [...sections];
    newSections[activeIdx].items.push(newItem);
    setSections(newSections);
  };

  const updateItemData = (sectionIdx, itemIdx, field, value) => {
    const newSections = [...sections];
    newSections[sectionIdx].items[itemIdx].data[field] = value;
    setSections(newSections);
  };
    
  const removeItem = (sectionIdx, itemIdx) => {
    const newSections = [...sections];
    newSections[sectionIdx].items = newSections[sectionIdx].items.filter((_, i) => i !== itemIdx);
    setSections(newSections);
  };

  const handleImageSelect = (sIdx, iIdx, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    updateItemData(sIdx, iIdx, 'file', file);
    updateItemData(sIdx, iIdx, 'preview', preview);
    updateItemData(sIdx, iIdx, 'url', preview);
  };

  const markSectionCompleted = async (sectionIdx) => {
    const newSections = [...sections];
    newSections[sectionIdx].isCompleted = true;
    setSections(newSections);
  };
  
  const addNewSection = () => {
    if (activeSectionIndex !== -1) return showToast("Please complete the current section first.", "error");
    setSections([...sections, { id: Date.now(), isCompleted: false, items: [] }]);
  };
  const editSection = (sectionIdx) => {
    const newSections = sections.map((s, i) => ({ ...s, isCompleted: i !== sectionIdx }));
    setSections(newSections);
  };
  const removeSection = (sectionIdx) => {
    const newSections = sections.filter((_, i) => i !== sectionIdx);
    if (newSections.length === 0) newSections.push({ id: Date.now(), isCompleted: false, items: [] });
    setSections(newSections);
  };
  const toggleListType = (sIdx, iIdx) => {
    const newSections = [...sections];
    const current = newSections[sIdx].items[iIdx].data.listType;
    newSections[sIdx].items[iIdx].data.listType = current === 'list' ? 'checklist' : 'list';
    setSections(newSections);
  };
  const updateListItem = (sIdx, iIdx, listIdx, value) => {
    const newSections = [...sections];
    newSections[sIdx].items[iIdx].data.items[listIdx] = value;
    setSections(newSections);
  };
  const addListItem = (sIdx, iIdx) => {
    const newSections = [...sections];
    newSections[sIdx].items[iIdx].data.items.push("");
    setSections(newSections);
  };
  const removeListItem = (sIdx, iIdx, listIdx) => {
    const newSections = [...sections];
    newSections[sIdx].items[iIdx].data.items = newSections[sIdx].items[iIdx].data.items.filter((_, i) => i !== listIdx);
    setSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meta.title || !meta.slug) return showToast("Missing Title or Slug", "error");
    if (!editingBlog && !coverImage) return showToast("Cover Image is required", "error");

    setSubmitting(true);

    try {
      const processedBlocks = [];
      for (const section of sections) {
        for (const item of section.items) {
          let itemData = { ...item.data };
          if (item.type === 'image' && itemData.file) {
            const imageFormData = new FormData();
            imageFormData.append("slug", meta.slug || "temp-uploads");
            imageFormData.append("image", itemData.file);
            try {
              const uploadRes = await axiosInstance.post("/blogs/upload-image", imageFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
              });
              if (uploadRes.data.success) {
                itemData.url = uploadRes.data.url;
                delete itemData.file;
                delete itemData.preview;
              }
            } catch (err) {
              setSubmitting(false);
              return showToast("Image upload failed", "error");
            }
          } else if (item.type === 'image' && !itemData.file) {
             delete itemData.file;
             delete itemData.preview;
          }
          processedBlocks.push({ type: item.type, data: itemData });
        }
      }

      if (processedBlocks.length === 0) {
        setSubmitting(false);
        return showToast("Blog has no content!", "error");
      }

      const formData = new FormData();
      formData.append("title", meta.title);
      formData.append("mainHeading", meta.mainHeading);
      formData.append("slug", meta.slug);
      formData.append("description", meta.description);
      formData.append("tags", meta.tags);
      formData.append("contentBlocks", JSON.stringify(processedBlocks)); 
      formData.append("category", meta.category);

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      if (editingBlog) {
        await axiosInstance.put(`/blogs/${editingBlog._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
        showToast("Blog Updated!", "success");
      } else {
        await axiosInstance.post("/blogs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
        showToast("Blog Published!", "success");
      }
      switchToView();

    } catch (error) {
      showToast(error.response?.data?.message || "Error saving blog", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-150px)]">
      <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
        {/* Meta Header Section */}
        <div className="bg-white p-5 rounded-lg shadow-sm border mb-6">
            <h2 className="text-lg font-bold mb-4">{editingBlog ? "Edit Blog" : "Create New Blog"}</h2>
            
            <div className="mb-6">
                <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors relative group overflow-hidden bg-gray-50">
                    <input type="file" onChange={handleCoverImageChange} className="hidden" accept="image/*" />
                    {coverPreview ? (
                        <>
                            <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium">
                                <span className="flex items-center gap-2"><Edit2 size={16}/> Change Cover</span>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon size={32} className="mb-2"/>
                            <span className="text-sm font-medium">Click to upload Cover Image</span>
                        </div>
                    )}
                </label>
            </div>

            <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">Internal Title</label>
                   <input name="title" value={meta.title} onChange={handleMetaChange} placeholder="Internal Name (e.g. Draft 1)" className="w-full border p-2 rounded text-sm"/>
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase text-blue-600">Main Heading (H1)</label>
                   <input name="mainHeading" value={meta.mainHeading} onChange={handleMetaChange} placeholder="The Big Display Title" className="w-full text-xl font-bold border-b-2 border-blue-100 focus:border-blue-500 outline-none py-1"/>
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">Slug</label>
                   <input name="slug" value={meta.slug} onChange={handleMetaChange} placeholder="url-slug" className="w-full text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border-none"/>
                </div>

                <textarea name="description" value={meta.description} onChange={handleMetaChange} placeholder="Short description..." className="w-full border rounded p-2 text-sm h-16 resize-none focus:ring-1 ring-blue-200 outline-none"/>
                
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                    <input type="text" name="category" value={meta.category} onChange={handleMetaChange} placeholder="Category" className="w-full border rounded-md p-2 text-sm bg-gray-50 outline-none focus:ring-1 ring-blue-400"/>
                </div>
            </div>
        </div>

        {/* Sections */}
        <div className="flex-grow space-y-6 pb-20">
            {sections.map((section, sIdx) => (
            <div key={section.id} className={`transition-all duration-300 rounded-lg overflow-hidden ${section.isCompleted ? 'bg-white border border-gray-200 shadow-sm opacity-80 hover:opacity-100' : 'bg-white border-2 border-blue-500 shadow-xl ring-4 ring-blue-50'}`}>
                <div className={`flex justify-between items-center p-3 ${section.isCompleted ? 'bg-gray-50' : 'bg-blue-600 text-white'}`}>
                
                {/* Section Header Left */}
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm uppercase flex items-center gap-2"><Layers size={16}/> Section {sIdx + 1}</span>
                    {section.isCompleted && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{section.items.length} Items</span>}
                </div>

                {/* Section Header Right (Controls) */}
                <div className="flex gap-2 items-center">
                    {section.isCompleted ? (
                    <>
                        <button onClick={()=>editSection(sIdx)} className="p-1 hover:bg-white hover:text-blue-600 rounded text-gray-500"><Edit2 size={16}/></button>
                        <button onClick={()=>removeSection(sIdx)} className="p-1 hover:bg-white hover:text-red-600 rounded text-gray-500"><Trash2 size={16}/></button>
                    </>
                    ) : (
                    <button onClick={()=>removeSection(sIdx)} className="text-white hover:text-red-200"><X size={18}/></button>
                    )}
                </div>
                </div>

                {!section.isCompleted && (
                <div className="p-4 bg-gray-50">
                    <div className="space-y-4 mb-6">
                    {section.items.map((item, iIdx) => (
                        <div key={iIdx} className="bg-white p-3 rounded shadow-sm border relative group animate-in slide-in-from-bottom-2 fade-in">
                        <button onClick={()=>removeItem(sIdx, iIdx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 z-10"><X size={14}/></button>
                        
                        {item.type === 'heading' && <input placeholder="Heading Text" value={item.data.text} onChange={(e)=>updateItemData(sIdx, iIdx, 'text', e.target.value)} className="w-full font-bold text-lg outline-none border-b border-transparent focus:border-blue-300 placeholder:text-gray-300"/>}
                        {item.type === 'paragraph' && <textarea placeholder="Write paragraph..." value={item.data.text} onChange={(e)=>updateItemData(sIdx, iIdx, 'text', e.target.value)} className="w-full min-h-[80px] text-sm outline-none resize-y placeholder:text-gray-300"/>}

                        {item.type === 'image' && (
                            <div className="space-y-2">
                            {item.data.url ? (
                                <div className="relative group/img">
                                    <img src={item.data.url} className="h-40 w-full object-contain bg-gray-100 rounded border" alt={item.data.alt || 'preview'}/>
                                    <button onClick={()=>updateItemData(sIdx, iIdx, 'url', '')} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/img:opacity-100 transition-opacity shadow">Change Image</button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {(uploadingImg.sectionIdx === sIdx && uploadingImg.itemIdx === iIdx) ? (
                                            <Loader className="animate-spin text-blue-500 mb-2" size={24}/>
                                        ) : (
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        )}
                                        <p className="text-xs text-gray-500 font-semibold">Click to upload image</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={(e)=>handleImageSelect(sIdx, iIdx, e.target.files[0])} accept="image/*" />
                                </label>
                            )}
                            <input type="text" placeholder="Image Alt Text (SEO)" value={item.data.alt || ""} onChange={(e)=>updateItemData(sIdx, iIdx, 'alt', e.target.value)} className="w-full text-xs p-2 border rounded bg-white focus:ring-1 ring-blue-200 outline-none"/>
                            </div>
                        )}

                        {item.type === 'list' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                <input placeholder="Optional heading" value={item.data.heading || ""} onChange={(e) => updateItemData(sIdx, iIdx, 'heading', e.target.value)} className="w-full font-bold text-lg outline-none border-b border-transparent focus:border-blue-300 placeholder:text-gray-300"/>
                                <button onClick={() => toggleListType(sIdx, iIdx)} className="ml-4 p-2 bg-gray-100 rounded hover:bg-gray-200 transition">{item.data.listType === 'checklist' ? <CheckCircle size={18} className="text-green-600"/> : <Circle size={18} className="text-gray-500"/>}</button>
                            </div>
                            <div className="space-y-2 pl-4">
                                {item.data.items.map((listItem, listIdx) => (
                                <div key={listIdx} className="flex gap-3 items-center">
                                    {item.data.listType === 'checklist' ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0"/> : <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"/>}
                                    <input value={listItem} onChange={(e) => updateListItem(sIdx, iIdx, listIdx, e.target.value)} className="flex-1 text-sm border-b border-gray-100 focus:border-blue-300 outline-none" placeholder="List item"/>
                                    <button onClick={() => removeListItem(sIdx, iIdx, listIdx)} className="text-gray-300 hover:text-red-500"><X size={12}/></button>
                                </div>
                                ))}
                                <button onClick={() => addListItem(sIdx, iIdx)} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2"><Plus size={10}/> Add Item</button>
                            </div>
                            </div>
                        )}
                        
                        {item.type === 'quote' && (
                            <div className="space-y-3">
                            <textarea placeholder="Quote text..." value={item.data.text} onChange={(e)=>updateItemData(sIdx, iIdx, 'text', e.target.value)} className="w-full italic text-lg outline-none border-b border-gray-200 focus:border-blue-300"/>
                            <input placeholder="Author (optional)" value={item.data.author} onChange={(e)=>updateItemData(sIdx, iIdx, 'author', e.target.value)} className="w-full text-sm text-gray-500 italic outline-none"/>
                            </div>
                        )}
                        
                        {item.type === 'button' && (
                            <div className="space-y-3">
                            <input placeholder="Button Text" value={item.data.text} onChange={(e)=>updateItemData(sIdx, iIdx, 'text', e.target.value)} className="w-full font-medium outline-none border-b"/>
                            <input placeholder="URL" value={item.data.url} onChange={(e)=>updateItemData(sIdx, iIdx, 'url', e.target.value)} className="w-full text-sm text-blue-600 outline-none border-b"/>
                            <select value={item.data.style} onChange={(e)=>updateItemData(sIdx, iIdx, 'style', e.target.value)} className="w-full text-sm p-2 border rounded">
                                <option value="primary">Primary (Blue)</option>
                                <option value="outline">Outline</option>
                                <option value="black">Black</option>
                            </select>
                            </div>
                        )}
                        
                        {item.type === 'accordion' && (
                            <div className="space-y-3">
                            <input placeholder="Accordion Title" value={item.data.title} onChange={(e)=>updateItemData(sIdx, iIdx, 'title', e.target.value)} className="w-full font-bold outline-none border-b"/>
                            <textarea placeholder="Accordion content..." value={item.data.content} onChange={(e)=>updateItemData(sIdx, iIdx, 'content', e.target.value)} className="w-full min-h-[100px] text-sm outline-none resize-y border rounded p-2 bg-gray-50"/>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-4 flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                        <SmallToolBtn icon={<Type size={14}/>} label="Heading" onClick={()=>addItemToSection('heading')}/>
                        <SmallToolBtn icon={<Type size={12}/>} label="Para" onClick={()=>addItemToSection('paragraph')}/>
                        <SmallToolBtn icon={<ImageIcon size={14}/>} label="Img" onClick={()=>addItemToSection('image')}/>
                        <SmallToolBtn icon={<Circle size={14}/>} label="List" onClick={()=>addItemToSection('list')}/>
                        <SmallToolBtn icon={<CheckCircle size={14}/>} label="Check" onClick={()=>addItemToSection('checklist')}/>
                        <SmallToolBtn icon={<Quote size={14}/>} label="Quote" onClick={()=>addItemToSection('quote')}/>
                        <SmallToolBtn icon={<Link size={14}/>} label="Btn" onClick={()=>addItemToSection('button')}/>
                        <SmallToolBtn icon={<ChevronDown size={14}/>} label="Accrd" onClick={()=>addItemToSection('accordion')}/>
                    </div>
                    <button onClick={() => markSectionCompleted(sIdx)} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg">
                        <CheckCircle size={16}/> Done
                    </button>
                    </div>
                </div>
                )}
            </div>
            ))}
            {activeSectionIndex === -1 && (
            <div onClick={addNewSection} className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition hover:bg-blue-50">
                <Plus size={32} className="mb-2"/>
                <span className="font-bold">Add New Section</span>
            </div>
            )}
        </div>
        
        {activeSectionIndex === -1 && (
            <div className="sticky bottom-4 bg-white/80 backdrop-blur p-4 border-t shadow-lg rounded-t-xl">
            <button onClick={handleSubmit} disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex justify-center items-center gap-2">
                {submitting ? <Loader className="animate-spin" size={18}/> : <Save size={18}/>}
                {editingBlog ? "Update Blog Post" : "Publish Blog Post"}
            </button>
            </div>
        )}
      </div>
      <div className="hidden lg:block h-full bg-gray-100 rounded-xl overflow-hidden shadow-inner border relative">
        <div className="h-full overflow-y-auto p-8 custom-scrollbar">
          <BlogPreview meta={meta} coverPreview={coverPreview} sections={sections} />
        </div>
      </div>
    </div>
  );
};

const SmallToolBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-sm">
    {icon} {label}
  </button>
);

export default BlogCreate;