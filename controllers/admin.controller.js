const User = require('../models/user.model');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Ambil semua user tanpa password
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua data pengguna.',
      data: { users },
      error: null
    });
  } catch (error) {
    res.status(500).json({ /* ... struktur error internal server ... */ });
  }
};