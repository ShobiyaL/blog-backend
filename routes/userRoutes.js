const express = require('express');
const { register, login } = require('../controllers/userController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// user routes test..API
// router.get('/', (req, res) => {
//   res.json({ message: 'TEST: user routes are working..' });
// });
module.exports = router;
