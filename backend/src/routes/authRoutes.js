const express = require('express');
const catchAsync = require('../utils/catchAsync');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', catchAsync(register));
router.post('/login', catchAsync(login));

module.exports = router;
