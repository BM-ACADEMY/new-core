import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance.jsx";
import { showToast } from "@/utils/customToast.jsx";
import { Loader, Trash2, Edit, AlertCircle } from "lucide-react";

const BlogList = ({ onEdit }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await axiosInstance.get("/blogs");
      setBlogs(res.data);
    } catch (error) {
      showToast("Failed to fetch blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog? This cannot be undone.")) return;

    try {
      await axiosInstance.delete(`/blogs/${id}`, { withCredentials: true });
      showToast("Blog deleted successfully", "success");
      setBlogs(blogs.filter(b => b._id !== id));
    } catch (error) {
      showToast("Error deleting blog", "error");
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  if (loading) return <div className="p-20 flex justify-center"><Loader className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
          <tr>
            <th className="p-4">Blog Info</th>
            <th className="p-4">Category</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {blogs.length === 0 ? (
            <tr><td colSpan="4" className="p-20 text-center text-gray-400">No blogs found. Start by creating one!</td></tr>
          ) : (
            blogs.map((blog) => (
              <tr key={blog._id} className="hover:bg-blue-50/30 transition">
                <td className="p-4 flex items-center gap-4">
                  <img 
                    src={blog.coverImage.url.startsWith('http') ? blog.coverImage.url : `${import.meta.env.VITE_SERVER_URL}${blog.coverImage.url}`} 
                    className="h-12 w-16 object-cover rounded shadow-sm bg-gray-100"
                    alt=""
                  />
                  <div>
                    <div className="font-bold text-gray-800">{blog.title}</div>
                    <div className="text-xs text-gray-400">{blog.slug}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">
                    {blog.category}
                  </span>
                </td>
                <td className="p-4 text-xs font-semibold text-green-600 capitalize">
                   {blog.status}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button 
                      onClick={() => onEdit(blog)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                    >
                      <Edit size={18}/>
                    </button>
                    <button 
                      onClick={() => handleDelete(blog._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BlogList;