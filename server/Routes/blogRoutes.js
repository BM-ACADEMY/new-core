const express = require('express');
const router = express.Router();
const blogController = require('../Controller/blogController'); // Ensure path is correct
const upload = require('../Config/blogMulter'); // Ensure path is correct
const { verifyToken } = require('../middleware/auth'); // IMPORT YOUR AUTH MIDDLEWARE



// 1. Create Blog (Protected + File Upload)
router.post('/', verifyToken, upload.single('coverImage'), blogController.createBlog);

// 2. Upload Inside Image (Protected + File Upload)
router.post('/upload-image', verifyToken, upload.single('image'), blogController.uploadContentImage);

// 3. Public Routes
router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getSingleBlog);

router.delete('/delete-image', verifyToken, blogController.deleteContentImage);

// Update Blog (Protected)
router.put('/:id', verifyToken, upload.single('coverImage'), blogController.updateBlog);

// Delete Blog (Protected)
router.delete('/:id', verifyToken, blogController.deleteBlog);

module.exports = router;