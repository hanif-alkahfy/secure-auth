const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.getProfile = (req, res) => {
  // Data req.user sudah dilampirkan oleh middleware 'protect'
  res.status(200).json({
    success: true,
    message: 'Profil pengguna berhasil diambil.',
    data: { user: req.user },
    error: null
  });
};

exports.changePassword = async (req, res) => {
  try {
    // 1. Ambil password lama dan baru dari body
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ /* ... struktur error ... */ });
    }

    // 2. Cari pengguna dari database (req.user.id dari middleware 'protect')
    // Gunakan .select('+password') untuk mengambil field password secara eksplisit
    const user = await User.findById(req.user.id).select('+password');

    // 3. Verifikasi password saat ini
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password saat ini salah.',
        error: { code: 'INVALID_CURRENT_PASSWORD' }
      });
    }

    // 4. Set password baru dan simpan
    user.password = newPassword;
    await user.save(); // Pre-save hook di model akan otomatis me-hash password baru

    res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui!',
      data: null,
      error: null
    });

  } catch (error) {
    res.status(500).json({ /* ... struktur error internal server ... */ });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // 1. Ambil password dari body untuk konfirmasi
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password diperlukan untuk konfirmasi.',
        error: { code: 'PASSWORD_REQUIRED' }
      });
    }

    // 2. Cari pengguna dan ambil hash password-nya
    const user = await User.findById(req.user.id).select('+password');

    // 3. Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password salah.',
        error: { code: 'INVALID_PASSWORD' }
      });
    }

    // 4. Hapus pengguna dari database
    await User.findByIdAndDelete(req.user.id);

    // 5. Hapus cookie sesi, sama seperti saat logout
    res.cookie('access_token', '', { httpOnly: true, expires: new Date(0) });
    res.cookie('csrf_token', '', { expires: new Date(0) });

    res.status(200).json({
      success: true,
      message: 'Akun Anda telah berhasil dihapus.',
      data: null,
      error: null
    });

  } catch (error) {
    res.status(500).json({ /* ... struktur error internal server ... */ });
  }
};