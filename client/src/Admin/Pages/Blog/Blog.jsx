// BlogCreate.jsx - COMPLETE FILE
import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance.jsx";
import { showToast } from "@/utils/customToast.jsx";
import { useAuth } from "@/Context/Authcontext";
import { 
  Type, List as ListIcon, Trash2, Plus, X, Image as ImageIcon, 
  CheckCircle, Edit2, ChevronDown, Save, Loader, Layers, 
  Quote, Link, ChevronUp, Circle 
} from "lucide-react";
import BlogPreview from "./BlogPreview";

const BlogCreate = ({ switchToView }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [meta, setMeta] = useState({
    title: "", slug: "", description: "", tags: "", category: "",
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

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && !meta.slug) {
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
    if (type === 'list' || type === 'checklist') {
      baseData = { 
        heading: "",
        items: [""],
        listType: type // 'list' = bullet, 'checklist' = check
      };
    } else if (type === 'quote') baseData = { text: "", author: "" };
    else if (type === 'button') baseData = { text: "Click Me", url: "", style: "primary" };
    else if (type === 'accordion') baseData = { title: "Accordion Title", content: "" };
    else baseData = { text: "", url: "" };

    const newItem = { type: type === 'checklist' ? 'list' : type, data: baseData };

    const newSections = [...sections];
    newSections[activeIdx].items.push(newItem);
    setSections(newSections);
  };

  const toggleListType = (sIdx, iIdx) => {
    const newSections = [...sections];
    const current = newSections[sIdx].items[iIdx].data.listType;
    newSections[sIdx].items[iIdx].data.listType = current === 'list' ? 'checklist' : 'list';
    setSections(newSections);
  };

  const addNewSection = () => {
    if (activeSectionIndex !== -1) return showToast("Please complete the current section first.", "error");
    setSections([...sections, { id: Date.now(), isCompleted: false, items: [] }]);
  };

  const markSectionCompleted = async (sectionIdx) => {
    const section = sections[sectionIdx];
    if (section.items.length === 0) return showToast("Section is empty. Add content or delete it.", "error");

    // Upload all pending images in this section when "Done" is clicked
    for (let iIdx = 0; iIdx < section.items.length; iIdx++) {
      const item = section.items[iIdx];
      if (item.type === 'image' && item.data.file && !item.data.url.startsWith('blob:')) {
        setUploadingImg({ sectionIdx, itemIdx: iIdx });
        await handleImageUpload(sectionIdx, iIdx, item.data.file);
      }
    }

    const newSections = [...sections];
    newSections[sectionIdx].isCompleted = true;
    setSections(newSections);
    setUploadingImg({ sectionIdx: null, itemIdx: null });
  };

  const editSection = (sectionIdx) => {
    const newSections = sections.map((s, i) => ({
      ...s,
      isCompleted: i !== sectionIdx
    }));
    setSections(newSections);
  };

  const removeSection = (sectionIdx) => {
    const newSections = sections.filter((_, i) => i !== sectionIdx);
    if (newSections.length === 0) {
      newSections.push({ id: Date.now(), isCompleted: false, items: [] });
    }
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

  const handleImageSelect = (sIdx, iIdx, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    updateItemData(sIdx, iIdx, 'file', file);
    updateItemData(sIdx, iIdx, 'preview', preview);
    updateItemData(sIdx, iIdx, 'url', preview); // temporary preview
  };

  const handleImageUpload = async (sIdx, iIdx, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("slug", meta.slug || "temp-uploads"); 
    formData.append("image", file);

    try {
      const res = await axiosInstance.post("/blogs/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true 
      });
      if (res.data.success) {
        updateItemData(sIdx, iIdx, "url", res.data.url);
        updateItemData(sIdx, iIdx, "file", null); // clear temp file
      }
    } catch (error) {
      showToast("Image upload failed", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meta.title || !meta.slug || !coverImage) return showToast("Missing Title, Slug or Cover", "error");
    
    const flatBlocks = sections.flatMap(section => section.items);
    if (flatBlocks.length === 0) return showToast("Blog has no content!", "error");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", meta.title);
    formData.append("slug", meta.slug);
    formData.append("description", meta.description);
    formData.append("tags", meta.tags); 
    formData.append("contentBlocks", JSON.stringify(flatBlocks));
    formData.append("coverImage", coverImage);
    formData.append("category", meta.category);

    try {
      await axiosInstance.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      showToast("Blog Published!", "success");
      switchToView();
    } catch (error) {
      showToast(error.response?.data?.message || "Error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-150px)]">
      <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
        {/* Meta */}
        <div className="bg-white p-5 rounded-lg shadow-sm border mb-6">
          <div className="flex gap-4 mb-4">
            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 border-dashed border-2 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-blue-400 group">
              {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover"/> : <ImageIcon className="text-gray-400"/>}
              <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center text-white text-xs">Change</div>
              <input type="file" onChange={handleCoverImageChange} className="absolute inset-0 opacity-0 cursor-pointer"/>
            </div>
            <div className="flex-grow space-y-2">
              <input name="title" value={meta.title} onChange={handleMetaChange} placeholder="Enter Blog Title..." className="w-full font-bold text-xl border-b border-gray-300 focus:border-blue-500 outline-none pb-1 placeholder:font-normal"/>
              <input name="slug" value={meta.slug} onChange={handleMetaChange} placeholder="url-slug" className="w-full text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border-none"/>
            </div>
          </div>
          <textarea name="description" value={meta.description} onChange={handleMetaChange} placeholder="Short description..." className="w-full border rounded p-2 text-sm h-16 resize-none focus:ring-1 ring-blue-200 outline-none"/>
          <div className="mt-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Category Name</label>
            <input 
              type="text"
              name="category"
              value={meta.category}
              onChange={handleMetaChange}
              placeholder="e.g. Technology, Personal, Charity"
              className="w-full border rounded-md p-2 text-sm bg-gray-50 outline-none focus:ring-1 ring-blue-400 focus:border-blue-400"
            />
            <p className="text-[9px] text-gray-400 mt-1">Enter a custom category name for this post.</p>
          </div>
        </div>

        {/* Sections */}
        <div className="flex-grow space-y-6 pb-20">
          {sections.map((section, sIdx) => (
            <div key={section.id} className={`transition-all duration-300 rounded-lg overflow-hidden ${section.isCompleted ? 'bg-white border border-gray-200 shadow-sm opacity-80 hover:opacity-100' : 'bg-white border-2 border-blue-500 shadow-xl ring-4 ring-blue-50'}`}>
              <div className={`flex justify-between items-center p-3 ${section.isCompleted ? 'bg-gray-50' : 'bg-blue-600 text-white'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm uppercase flex items-center gap-2"><Layers size={16}/> Section {sIdx + 1}</span>
                  {section.isCompleted && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{section.items.length} Items</span>}
                </div>
                <div className="flex gap-2">
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
                    {section.items.length === 0 && <div className="text-center text-gray-400 py-4 text-sm italic">Add items using the buttons below</div>}
                    
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="bg-white p-3 rounded shadow-sm border relative group animate-in slide-in-from-bottom-2 fade-in">
                        <button onClick={()=>removeItem(sIdx, iIdx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><X size={14}/></button>
                        
                        {item.type === 'heading' && (
                          <input placeholder="Heading Text" value={item.data.text} onChange={(e)=>updateItemData(sIdx, iIdx, 'text', e.target.value)} className="w-full font-bold text-lg outline-none border-b border-transparent focus:border-blue-300 placeholder:text-gray-300"/>
                        )}
                        
                        {item.type === 'paragraph' && (
                          <textarea placeholder="Write paragraph..." value={item.data.text} onChange={(e)=>updateItemData(sIdx, iIdx, 'text', e.target.value)} className="w-full min-h-[80px] text-sm outline-none resize-y placeholder:text-gray-300"/>
                        )}

                        {item.type === 'image' && (
                          <div>
                            {item.data.url ? (
                              <div className="relative">
                                <img src={item.data.url} className="h-32 object-contain bg-gray-100 rounded"/>
                                <button onClick={()=>updateItemData(sIdx, iIdx, 'url', '')} className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-2 py-1 rounded">Remove</button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="bg-gray-100 p-2 rounded-full"><ImageIcon size={18} className="text-gray-400"/></div>
                                <input type="file" onChange={(e)=>handleImageSelect(sIdx, iIdx, e.target.files[0])} className="text-xs text-gray-500"/>
                                {(uploadingImg.sectionIdx === sIdx && uploadingImg.itemIdx === iIdx) && <Loader className="animate-spin text-blue-500" size={14}/>}
                              </div>
                            )}
                          </div>
                        )}

                        {item.type === 'list' && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <input 
                                placeholder="Optional heading (e.g., Each 90-day course is:)" 
                                value={item.data.heading || ""} 
                                onChange={(e) => updateItemData(sIdx, iIdx, 'heading', e.target.value)} 
                                className="w-full font-bold text-lg outline-none border-b border-transparent focus:border-blue-300 placeholder:text-gray-300"
                              />
                              <button
                                onClick={() => toggleListType(sIdx, iIdx)}
                                className="ml-4 p-2 bg-gray-100 rounded hover:bg-gray-200 transition"
                                title="Switch between Bullet & Check icon"
                              >
                                {item.data.listType === 'checklist' ? 
                                  <CheckCircle size={18} className="text-green-600"/> : 
                                  <Circle size={18} className="text-gray-500"/>
                                }
                              </button>
                            </div>

                            <div className="space-y-2 pl-4">
                              {item.data.items.map((listItem, listIdx) => (
                                <div key={listIdx} className="flex gap-3 items-center">
                                  {item.data.listType === 'checklist' ? 
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0"/> :
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"/>
                                  }
                                  <input 
                                    value={listItem} 
                                    onChange={(e) => updateListItem(sIdx, iIdx, listIdx, e.target.value)} 
                                    className="flex-1 text-sm border-b border-gray-100 focus:border-blue-300 outline-none" 
                                    placeholder="List item"
                                  />
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
                            <input placeholder="URL[](https://...)" value={item.data.url} onChange={(e)=>updateItemData(sIdx, iIdx, 'url', e.target.value)} className="w-full text-sm text-blue-600 outline-none border-b"/>
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
                      <SmallToolBtn icon={<Circle size={14}/>} label="Bullet List" onClick={()=>addItemToSection('list')}/>
                      <SmallToolBtn icon={<CheckCircle size={14}/>} label="Check List" onClick={()=>addItemToSection('checklist')}/>
                      <SmallToolBtn icon={<Quote size={14}/>} label="Quote" onClick={()=>addItemToSection('quote')}/>
                      <SmallToolBtn icon={<Link size={14}/>} label="Button" onClick={()=>addItemToSection('button')}/>
                      <SmallToolBtn icon={<ChevronDown size={14}/>} label="Accordion" onClick={()=>addItemToSection('accordion')}/>
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
              Publish Blog Post
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