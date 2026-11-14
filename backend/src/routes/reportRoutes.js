const express = require('express');
const { requireAuth } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const { daily, monthToDate, monthly } = require('../controllers/reportController');

const router = express.Router();

router.use(requireAuth);
router.get('/daily', catchAsync(daily));
router.get('/month-to-date', catchAsync(monthToDate));
router.get('/monthly', catchAsync(monthly));

module.exports = router;
