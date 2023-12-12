const express = require('express');
const { updateProfile } = require('../controllers/userController');
const {
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { checkBlogOwnership } = require('../middlewares/authMiddleware');

const router = express.Router();
router.put('/:id', updateProfile);
router.post('/', createBlog);
router.patch('/:id', checkBlogOwnership, updateBlog);
router.delete('/:id', checkBlogOwnership, deleteBlog);

module.exports = router;
