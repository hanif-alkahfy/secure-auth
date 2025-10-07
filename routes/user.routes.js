const express = require('express');
const router = express.Router();

const { getProfile, changePassword, deleteAccount } = require('../controllers/user.controller');

// Import kedua middleware
const { protect, verifyCsrf } = require('../middleware/auth.middleware');

router.get('/me', protect, getProfile);

router.put('/me/change-password', protect, verifyCsrf, changePassword);

router.delete('/me', protect, verifyCsrf, deleteAccount);

module.exports = router;