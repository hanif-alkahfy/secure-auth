const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    // 1. Ambil token dari cookie
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Tidak terautentikasi, tidak ada token.',
        error: { code: 'UNAUTHENTICATED' }
      });
    }

    // 2. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Lampirkan data user ke object request (tanpa password)
    req.user = await User.findById(decoded.id).select('-password');

    // 4. Lanjutkan ke controller berikutnya
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Tidak terautentikasi, token tidak valid.',
      error: { code: 'INVALID_TOKEN', details: error.message }
    });
  }
};

exports.verifyCsrf = (req, res, next) => {
  // Ambil token dari cookie dan header kustom
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak: Token CSRF tidak valid.',
      error: { code: 'INVALID_CSRF_TOKEN' }
    });
  }

  next();
};

exports.isAdmin = (req, res, next) => {
  // Middleware 'protect' sudah melampirkan data user ke req.user
  if (req.user && req.user.role === 'admin') {
    next(); // Lanjutkan jika peran adalah admin
  } else {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Rute ini hanya untuk admin.',
      error: { code: 'FORBIDDEN_ADMIN_ONLY' }
    });
  }
};