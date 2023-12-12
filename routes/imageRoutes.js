const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const { uploadImage } = require('../controllers/blogController');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), uploadImage);
module.exports = router;
