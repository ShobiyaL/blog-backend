const express = require('express');
const { updateBlog, deleteBlog } = require('../controllers/blogController');
const { checkBlogOwnership } = require('../middlewares/authMiddleware');

const router = express.Router();

module.exports = router;
