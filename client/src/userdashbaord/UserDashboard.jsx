import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CloudUpload, FileText, Trash2, Edit, X, Loader2 } from "lucide-react";
import Navbar from "@/Components/layout/Navbar";
import { useAuth } from "@/Context/Authcontext";
import axiosInstance from "@/api/axiosInstance";
import { showToast } from "@/utils/customToast";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- State Management ---
  const [savedResumes, setSavedResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // --- Fetch Saved Resumes ---
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        // NOTE: Ensure your backend has an endpoint like GET /resume/all-my-resumes
        // If not, it might return just one object via /resume/me.
        // This code expects an Array.
        const res = await axiosInstance.get("/resume/all");
        if(res.data && res.data.data) {
           setSavedResumes(res.data.data); // Assuming response structure { data: [...] }
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleUploadUnavailable = () => {
  showToast("info", "currently unavailable");
};


  // --- Handle Create Resume (From Modal) ---
  const handleCreateResume = async () => {
    if (!resumeTitle.trim()) {
      showToast("error", "Please enter a resume name");
      return;
    }

    setIsCreating(true);
    try {
      // Create a new empty resume in backend
      const res = await axiosInstance.post("/resume/create", {
        title: resumeTitle,
        personalInfo: { fullName: user?.name || "" }
      });

      if (res.data && res.data.data._id) {
        showToast("success", "Resume created!");
        setIsModalOpen(false);
        // Navigate to builder with the new ID
        navigate(`/user/create-resume/${res.data.data._id}`);
      }
    } catch (error) {
      console.error("Creation error", error);
      showToast("error", "Failed to create resume");
    } finally {
      setIsCreating(false);
    }
  };

  // --- Handle Delete Resume ---
  const handleDeleteResume = async (id, e) => {
    e.stopPropagation(); // Prevent card click
    if(!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      await axiosInstance.delete(`/resume/${id}`);
      setSavedResumes(prev => prev.filter(r => r._id !== id));
      showToast("success", "Resume deleted");
    } catch (error) {
      showToast("error", "Failed to delete");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-32 pb-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <p className="text-gray-500 mt-2">Manage your professional resumes</p>
          </div>

          {/* Top Actions: Create & Upload */}
          <div className="flex flex-wrap justify-start items-start gap-8 mt-8">

            {/* CARD 1: Create Resume (Opens Modal) */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="group flex flex-col items-center justify-center w-64 h-64 p-8 bg-white rounded-3xl border-2 border-dashed border-indigo-200 cursor-pointer hover:border-indigo-500 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors text-center">
                Create New Resume
              </h3>
              <p className="text-xs text-gray-400 mt-2 text-center">Start from scratch</p>
            </div>

            {/* CARD 2: Upload Existing */}
            <div
              // onClick={() => navigate("/user/upload-resume")}
              onClick={handleUploadUnavailable}
              className="group flex flex-col items-center justify-center w-64 h-64 p-8 bg-white rounded-3xl border-2 border-dashed border-purple-200 cursor-pointer hover:border-purple-500 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <CloudUpload className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 group-hover:text-purple-600 transition-colors text-center">
                Upload Existing
              </h3>
              <p className="text-xs text-gray-400 mt-2 text-center">Edit your current resume</p>
            </div>
          </div>

          {/* --- Bottom Section: Saved Resumes --- */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" /> My Resumes
            </h2>

            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                 <Loader2 className="animate-spin w-5 h-5"/> Loading...
              </div>
            ) : savedResumes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {savedResumes.map((resume) => (
                  <div
                    key={resume._id}
                    onClick={() => navigate(`/user/create-resume/${resume._id}`)}
                    className="relative group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer hover:border-indigo-200"
                  >
                    {/* Visual Placeholder for Resume Preview */}
                    <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                       {resume.personalInfo?.image ? (
                         <img src={resume.personalInfo.image} alt="resume" className="w-full h-full object-cover opacity-80" />
                       ) : (
                         <FileText className="text-gray-300 w-12 h-12" />
                       )}
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800 truncate pr-2" title={resume.title || "Untitled"}>
                          {resume.title || resume.personalInfo?.fullName || "Untitled Resume"}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Edited: {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                           onClick={(e) => handleDeleteResume(resume._id, e)}
                           className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No saved resumes found. Create one above!</div>
            )}
          </div>

        </div>
      </div>

      {/* --- CREATE RESUME MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Name your Resume</h2>
            <p className="text-gray-500 mb-6 text-sm">Give your resume a name to help you identify it later.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume Name</label>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="e.g. Software Engineer Role, Google Application"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateResume}
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating ? "Creating..." : "Create Resume"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
