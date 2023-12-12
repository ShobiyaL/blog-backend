const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 8800;

let corsOptions = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
};

app.use(cors(corsOptions));
app.use(express.json());
const dbConnection = require('./db');
dbConnection();

// Routes def
const userRouter = require('./routes/userRoutes');
const protectedRouter = require('./routes/protectedRoutes');
const blogRouter = require('./routes/blogRoutes');
const blogOwnRouter = require('./routes/ownerRoutes');
const {
  authentication,
  checkBlogOwnership,
} = require('./middlewares/authMiddleware');
const imageRouter = require('./routes/imageRoutes');

// Routes..
app.use('/api/users', userRouter);
app.use('/api/user', authentication, protectedRouter);
app.use('/api/blog', authentication, protectedRouter);
app.use('/api/read/blog', blogRouter);
app.use('/api/image', imageRouter);

app.get('/blogCategories', async (req, res) => {
  const blogCategories = [
    'Technology Trends',
    'Health and Wellness',
    'Travel Destinations',
    'Food and Cooking',
    'Personal Finance',
    'Career Development',
    'Parenting Tips',
    'Self-Improvement',
    'Home Decor and DIY',
    'Book Reviews',
    'Environmental Sustainability',
    'Fitness and Exercise',
    'Movie and TV Show Reviews',
    'Entrepreneurship',
    'Mental Health',
    'Fashion and Style',
    'Hobby and Crafts',
    'Pet Care',
    'Education and Learning',
    'Sports and Recreation',
  ];
  res.json({ status: 'success', message: 'Categories', blogCategories });
});

//Test api
// app.get('/api/test', async (req, res) => {
//   res.json({ message: 'The API is working..' });
// });
app.listen(port, () => {
  console.log(`Server running on the port: ${port}`);
});
