const express = require('express');
const { requireAuth } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const { list, create, update, remove } = require('../controllers/readingController');

const router = express.Router();

router.use(requireAuth);
router.get('/', catchAsync(list));
router.post('/', catchAsync(create));
router.put('/:id', catchAsync(update));
router.delete('/:id', catchAsync(remove));

module.exports = router;
