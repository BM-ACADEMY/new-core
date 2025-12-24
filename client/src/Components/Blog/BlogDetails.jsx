// BlogDetails.jsx - FULL UPDATED FILE
// Fixes:
// 1. List heading now displays properly (with first word bold if needed)
// 2. Lists are displayed in clean 2-column grid
// 3. Bullet/Check icons aligned properly
// 4. Heading appears above the list items

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  MessageCircle,
  Calendar,
  User,
  CheckCircle,
  Clock,
  X,
  Loader,
  Tag,
  ArrowRight,
  ArrowUpRight,
  Plus,
  ChevronDown,
} from "lucide-react";
import { FaQuoteLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import axiosInstance from "@/api/axiosInstance.jsx";
import Logo from "@/assets/logo/logo1.png";

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    course: "General Inquiry",
    location: "Pondicherry",
  });

  const whatsappUrl = "https://wa.me/919944940051?text=Hi%20BM%20Academy...";

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axiosInstance.get(`/blogs/${slug}`);
        setBlog(res.data);
      } catch (error) {
        console.error("Blog not found");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const message = `*New Counseling Request*\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Course:* ${formData.course}\n*Location:* ${formData.location}\n\nFrom Blog: ${blog.title}`;
    window.open(
      `https://wa.me/919944940051?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    setIsModalOpen(false);
  };

  // Helper: Format heading - first word extra bold
  const formatListHeading = (text) => {
    if (!text || text.trim() === "") return null;
    const words = text.trim().split(" ");
    const firstWord = words[0];
    const rest = words.slice(1).join(" ");
    return (
      <h3 className="text-xl font-bold text-gray-700 mb-0">
        <span className="font-bold">{firstWord}</span>
        {rest && ` ${rest}`}
      </h3>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-blue-600" size={56} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Blog Not Found
          </h2>
          <Link to="/blog" className="text-blue-600 hover:underline">
            ← Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title}</title>
        <meta name="description" content={blog.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
              </li>
              <li>
                <Link to="/blog" className="hover:text-blue-600 transition">
                  Blog
                </Link>
              </li>
              <li>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium truncate max-w-xs">
                {blog.title}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <main className="lg:col-span-8">
              <header className="mb-10">
                {blog.category && (
                  <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6 shadow-sm">
                    <Tag size={13} className="text-indigo-400" />
                    {blog.category}
                  </div>
                )}
                <h1 className="text-4xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                  {blog.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-indigo-500" />
                    <span className="font-medium">Kamarudeen BM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-500" />
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </header>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 rounded-2xl overflow-hidden shadow-2xl"
              >
                <img
                  src={
                    blog.coverImage.url.startsWith("http")
                      ? blog.coverImage.url
                      : `${import.meta.env.VITE_SERVER_URL}${
                          blog.coverImage.url
                        }`
                  }
                  alt={blog.title}
                  className="w-full h-96 md:h-[500px] object-cover"
                />
              </motion.div>

              <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {blog.contentBlocks.map((block, index) => (
                  <div key={index}>
                    {block.type === "heading" && (
                      <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
                        {block.data.text}
                      </h2>
                    )}

                    {block.type === "paragraph" && (
                      <p className="text-lg leading-8 text-gray-700 mb-6">
                        {block.data.text}
                      </p>
                    )}

                    {block.type === "image" && block.data.url && (
                      <div className="my-10">
                        <img
                          src={block.data.url}
                          alt="Content"
                          className="w-full rounded-2xl shadow-lg"
                        />
                      </div>
                    )}

                    {/* UPDATED LIST BLOCK */}
                    {block.type === "list" && (
                      <div className="my-6">
                        {/* Optional Heading with first word bold */}
                        {block.data.heading &&
                          formatListHeading(block.data.heading)}

                        {/* 2-Column Grid List - Single Column on Mobile */}
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-1 gap-y-6 bg-gray-50 p-8 rounded-2xl list-none">
                          {block.data.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-4">
                              {block.data.listType === "checklist" ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                              ) : (
                                <div className="w-2 h-2 bg-gray-700 rounded-full flex-shrink-0 mt-3" />
                              )}
                              <span className="text-md font-medium text-gray-800 leading-relaxed">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {block.type === "quote" && (
                      <div className="relative my-8 group">
                        <div className="absolute -top-5 -left-2 z-10 bg-gray-50 px-2">
                          <FaQuoteLeft className="text-[#6366f1] text-3xl md:text-4xl" />
                        </div>
                        <div className="pt-10 pb-8 pl-10 pr-8 border border-gray-300 rounded-tr-3xl rounded-b-3xl rounded-bl-3xl">
                          <p className="text-xl md:text-2xl font-semibold text-gray-800 leading-snug">
                            {block.data.text}
                          </p>
                          {block.data.author && (
                            <footer className="mt-6 flex items-center gap-3">
                              <div className="w-10 h-[2px] bg-[#6366f1]"></div>
                              <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
                                {block.data.author}
                              </span>
                            </footer>
                          )}
                        </div>
                      </div>
                    )}

                    {block.type === "button" && (
                      <div className="text-center my-12">
                        <motion.a
                          href={block.data.url || "#"}
                          target="_blank"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative inline-flex items-center group overflow-hidden bg-indigo-600 text-white 
                 px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-4 
                 rounded-full font-bold 
                 text-sm sm:text-base md:text-lg lg:text-xl 
                 shadow-lg transition-all duration-300"
                        >
                          {/* Hover Gradient Overlay */}
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-700 to-indigo-800 transition-transform duration-300 ease-out transform translate-x-full group-hover:translate-x-0"></span>

                          {/* Button Text */}
                          <span className="relative">{block.data.text}</span>
                        </motion.a>
                      </div>
                    )}

                    {block.type === "accordion" && (
                      <div className="my-6">
                        <motion.div
                          layout
                          className={`overflow-hidden transition-all duration-300 border rounded-[2rem] ${
                            openAccordion === index
                              ? "bg-white border-blue-600 shadow-md"
                              : "bg-white border-slate-300 hover:border-blue-400"
                          }`}
                        >
                          <button
                            onClick={() =>
                              setOpenAccordion(
                                openAccordion === index ? null : index
                              )
                            }
                            className="w-full flex items-center justify-between px-8 py-6 text-left outline-none"
                          >
                            <span
                              className={`text-lg md:text-xl font-semibold tracking-tight transition-colors duration-300 ${
                                openAccordion === index
                                  ? "text-blue-700"
                                  : "text-slate-800"
                              }`}
                            >
                              {block.data.title}
                            </span>

                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ${
                                openAccordion === index
                                  ? "bg-blue-600 text-white rotate-45"
                                  : "text-blue-600"
                              }`}
                            >
                              <Plus size={24} strokeWidth={2.5} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {openAccordion === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.3,
                                  ease: "easeInOut",
                                }}
                              >
                                <div className="px-8 pb-8">
                                  <div className="h-[1px] w-full bg-slate-100 mb-6" />
                                  <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                                    {block.data.content}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    )}
                  </div>
                ))}
              </article>

              {/* CTA Section */}
              {/* <section className="mt-20 p-10 md:p-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-[2.5rem] text-center text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                    Ready to Transform Your Career?
                  </h2>
                  <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                    Join thousands of students who have launched successful
                    careers with BM Academy.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <motion.button
                      onClick={toggleModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-indigo-700 px-10 py-5 rounded-full font-bold text-lg shadow-xl"
                    >
                      Free Career Counseling
                    </motion.button>
                    <motion.a
                      href={whatsappUrl}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-500 text-white px-10 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-xl"
                    >
                      <MessageCircle size={24} /> Chat on WhatsApp
                    </motion.a>
                  </div>
                </div>
              </section> */}
              <div class="mt-12 p-10 bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-800 rounded-3xl text-white text-center shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    class="absolute w-full h-full"
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width="8"
                        height="8"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 8 0 L 0 0 0 8"
                          fill="none"
                          stroke="white"
                          stroke-width="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                <h2 class="text-3xl md:text-4xl font-extrabold mb-6 relative z-10 leading-tight">
                  Ready to unlock your business’s growth potential?
                </h2>
                <p class="mb-8 text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed relative z-10">
                  Discover actionable insights and personalized strategies to
                  boost your leads and sales. Get a Free Business Audit from BM
                  Techx today!
                </p>

                <div class="flex flex-col md:flex-row justify-center gap-4 relative z-10">
                  <a
                    href="https://docs.google.com/forms/d/1BldHNK6GDfqUA_JhRjt68XxsNiwQWFsUTXLJmhfVGiQ/edit"
                    target="_blank"
                    class="inline-flex justify-center items-center bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all transform hover:-translate-y-1 shadow-[0_4px_14px_0_rgba(234,179,8,0.39)]"
                  >
                    <i data-lucide="rocket" class="w-6 h-6 mr-2"></i>
                    Take your Free Business Audit now
                  </a>
                </div>
              </div>
            </main>

            {/* Sidebar remains unchanged */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                {/* About Card */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
                    About Core Talents
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center overflow-hidden bg-white shadow-sm">
                      <img
                        src={Logo}
                        alt="Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <h4 className="text-xl font-extrabold text-gray-900">
                      Core Talents
                    </h4>
                  </div>
                  <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                    Core Talents – AI-powered recruitment with 48-hour delivery,
                    95% fit rate, and hire-first-pay-later model. Trusted by 25+
                    corporates across India & GCC.
                  </p>
                  <hr className="border-gray-100 mb-6" />
                  <div className="flex flex-wrap gap-2">
                    {[
                      "#Recruitment",
                      "#AIHiring",
                      "#TalentAcquisition",
                      "#BusinessGrowth",
                      "#IndiaHiring",
                      "#CoreTalents",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-1.5 bg-gray-50 text-gray-500 text-xs font-medium rounded-full border border-gray-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Consultation Card */}
                <div className="bg-[#f0fdf4] rounded-[2rem] p-8 border border-green-100 shadow-sm">
                  <h3 className="text-xl font-bold text-[#166534] mb-3">
                    Need a Consultation?
                  </h3>
                  <p className="text-[#166534]/80 text-[15px] leading-relaxed mb-8">
                    Have questions about how we can help your specific business?
                    Let's chat!
                  </p>
                  <button
                    onClick={toggleModal}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    <MessageCircle
                      size={22}
                      fill="currentColor"
                      className="text-white"
                    />
                    Connect on WhatsApp
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleModal}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden relative z-10"
              >
                <div className="bg-indigo-600 p-8 text-white">
                  <button
                    onClick={toggleModal}
                    className="absolute top-6 right-6 hover:rotate-90 transition-transform"
                  >
                    <X size={24} />
                  </button>
                  <h3 className="text-2xl font-bold">Free Counseling</h3>
                  <p className="opacity-80">We'll get back to you shortly</p>
                </div>
                <form onSubmit={handleFormSubmit} className="p-8 space-y-4">
                  <input
                    name="name"
                    required
                    placeholder="Name"
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    name="phone"
                    required
                    placeholder="Phone"
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
                  >
                    Submit Request
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BlogDetails;
