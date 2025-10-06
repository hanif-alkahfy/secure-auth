const User = require('../models/user.model');

exports.register = async (req, res) => {
  try {
    // 1. Ambil data dari request body
    const { username, email, password } = req.body;

    // 2. Validasi dasar untuk memastikan semua field diisi
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Mohon isi semua field yang diperlukan.' });
    }

    // 3. Cek apakah username atau email sudah terdaftar
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email atau username sudah digunakan.' });
    }

    // 4. Buat instance user baru
    // Password akan di-hash secara otomatis oleh pre-save hook di model
    const newUser = new User({
      username,
      email,
      password,
    });

    // 5. Simpan user baru ke database
    await newUser.save();

    // 6. Hapus password dari objek sebelum mengirim respons
    newUser.password = undefined;

    // 7. Kirim respons sukses
    res.status(201).json({ 
      message: 'Pengguna berhasil terdaftar!',
      user: newUser 
    });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};