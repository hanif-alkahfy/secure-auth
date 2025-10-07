const express = require('express');
const router = express.Router();

const { getAllUsers } = require('../controllers/admin.controller');
const { protect, isAdmin, verifyCsrf } = require('../middleware/auth.middleware');


router.get('/users', protect, isAdmin, getAllUsers);

module.exports = router;