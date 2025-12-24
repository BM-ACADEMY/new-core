import React, { useState } from "react";
import BlogCreate from "./Blog";
import BlogList from "./BlogList";
import { PlusCircle, List } from "lucide-react";

const BlogMain = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [editingBlog, setEditingBlog] = useState(null); // Track blog being edited

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setActiveTab("create");
  };

  const handleCreateNew = () => {
    setEditingBlog(null);
    setActiveTab("create");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Blog Management</h1>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={handleCreateNew}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === "create" ? "bg-white shadow text-blue-600 font-bold" : "text-gray-500"
            }`}
          >
            <PlusCircle size={18} /> {editingBlog ? "Editing Mode" : "Create New"}
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === "list" ? "bg-white shadow text-blue-600 font-bold" : "text-gray-500"
            }`}
          >
            <List size={18} /> All Blogs
          </button>
        </div>
      </div>

      <div>
        {activeTab === "create" && (
          <BlogCreate 
            editingBlog={editingBlog} 
            switchToView={() => setActiveTab("list")} 
          />
        )}
        {activeTab === "list" && <BlogList onEdit={handleEdit} />}
      </div>
    </div>
  );
};

export default BlogMain;