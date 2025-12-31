import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { 
  ChevronLeft, ChevronRight, Download, Save, Loader2,
  LayoutTemplate, Palette, Upload, Mail, Phone, MapPin, 
  Linkedin, Globe, Briefcase, GraduationCap, FolderGit2, 
  Wand2, Plus, Trash2, X
} from 'lucide-react';

// --- Custom Utilities ---
// Ensure these paths match your project structure
import axiosInstance from '@/api/axiosInstance'; 
import { showToast } from '@/utils/customToast'; 

// --- Types & Initial State ---
const INITIAL_STATE = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    profession: '',
    linkedin: '',
    website: '',
    image: null 
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: []
};

const STEPS = [
  { id: 'personal', title: 'Personal Information' },
  { id: 'summary', title: 'Professional Summary' },
  { id: 'experience', title: 'Professional Experience' },
  { id: 'education', title: 'Education' },
  { id: 'projects', title: 'Projects' },
  { id: 'skills', title: 'Skills' }
];

export default function ResumeBuilder() {
  const { id } = useParams(); // Get the Resume ID from the URL
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState(INITIAL_STATE);
  const [activeColor, setActiveColor] = useState('#3b82f6');
  
  // --- Refs & State for API/PDF ---
  const resumePreviewRef = useRef(null); 
  const [imageFile, setImageFile] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // --- 1. Fetch Resume on Mount ---
  useEffect(() => {
    const fetchResume = async () => {
      setIsLoading(true);
      try {
        // If ID exists in URL, fetch that specific resume.
        // Otherwise, fall back to 'me' (though Dashboard flow usually provides an ID now)
        const endpoint = id ? `/resume/${id}` : '/resume/me';
        
        const res = await axiosInstance.get(endpoint);
        
        // Handle potentially different response structures ({data: ...} vs direct object)
        const fetchedData = res.data.data || res.data;

        if (fetchedData) {
          setResumeData(prev => ({
            ...prev,
            ...fetchedData,
            // Merge personalInfo carefully to avoid overwriting with nulls
            personalInfo: { ...prev.personalInfo, ...(fetchedData.personalInfo || {}) }
          }));
          
          if (fetchedData.themeColor) setActiveColor(fetchedData.themeColor);
        }
      } catch (error) {
        // If it's a 404 and we have an ID, that's an error. 
        // If no ID and 404, it might just be a new user (handled by default state).
        if (id && error.response?.status === 404) {
             showToast("error", "Resume not found");
        } else if (error.response?.status !== 404) {
             console.error("Error fetching resume", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  // --- 2. Save Logic ---
  const handleSaveToBackend = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      // If we have an ID from URL, send it so backend knows which doc to update
      if (id) formData.append("resumeId", id);

      // Append Image if a new one was selected
      if (imageFile) formData.append("resumeImage", imageFile);

      // Stringify complex objects for FormData
      formData.append("personalInfo", JSON.stringify(resumeData.personalInfo));
      formData.append("experience", JSON.stringify(resumeData.experience));
      formData.append("education", JSON.stringify(resumeData.education));
      formData.append("projects", JSON.stringify(resumeData.projects));
      formData.append("skills", JSON.stringify(resumeData.skills));
      
      formData.append("summary", resumeData.summary || "");
      formData.append("themeColor", activeColor);

      const res = await axiosInstance.post('/resume/save', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Update state with returned data (useful if backend sanitized something)
      const savedData = res.data.data || res.data;
      setResumeData(prev => ({ ...prev, ...savedData }));
      
      setImageFile(null); 
      setLastSaved(new Date());
      showToast("success", "Resume saved successfully!");
    } catch (error) {
      console.error("Error saving resume:", error);
      showToast("error", error.response?.data?.message || "Failed to save resume.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. PDF Download Logic (html2pdf) ---
  const handleDownloadPDF = () => {
    const element = resumePreviewRef.current;
    
    const opt = {
      margin:       0,
      filename:     `${resumeData.personalInfo.fullName || 'Resume'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setIsDownloading(true);
    showToast("info", "Generating PDF...");
    
    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
            showToast("success", "PDF downloaded!");
        }).catch(err => {
            console.error("PDF Generation Error:", err);
            setIsDownloading(false);
            showToast("error", "Failed to generate PDF.");
        });
    }, 100);
  };

  // --- Form Handlers ---
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
          showToast("warn", "Image size should be less than 2MB");
          return;
      }
      setImageFile(file); // For backend upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, image: reader.result } // For preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSummaryChange = (e) => setResumeData(prev => ({ ...prev, summary: e.target.value }));

  const addItem = (section, initialItem) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], { id: Date.now(), ...initialItem }]
    }));
  };

  const updateItem = (section, id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const deleteItem = (section, id) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  const [skillInput, setSkillInput] = useState('');
  
  const addSkill = () => {
    if (skillInput.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, { id: Date.now(), name: skillInput.trim() }]
      }));
      setSkillInput('');
    }
  };

  const deleteSkill = (id) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  // --- Render Functions ---

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
              <p className="text-slate-500 text-sm">Get started with the personal information</p>
            </div>

            <div className="relative group w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors overflow-hidden">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {resumeData.personalInfo.image ? (
                <div className="relative w-full h-full">
                    <img 
                        src={resumeData.personalInfo.image} 
                        alt="Profile" 
                        className="w-full h-full object-contain" 
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="w-6 h-6 text-white" />
                    </div>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Upload user image (Max 2MB)</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <InputGroup label="Full Name" name="fullName" value={resumeData.personalInfo.fullName} onChange={handlePersonalInfoChange} required placeholder="John Doe" />
              <InputGroup label="Email Address" name="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} required placeholder="john@example.com" />
              <InputGroup label="Phone Number" name="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="+1 234 567 890" />
              <InputGroup label="Location" name="location" value={resumeData.personalInfo.location} onChange={handlePersonalInfoChange} placeholder="New York, NY" />
              <InputGroup label="Profession" name="profession" value={resumeData.personalInfo.profession} onChange={handlePersonalInfoChange} placeholder="Software Engineer" />
              <InputGroup label="LinkedIn Profile" name="linkedin" value={resumeData.personalInfo.linkedin} onChange={handlePersonalInfoChange} placeholder="linkedin.com/in/johndoe" />
              <InputGroup label="Personal Website" name="website" value={resumeData.personalInfo.website} onChange={handlePersonalInfoChange} placeholder="johndoe.com" />
            </div>
          </div>
        );
      
      case 1: // Summary
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Professional Summary</h2>
                <p className="text-slate-500 text-sm">Add summary for your resume here</p>
              </div>
              <button 
                className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-100 transition-colors"
                onClick={() => showToast("info", "AI Enhance feature coming soon!")}
              >
                <Wand2 className="w-3 h-3" /> AI Enhance
              </button>
            </div>
            <div className="relative">
              <textarea
                value={resumeData.summary}
                onChange={handleSummaryChange}
                className="w-full h-48 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 bg-white"
                placeholder="Write a compelling professional summary..."
              />
            </div>
          </div>
        );

      case 2: // Experience
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Professional Experience</h2>
              </div>
              <button 
                onClick={() => addItem('experience', { company: '', title: '', startDate: '', endDate: '', current: false, description: '' })}
                className="flex items-center gap-2 text-green-600 border border-green-200 bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>

            {resumeData.experience.length === 0 ? (
               <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No work experience added yet.</p>
               </div>
            ) : (
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                    <button onClick={() => deleteItem('experience', exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-slate-700 mb-4">Experience #{index + 1}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <InputGroup label="Company Name" value={exp.company} onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)} />
                      <InputGroup label="Job Title" value={exp.title} onChange={(e) => updateItem('experience', exp.id, 'title', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <InputGroup type="month" label="Start Date" value={exp.startDate} onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)} />
                      <div className="flex flex-col gap-2">
                        <InputGroup 
                          type="month" 
                          label="End Date" 
                          value={exp.endDate} 
                          disabled={exp.current}
                          onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)} 
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mt-1">
                          <input 
                            type="checkbox" 
                            checked={exp.current} 
                            onChange={(e) => updateItem('experience', exp.id, 'current', e.target.checked)}
                            className="rounded text-blue-500 focus:ring-blue-500" 
                          />
                          Currently working here
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">Job Description</label>
                      <textarea 
                        value={exp.description} 
                        onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                        placeholder="Describe your key responsibilities..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3: // Education
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Education</h2>
              </div>
              <button 
                onClick={() => addItem('education', { school: '', degree: '', field: '', date: '', gpa: '' })}
                className="flex items-center gap-2 text-green-600 border border-green-200 bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>

            {resumeData.education.length === 0 ? (
               <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No education added yet.</p>
               </div>
            ) : (
              <div className="space-y-6">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                    <button onClick={() => deleteItem('education', edu.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-slate-700 mb-4">Education #{index + 1}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <InputGroup label="Institution Name" value={edu.school} onChange={(e) => updateItem('education', edu.id, 'school', e.target.value)} />
                      <InputGroup label="Degree" placeholder="e.g. Bachelor's" value={edu.degree} onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <InputGroup label="Field of Study" value={edu.field} onChange={(e) => updateItem('education', edu.id, 'field', e.target.value)} />
                      <InputGroup type="month" label="Graduation Date" value={edu.date} onChange={(e) => updateItem('education', edu.id, 'date', e.target.value)} />
                    </div>
                      <InputGroup label="GPA (Optional)" value={edu.gpa} onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4: // Projects
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Projects</h2>
              </div>
              <button 
                onClick={() => addItem('projects', { name: '', type: '', description: '' })}
                className="flex items-center gap-2 text-green-600 border border-green-200 bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            {resumeData.projects.length === 0 ? (
               <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No projects added yet.</p>
               </div>
            ) : (
              <div className="space-y-6">
                {resumeData.projects.map((proj, index) => (
                  <div key={proj.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                    <button onClick={() => deleteItem('projects', proj.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-slate-700 mb-4">Project #{index + 1}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <InputGroup label="Project Name" value={proj.name} onChange={(e) => updateItem('projects', proj.id, 'name', e.target.value)} />
                      <InputGroup label="Project Type" placeholder="e.g. Web App" value={proj.type} onChange={(e) => updateItem('projects', proj.id, 'type', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <textarea 
                        value={proj.description} 
                        onChange={(e) => updateItem('projects', proj.id, 'description', e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                        placeholder="Describe your project..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5: // Skills
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Skills</h2>
              <p className="text-slate-500 text-sm">Add your technical and soft skills</p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <InputGroup 
                  label="" 
                  value={skillInput} 
                  onChange={(e) => setSkillInput(e.target.value)} 
                  placeholder="Enter a skill (e.g. JavaScript)"
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
              </div>
              <button 
                onClick={addSkill}
                className="mt-2 h-[42px] px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {resumeData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-4 border border-slate-200 rounded-lg bg-slate-50">
                {resumeData.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-sm text-slate-700">
                    <span>{skill.name}</span>
                    <button onClick={() => deleteSkill(skill.id)} className="text-slate-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-sm">
                No skills added yet.
              </div>
            )}
          </div>
        );
      
      default: return null;
    }
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-slate-600 font-medium">Loading your resume...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen pt-32 bg-slate-100 font-sans text-slate-900 print:bg-white print:text-black">

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-65px)]">
        
        {/* Left Column: Form Editor */}
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
               <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100">
                    <LayoutTemplate className="w-4 h-4" /> Template
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-medium transition-colors">
                    <Palette className="w-4 h-4" /> Accent
                 </button>
               </div>

               {/* SAVE BUTTON */}
               <div className="flex items-center gap-4">
                   {lastSaved && <span className="text-xs text-slate-400">Saved: {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                   <button 
                       onClick={handleSaveToBackend} 
                       disabled={isSaving}
                       className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium border border-green-200 transition-colors disabled:opacity-50"
                   >
                       {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                       {isSaving ? "Saving..." : "Save"}
                   </button>
               </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {renderStepContent()}
            </div>

            {/* Bottom Actions */}
            <div className="px-8 py-5 border-t border-slate-100 flex justify-between bg-white">
                {currentStep > 0 ? (
                  <button 
                    onClick={prevStep}
                    className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                ) : <div></div>}

                <div className="flex gap-3">
                   {/* ACTION BUTTONS */}
                   <div className="flex gap-2">
                       {/* Download PDF (Image based) */}
                       <button 
                           onClick={handleDownloadPDF}
                           disabled={isDownloading}
                           className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-70"
                       >
                           {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />} 
                           {isDownloading ? "Generating..." : "PDF"}
                       </button>

                   </div>
                   
                   {currentStep < STEPS.length - 1 && (
                     <button 
                       onClick={nextStep}
                       className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                     >
                       Next <ChevronRight className="w-4 h-4" />
                     </button>
                   )}
                </div>
            </div>
        </div>

        {/* Right Column: Live Preview & Print View */}
        <div className="bg-slate-100 rounded-xl flex items-start justify-center overflow-y-auto p-4 lg:p-8 print:p-0 print:bg-white print:items-start print:w-full print:h-auto print:overflow-visible custom-scrollbar">
           
           {/* A4 Resume Paper */}
           <div 
             ref={resumePreviewRef} // <--- REF FOR HTML2PDF
             // IMPORTANT: Force HEX colors via inline styles to fix "oklch" error in html2canvas
             style={{ 
               backgroundColor: '#ffffff', // FORCE HEX
               color: '#1e293b',          // FORCE HEX (slate-800)
               backgroundImage: 'linear-gradient(to bottom, transparent 296mm, dashed 1px #cbd5e1 296mm, transparent 297mm)',
               backgroundSize: '100% 297mm', 
               borderTop: `6px solid ${activeColor}`
             }}
             className="w-full max-w-[210mm] min-h-[297mm] shadow-xl print:shadow-none flex flex-col print:w-full print:max-w-none print:min-h-0 relative"
           >
             <div className="p-[15mm] flex flex-col gap-6 h-full">

                 {/* Header (Never break inside) */}
                 <div className="flex justify-between items-start border-b border-slate-100 pb-6 break-avoid">
                   <div className="flex-1">
                     <h1 className="text-4xl font-bold mb-2 uppercase tracking-tight" style={{ color: activeColor }}>
                       {resumeData.personalInfo.fullName || 'Your Name'}
                     </h1>
                     <p className="text-lg font-medium text-slate-600 mb-4">
                       {resumeData.personalInfo.profession || 'Professional Title'}
                     </p>
                     
                     <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500">
                         {resumeData.personalInfo.email && (
                           <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {resumeData.personalInfo.email}</div>
                         )}
                         {resumeData.personalInfo.phone && (
                           <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {resumeData.personalInfo.phone}</div>
                         )}
                         {resumeData.personalInfo.location && (
                           <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {resumeData.personalInfo.location}</div>
                         )}
                         {resumeData.personalInfo.linkedin && (
                           <div className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> {resumeData.personalInfo.linkedin}</div>
                         )}
                         {resumeData.personalInfo.website && (
                           <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {resumeData.personalInfo.website}</div>
                         )}
                     </div>
                   </div>
                   {resumeData.personalInfo.image && (
                     <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 ml-4 shrink-0">
                         <img src={resumeData.personalInfo.image} alt="Profile" className="w-full h-full object-cover" />
                     </div>
                   )}
                 </div>

                 {/* Summary */}
                 {resumeData.summary && (
                   <section className="break-avoid">
                     <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: activeColor }}>
                       Professional Summary
                     </h2>
                     <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{resumeData.summary}</p>
                   </section>
                 )}

                 {/* Experience */}
                 {resumeData.experience.length > 0 && (
                   <section>
                     <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: activeColor }}>
                       Professional Experience
                     </h2>
                     <div className="flex flex-col gap-5">
                         {resumeData.experience.map(exp => (
                           <div key={exp.id} className="break-avoid">
                              <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-slate-800">{exp.title || 'Job Title'}</h3>
                                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-slate-700 mb-2">{exp.company || 'Company Name'}</div>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                           </div>
                         ))}
                     </div>
                   </section>
                 )}

                 {/* Projects */}
                 {resumeData.projects.length > 0 && (
                   <section>
                     <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: activeColor }}>Projects</h2>
                     <div className="flex flex-col gap-4">
                         {resumeData.projects.map(proj => (
                           <div key={proj.id} className="break-avoid">
                              <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-slate-800">{proj.name || 'Project Name'}</h3>
                               </div>
                              {proj.type && <div className="text-xs font-medium text-slate-500 mb-1">{proj.type}</div>}
                              <p className="text-sm text-slate-600 leading-relaxed">{proj.description}</p>
                           </div>
                         ))}
                     </div>
                   </section>
                 )}

                 {/* Education */}
                 {resumeData.education.length > 0 && (
                   <section>
                     <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: activeColor }}>Education</h2>
                     <div className="flex flex-col gap-4">
                         {resumeData.education.map(edu => (
                           <div key={edu.id} className="break-avoid">
                              <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-slate-800">{edu.school || 'University Name'}</h3>
                                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{formatDate(edu.date)}</span>
                              </div>
                              <div className="text-sm text-slate-700">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                              {edu.gpa && <div className="text-xs text-slate-500 mt-1">GPA: {edu.gpa}</div>}
                           </div>
                         ))}
                     </div>
                   </section>
                 )}

                 {/* Skills */}
                 {resumeData.skills.length > 0 && (
                   <section className="break-avoid">
                     <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: activeColor }}>Core Skills</h2>
                     <div className="flex flex-wrap gap-x-1 text-sm text-slate-700">
                         {resumeData.skills.map((skill, index) => (
                           <span key={skill.id} className="inline-block">
                             • {skill.name}
                             {index !== resumeData.skills.length - 1 && <span className="mr-1"></span>}
                           </span>
                         ))}
                     </div>
                   </section>
                 )}

             </div>
           </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          
          /* Prevent items from being cut in half */
          .break-avoid { page-break-inside: avoid; break-inside: avoid; }
          section { page-break-inside: auto; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Helper Components
function InputGroup({ label, name, value, onChange, placeholder, type = "text", required = false, disabled = false, onKeyDown }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 flex">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ''} 
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={onKeyDown}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-white disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-400"
      />
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}