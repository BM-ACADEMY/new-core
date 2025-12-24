import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import axiosInstance from "@/api/axiosInstance.jsx";
import { Loader, Bookmark } from "lucide-react";
import logo from "@/assets/logo/logo1.png"

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axiosInstance.get("/blogs");
        setBlogs(res.data);
      } catch (error) {
        console.error("Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader className="animate-spin text-indigo-600" size={40} />
      </div>
    );

  return (
    <div className="bg-[#F3F4F6] min-h-screen pt-[70px]">
      <div className="bg-gradient-to-r from-[#7e57ff] to-[#55a8ff] py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-3">Blog Standard</h1>
        <div className="flex justify-center items-center gap-2 text-sm">
          <Link to="/" className="opacity-80 hover:opacity-100">Home</Link>
          <span>→</span>
          <span className="font-semibold">Blog</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            /* --- THE FULL CARD IS NOW A LINK --- */
            <Link
              to={`/blog/${blog.slug}`}
              key={blog._id}
              className="bg-white rounded-[24px] border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
            >
              {/* Image Section */}
              <div className="p-4 pb-0">
                <div className="overflow-hidden rounded-[20px]">
                  <img
                    src={
                      blog.coverImage?.url?.startsWith("http")
                        ? blog.coverImage.url
                        : `${import.meta.env.VITE_SERVER_URL}${blog.coverImage?.url}`
                    }
                    alt={blog.title}
                    className="w-full aspect-[16/10] object-cover transition-transform duration-500"
                    
                  />
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 pt-5 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  
                    <span className="bg-[#f0f2f5] text-[#6b7280] text-[12px] font-medium px-4 py-1 rounded-full">
                       {blog.category}
                    </span>
                 
                  
                </div>

                {/* Title (Removed internal Link to avoid nested <a> tags) */}
                <h3 className="text-[20px] font-bold text-[#1a1a1a] leading-tight mb-3 line-clamp-2 group-hover:text-[#7e57ff] transition-colors">
                  {blog.title}
                </h3>

                <p className="text-[#6b7280] text-[14px] leading-relaxed mb-6 line-clamp-3">
                  {blog.description || "No description provided for this blog post."}
                </p>

                {/* Footer Section */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ecb812] flex items-center justify-center text-white font-bold text-sm uppercase">
                      <img src={logo} alt="logo"/>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#1a1a1a]">
                       Core Talents
                      </span>
                      <span className="text-[12px] text-gray-400">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Bookmark Button (Prevents card click) */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault(); // Prevents following the Link
                      e.stopPropagation(); // Prevents the click from bubbling up to the Link
                      console.log("Bookmarked!");
                    }}
                    className="text-gray-300 hover:text-[#7e57ff] transition-colors relative z-10"
                  >
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogList;