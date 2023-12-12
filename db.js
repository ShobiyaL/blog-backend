const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dbConnection = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });

    console.log('MongoDB connection established successfully');
  } catch (error) {
    console.log('Unable to establish connection with the Database', error);
  }
};

module.exports =  dbConnection ;
