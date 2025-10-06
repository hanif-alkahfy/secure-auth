const express = require('express');
const router = express.Router();

// Import controller yang sudah kita buat
const { register } = require('../controllers/auth.controller');

// Definisikan route untuk registrasi
// Method: POST, URL: /api/auth/register
router.post('/register', register);

// Nanti kita akan tambahkan route untuk login, logout, dll di sini.

module.exports = router;