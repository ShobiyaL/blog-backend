const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: '10d' });
};

const register = async (req, res) => {
  try {
    console.log(req.body, 'inputs for registration..');
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ status: 'error', message: 'User already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        userData: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ status: 'error', message: 'Could not register' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    console.log(req.body, 'user credentials..');
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.status(201).json({
        status: 'success',
        message: 'User logged in succcessfully',
        userData: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.status(201).json({
        status: 'error',
        message: 'user updated successfully',
        userData: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,

          token: generateToken(updatedUser._id),
          createdAt: updatedUser.createdAt,
        },
      });
    } else {
      res.status(404).json({ status: '404', message: 'user not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'something went wrong' });
  }
};
module.exports = { register, login, updateProfile };
