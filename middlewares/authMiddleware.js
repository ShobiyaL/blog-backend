const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Blog = require('../models/blog');

const authentication = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(token, 'token....');
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log(decoded.id, 'userid');
      const user = await User.findById(decoded.id);
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };
      next();
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: 'error', message: 'Something went wrong' });
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('No token available');
  }
};

const checkBlogOwnership = async (req, res, next) => {
  console.log('Blog ID:', req.params.id);
  console.log('User Id:', typeof req.user._id.toString());
  try {
    const blog = await Blog.findById(req.params.id);
    // console.log(blog);
    if (!blog) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Blog post not found' });
    }
    console.log(typeof blog.owner, 'blog owner');

    if (blog.owner.toString() == req.user._id) {
      req.blog = blog;
      // console.log(req.blog);
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: 'Permission denied: You do not own this blog',
      });
    }
  } catch (error) {
    console.log(error, 'check owner ship');
    res.status(500).json({ status: 'error', message: `${error.message}` });
  }
};
module.exports = { authentication, checkBlogOwnership };
