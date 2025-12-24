const BlogPost = require('../model/Blog'); // Adjust path to your Model
const fs = require('fs');
const path = require('path');

// --- 1. CREATE BLOG ---
// --- 1. CREATE BLOG (Updated) ---
// --- 1. CREATE BLOG (Updated for Category Robustness) ---
exports.createBlog = async (req, res) => {
  try {
    let { title, slug, description, contentBlocks, tags, category } = req.body;

    if (!req.file) return res.status(400).json({ message: "Cover image is required" });

    // Handle Category if it comes as a stringified object or a plain object
    let finalCategory = "Uncategorized";
    if (category) {
      try {
        // If it's a stringified JSON object, parse it
        const parsedCategory = typeof category === 'string' && category.startsWith('{') 
          ? JSON.parse(category) 
          : category;
        
        // Extract the name if it's an object, otherwise use the string
        finalCategory = typeof parsedCategory === 'object' ? parsedCategory.name : parsedCategory;
      } catch (e) {
        finalCategory = category; // Fallback to raw string
      }
    }

    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const coverImageUrl = `${serverUrl}/uploads/blog/${slug}/${req.file.filename}`;

    const newBlog = new BlogPost({
      title,
      slug,
      description,
      category: finalCategory, // Now guaranteed to be a string
      coverImage: {
        url: coverImageUrl,
        altText: title
      },
      contentBlocks: typeof contentBlocks === 'string' ? JSON.parse(contentBlocks) : contentBlocks,
      author: req.user.id, 
      tags: tags ? (tags.startsWith('[') ? JSON.parse(tags) : tags.split(',')) : [],
      status: 'published'
    });

    await newBlog.save();
    res.status(201).json({ success: true, message: "Blog published successfully!", data: newBlog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. UPLOAD IMAGE (Inside content) ---
exports.uploadContentImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Use the slug provided in the body, or fallback if none
    const folderSlug = req.body.slug || 'temp-uploads';
    
    // Construct the final URL
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${serverUrl}/uploads/blog/${folderSlug}/${req.file.filename}`;

    res.status(200).json({ 
      success: true, 
      url: imageUrl,
      message: "Image uploaded to specific blog folder" 
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// --- 3. GET ALL BLOGS (Prevents "handler is not a function" error) ---
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.find().populate('author', 'name email').sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

// --- 4. GET SINGLE BLOG ---
exports.getSingleBlog = async (req, res) => {
    try {
      const blog = await BlogPost.findOne({ slug: req.params.slug }).populate('author', 'name');
      if(!blog) return res.status(404).json({ message: "Not found" });
      res.status(200).json(blog);
    } catch (error) {
      res.status(500).json({ message: "Error fetching blog" });
    }
};

exports.deleteContentImage = async (req, res) => {
  try {
    const { imageUrl } = req.body; // Full URL sent from frontend

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // Extract filename from URL
    const urlParts = imageUrl.split('/uploads/blog/');
    if (urlParts.length < 2) {
      return res.status(400).json({ message: "Invalid image URL" });
    }

    const relativePath = urlParts[1]; // e.g., "my-slug/image-123.jpg"
    const filePath = path.join(__dirname, '../uploads/blog', relativePath);

    // Security: Prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(path.join(__dirname, '../uploads/blog'))) {
      return res.status(400).json({ message: "Invalid path" });
    }

    // Delete if exists
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
    }

    res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
};

// --- 5. UPDATE BLOG ---
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, slug, description, contentBlocks, tags, category } = req.body;

    const blog = await BlogPost.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    let coverImageUrl = blog.coverImage.url;

    // If a new cover image is uploaded, replace the old one
    if (req.file) {
      const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
      coverImageUrl = `${serverUrl}/uploads/blog/${slug}/${req.file.filename}`;
      
      // Optional: Delete the old physical file here if needed
    }

    const updatedData = {
      title,
      slug,
      description,
      category,
      coverImage: { url: coverImageUrl, altText: title },
      contentBlocks: typeof contentBlocks === 'string' ? JSON.parse(contentBlocks) : contentBlocks,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : [],
    };

    const updatedBlog = await BlogPost.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ success: true, message: "Blog updated!", data: updatedBlog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 6. DELETE BLOG ---
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the blog first to get the slug (needed for folder name)
    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const blogSlug = blog.slug;

    // 2. Construct the path to the folder safely
    // process.cwd() gets the root folder of your Node app
    const folderPath = path.join(process.cwd(), 'uploads', 'blog', blogSlug);

    console.log(`Attempting to delete folder: ${folderPath}`); // Debug log

    // 3. Delete the folder locally
    try {
      if (fs.existsSync(folderPath)) {
        // recursive: true deletes the folder and all images inside
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Verified: Local folder deleted for slug: ${blogSlug}`);
      } else {
        console.log(`Warning: Folder not found at ${folderPath}, skipping file deletion.`);
      }
    } catch (err) {
      console.error("Error deleting local files (DB deletion will continue):", err);
    }

    // 4. Delete the blog record from MongoDB
    await BlogPost.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Blog and associated local images deleted successfully" 
    });

  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Error deleting blog", error: error.message });
  }
};