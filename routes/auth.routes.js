const express = require('express');
const router = express.Router();

// Import controller yang sudah kita buat
const { register, login, logout, verifyOtp, forgotPassword, resetPassword } = require('../controllers/auth.controller');

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.post('/verify-otp', verifyOtp); 

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

module.exports = router;