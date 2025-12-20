import React, { useState, useEffect } from 'react';
import axiosInstance from "@/api/axiosInstance.jsx";
import { 
  X, 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

const ImageCard = ({ url, title, category, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [loaded, setLoaded] = useState(false);
  
    return (
      <div 
        className="group relative w-full rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick({ url, title, category })}
      >
        <div className="aspect-[4/3] overflow-hidden bg-slate-200 relative">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 animate-pulse">
              <ImageIcon size={32} />
            </div>
          )}
          <img
            src={url} 
            alt={title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <ZoomIn className="text-white" size={30} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-slate-800 truncate">
            {title}
          </h3>
        </div>
      </div>
    );
};

const GallerySection = () => {
  const [galleries, setGalleries] = useState([]); 
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const res = await axiosInstance.get("/gallery/all");
        
        // 1. Filter: Only keep galleries that are PUBLIC
        const publicGalleries = res.data.filter(gallery => gallery.isPublic === true);
        
        setGalleries(publicGalleries);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  // 2. Generate Categories
  const categories = [
    "All", 
    ...galleries
      .filter(g => g.showInTabs === true)
      .map(g => g.title)
  ];

  // 3. Image Logic
  let displayImages = [];

  if (activeCategory === "All") {
    galleries.forEach(gallery => {
      gallery.imagePaths.forEach(path => {
        displayImages.push({
          url: path,
          category: gallery.title,
          title: gallery.title,
          id: `${gallery._id}-${path}`
        });
      });
    });
  } else {
    const selectedGallery = galleries.find(g => g.title === activeCategory);
    if (selectedGallery) {
      selectedGallery.imagePaths.forEach(path => {
        displayImages.push({
          url: path,
          category: selectedGallery.title,
          title: selectedGallery.title,
          id: `${selectedGallery._id}-${path}`
        });
      });
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayImages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayImages.length / itemsPerPage);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-20">
      <header className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Inspiration Gallery</h1>
        <p className="text-slate-600">Browse our collection across different categories.</p>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {/* Dynamic Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.length > 1 ? (
            categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-transparent ring-2 ring-slate-900 ring-offset-2' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))
          ) : (
             categories.length === 1 && galleries.length > 0 ? (
                <button className="px-6 py-2 rounded-full text-sm font-medium bg-slate-900 text-white border-transparent ring-2 ring-slate-900 ring-offset-2">All</button>
             ) : (
                <div className="text-slate-500 italic">No public galleries available.</div>
             )
          )}
        </div>

        {/* Gallery Grid */}
        {displayImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item) => (
              <ImageCard 
                key={item.id} 
                url={item.url} 
                title={item.title} 
                category={item.category} 
                onClick={setSelectedItem} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">No images to display.</div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 border rounded-md disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronLeft />
            </button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 border rounded-md disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </main>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedItem(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"><X size={40}/></button>
          <img src={selectedItem.url} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" alt="Full view" />
        </div>
      )}
    </div>
  );
};

export default GallerySection;