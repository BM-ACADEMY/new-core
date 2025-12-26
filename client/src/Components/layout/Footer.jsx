import React, { useState } from 'react';
import { Facebook, Linkedin, Youtube, Instagram, X, Download, User, Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Footeriamge from "@/assets/vector/footer.png";
import BrochurePDF from "@/assets/ct.pdf"; // Ensure path is correct

// ==========================================
// 1. NAVIGATION DATA
// ==========================================
const navItems = [
  { title: 'Home', to: '/' },
  { title: 'About', to: '/about' },
  {
    title: 'Services',
    to: '/services',
    dropdownLinks: [
      { to: '/services#ai-advantage', label: 'AI Advantage' },
      { to: '/services#industries',   label: 'Industries We Serve' },
    ],
  },
  { title: 'Blog', to: '/blog' },
  { title: 'Contact', to: '/contact' },
  { title: 'Privacy Policy', to: '/privacy-policy' },
];

// ==========================================
// 2. BROCHURE MODAL (Glassmorphism Design)
// ==========================================
const BrochureModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Invalid email";
    if (!purpose.trim()) newErrors.purpose = "Purpose is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("purpose", purpose);

      // Submit to Google Sheets
      await fetch(
        "https://script.google.com/macros/s/AKfycbzvjtdmWY4p8qhftceu2NtrsnaN2BZK9SjMwUC9jTs_Zs9txVfqn2qcFtK7cV6YksTSvw/exec",
        { method: "POST", mode: "no-cors", body: form }
      );

      // Submit to backend
      const emailResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, purpose }),
      });

      if (!emailResponse.ok) throw new Error("Email failed");

      toast.success("Brochure downloading...");
      const link = document.createElement("a");
      link.href = BrochurePDF;
      link.download = "coretalents_companyprofile_Brochure.pdf";
      link.click();
      
      setTimeout(() => {
          onClose();
          setName(""); setEmail(""); setPurpose("");
      }, 1000);

    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 sm:p-8"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
  
            <h2 className="mb-5 text-2xl font-bold text-gray-900">
              Download Brochure
            </h2>
  
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f0b104] ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
  
              {/* Email */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f0b104] ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
  
              {/* Purpose */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Purpose for downloading</label>
                <textarea
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f0b104] ${
                    errors.purpose ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
              </div>
  
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-[#f0b104] rounded-md hover:bg-[#d89a03] transition disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : <><Download className="w-5 h-5" /> Download</>}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
  );
};

// ==========================================
// 3. MAIN FOOTER COMPONENT
// ==========================================
const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  // Filter links for Columns
  const servicesItem = navItems.find(item => item.title === 'Services');
  const serviceLinks = servicesItem ? servicesItem.dropdownLinks : [];
  
  // Quick Links: Everything except Services
  const companyLinks = navItems.filter(item => item.title !== 'Services');

  return (
    <>
      <footer className="bg-[#050505] text-[#8a8a9e] pt-16 pb-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* 1. BRAND COLUMN (4 cols) */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2 mb-6">
                <img src={Footeriamge} alt="BMTechx.in Logo" className="w-72 object-contain" />
              </div>
              <p className="text-sm leading-relaxed mb-8 max-w-xs">
                Core Talents – AI-powered recruitment with 48-hour delivery, 95% fit rate, and hire-first-pay-later model. Trusted by 25+ corporates.
              </p>
              <div className="flex gap-4">
                <SocialIcon icon={<Facebook size={18} />} href="https://facebook.com" />
                <SocialIcon icon={<Instagram size={18} />} href="https://instagram.com" />
                <SocialIcon icon={<Linkedin size={18} />} href="https://linkedin.com" />
                <SocialIcon icon={<Youtube size={18} />} href="https://youtube.com" />
              </div>
            </div>

            {/* LINKS WRAPPER (8 cols) */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row gap-12 sm:gap-20 lg:justify-end">
              
              {/* 2. COMPANY / QUICK LINKS COLUMN */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-6 relative inline-block group">
                  Usefull Links
                  <span className="absolute -bottom-2 left-0 w-6 h-[3px] bg-[#5D5FEF] rounded-full"></span>
                  <span className="absolute -bottom-2 left-8 w-2 h-[3px] bg-[#5D5FEF] rounded-full animate-move-line"></span>
                </h3>
                <ul className="space-y-4">
                  {companyLinks.map((item) => (
                    <li key={item.title}>
                      <Link 
                        to={item.to} 
                        className="text-sm hover:text-[#5D5FEF] transition-colors duration-200 block transform hover:translate-x-1 transition-transform"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                  {/* Brochure Button Link */}
                  <li>
                    {/* <button
                      onClick={() => setModalOpen(true)}
                      className="text-sm text-[#8a8a9e] hover:text-[#f0b104] transition-colors duration-200 block transform hover:translate-x-1 transition-transform text-left"
                    >
                      Brochure
                    </button> */}
                  </li>
                </ul>
              </div>

              {/* 3. SERVICES COLUMN */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-6 relative inline-block group">
                  Services
                  <span className="absolute -bottom-2 left-0 w-6 h-[3px] bg-[#5D5FEF] rounded-full"></span>
                  <span className="absolute -bottom-2 left-8 w-2 h-[3px] bg-[#5D5FEF] rounded-full animate-move-line"></span>
                </h3>
                <ul className="space-y-4">
                  {serviceLinks.map((item) => (
                    <li key={item.label}>
                      <Link 
                        to={item.to} 
                        className="text-sm hover:text-[#5D5FEF] transition-colors duration-200 block transform hover:translate-x-1 transition-transform"
                      >
                        {item.label}
                        
                      </Link>
                       {/* <button
                      onClick={() => setModalOpen(true)}
                      className="text-sm text-[#8a8a9e] hover:text-[#f0b104] transition-colors duration-200 block transform hover:translate-x-1 transition-transform text-left"
                    >
                      Brochure
                    </button> */}
                    </li>
                  ))}
                   <button
                      onClick={() => setModalOpen(true)}
                      className="text-sm text-[#8a8a9e] hover:text-[#f0b104] transition-colors duration-200 block transform hover:translate-x-1 transition-transform text-left"
                    >
                      Brochure
                    </button>
                </ul>
              </div>

            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-[#8a8a9e]">
              Copyright © {currentYear} <a href='https://bmtechx.in' target='_blank' rel="noreferrer" className="text-[#ebdc0c]">BMTechx.in</a>. All Rights Reserved.
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes move-line {
            0%   { left: 8px;  opacity: 0; }
            50%  { left: 24px; opacity: 1; }
            100% { left: 40px; opacity: 0; }
          }
          .animate-move-line {
            animation: move-line 2s infinite ease-in-out;
          }
        `}</style>
      </footer>

      {/* RENDER MODAL */}
      <BrochureModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

const SocialIcon = ({ icon, href, title }) => (
  <a
    href={href || "#"}
    target="_blank"
    rel="noopener noreferrer"
    title={title}
    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-[#ffc700] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
  >
    {icon}
  </a>
);

export default Footer;