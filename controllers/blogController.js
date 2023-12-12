const mongoose = require('mongoose');
const Blog = require('../models/blog');
const User = require('../models/user');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const { checkBlogOwnership } = require('../middlewares/authMiddleware');

const createBlog = async (req, res) => {
  try {
    const { title, description, imageUrl, category, paragraphs } = req.body;

    const blog = await Blog.create({
      title,
      description,
      imageUrl,
      category,
      paragraphs,
      owner: req.user._id,
    });
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'user not found' });
    }
    user.blogs.push(blog);
    await user.save();
    res
      .status(201)
      .json({ status: 'success', message: 'Blog created successfully', blog });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: `Something went wrong ${error.message}`,
    });
  }
};

const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404).json({ status: 'error', message: 'Blog not found' });
    }

    res
      .status(200)
      .json({ status: 'success', message: 'requested blog here', blog });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: `Something went wrong ${error.message}`,
    });
  }
};

// Update note
const updateBlog = async (req, res) => {
  checkBlogOwnership();
  const { title, description, imageUrl, category, paragraphs } = req.body;
  // console.log(title, description);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, imageUrl, category, paragraphs },
      { new: true }
    );
    if (!updatedBlog) {
      res.status(400).json({ status: 'error', message: 'Blog not updated' });
    }
    res.status(201).json({
      status: 'success',
      message: 'Blog has been updated',
      updatedBlog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
      status: 'error',
    });
  }
};

const deleteBlog = async (req, res) => {
  console.log(req.user._id);

  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      res
        .status(400)
        .json({ status: 'error', message: 'Could not delete blog' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'user not found' });
    }
    // Find the index of the blog in the user's blogs array
    const blogIndex = user.blogs.findIndex((blog) => blog._id == req.params.id);

    if (blogIndex === -1) {
      return res
        .status(404)
        .json({ error: 'Blog not found in user collection' });
    }

    // Remove the blog from the user's blogs array
    user.blogs.splice(blogIndex, 1);

    // Save the updated user document
    await user.save();
    res
      .status(203)
      .json({ status: 'success', message: 'blog has been deleted', blog });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
      status: 'error',
    });
  }
};

// Get all blog posts
const allblogs = async (req, res) => {
  try {
    const search = req.body.search || ''; // Default to an empty string if 'search' is not provided
    const page = parseInt(req.body.page) || 1; // Default to page 1 if 'page' is not provided or is invalid
    const perPage = 15; // Number of blogs per page

    // Build the search query using regular expressions for case-insensitive search
    const searchQuery = new RegExp(search, 'i');

    // Count the total number of blogs that match the search query
    const totalBlogs = await Blog.countDocuments({ title: searchQuery });

    if (totalBlogs == 0) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Searched blogs not found ' });
    }
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalBlogs / perPage);

    // Ensure 'page' is within valid range
    if (page < 1 || page > totalPages) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Invalid page number' });
    }

    // Calculate the number of blogs to skip
    const skip = (page - 1) * perPage;

    // Fetch the blogs that match the search query for the specified page
    const blogs = await Blog.find({ title: searchQuery })
      .sort({ createdAt: -1 }) // Sort by the latest blogs
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      status: 'success',
      message: 'Blogs fetched successfully',
      blogs,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'error', message: `error ${error.message}` });
  }
};
const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    console.log(file, 'image file');
    if (!file) {
      res
        .status(400)
        .json({ status: 'error', message: 'File/Image should be provided' });
    }
    sharp(file.buffer)
      .resize({ width: 800 })
      .toBuffer(async (err, data, info) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .json({ status: 'error', message: 'Error processing image' });
        }
        console.log(data);
        cloudinary.uploader
          .upload_stream({ resource_type: 'auto' }, async (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              return res.status(500).json({
                status: 'error',
                message: 'Error uploading image to Cloudinary',
              });
            }
            console.log(result.url);
            res.json({
              status: 'success',
              imageUrl: result.url,
              message: 'Image uploaded successfully',
            });
          })
          .end(data);
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'error', message: `error ${error.message}` });
  }
};

module.exports = {
  createBlog,
  getBlog,
  updateBlog,
  deleteBlog,
  allblogs,
  uploadImage,
};
