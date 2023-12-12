const express = require('express');
const { getBlog, allblogs } = require('../controllers/blogController');
const router = express.Router();

router.get('/:id', getBlog);
router.get('/', allblogs);
module.exports = router;
