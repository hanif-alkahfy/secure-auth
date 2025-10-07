const User = require('../models/user.model');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ /* ... struktur error ... */ });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ message: 'Email sudah terdaftar dan terverifikasi.' });
    }
    
    // Jika user ada tapi belum verifikasi, hapus agar bisa daftar ulang
    if (existingUser) {
      await User.findByIdAndDelete(existingUser._id);
    }
    
    const newUser = new User({ username, email, password });

    // --- LOGIKA OTP BARU ---
    // 1. Buat OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Simpan OTP dan waktu kedaluwarsanya ke database
    newUser.otp = otp;
    newUser.otpExpires = Date.now() + 10 * 60 * 1000; // Berlaku 10 menit
    
    await newUser.save();

    // 3. Kirim email berisi OTP
    try {
      await sendEmail({
        to: newUser.email,
        subject: 'Kode Verifikasi OTP SecureAuth Anda',
        html: `<h3>Halo ${newUser.username},</h3>
               <p>Gunakan kode di bawah ini untuk memverifikasi akun Anda. Kode ini hanya berlaku selama 10 menit.</p>
               <h2><strong>${otp}</strong></h2>`
      });

      res.status(201).json({
        success: true,
        message: `Registrasi berhasil. Kode OTP telah dikirim ke ${newUser.email}.`,
        data: null, // Tidak perlu kirim data user saat ini
        error: null
      });

    } catch (emailError) {
      // Jika email gagal, hapus user agar bisa coba lagi
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({ 
          success: false, 
          message: 'Gagal mengirim email verifikasi. Silakan coba lagi.',
          error: { code: 'EMAIL_SEND_ERROR' }
      });
    }
    // --- AKHIR LOGIKA OTP ---

  } catch (error) {
    res.status(500).json({ /* ... struktur error internal server ... */ });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email dan OTP diperlukan.',
        data: null,
        error: { code: 'VALIDATION_ERROR' }
      });
    }

    // 1. Cari pengguna berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna dengan email ini tidak ditemukan.',
        data: null,
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    // 2. Cek apakah OTP cocok dan belum kedaluwarsa
    if (String(user.otp) !== String(otp) || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP tidak valid atau sudah kedaluwarsa.',
        data: null,
        error: { code: 'INVALID_OTP' }
      });
    }

    // 3. Jika valid, update status verifikasi dan hapus OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // 4. LANGSUNG LOGIN: Buat JWT dan CSRF token, kirim via cookie
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const csrfToken = crypto.randomBytes(100).toString('hex');
    
    res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.cookie('csrf_token', csrfToken, { secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Verifikasi berhasil! Anda sekarang sudah login.',
      data: { user },
      error: null
    });

  } catch (error) {
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal pada server.',
        data: null,
        error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mohon isi email dan password.',
        data: null,
        error: { code: 'VALIDATION_ERROR' }
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid.',
        data: null,
        error: { code: 'AUTH_INVALID_CREDENTIALS' }
      });
    }

    // Buat token
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const csrfToken = crypto.randomBytes(100).toString('hex');
    
    // Kirim cookie
    res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.cookie('csrf_token', csrfToken, { secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    user.password = undefined; // Hapus password dari objek respons

    res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      data: { user },
      error: null
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.',
      data: null,
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

exports.logout = (req, res) => {
  // Hapus cookie dengan menimpanya dengan cookie yang sudah kedaluwarsa
  res.cookie('access_token', '', {
    httpOnly: true,
    expires: new Date(0), // Set waktu kedaluwarsa ke masa lalu
  });

  res.cookie('csrf_token', '', {
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logout berhasil!',
    data: null,
    error: null
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    // 1. Ambil email dari request body
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ /* ... struktur error ... */ });
    }

    // 2. Cari pengguna berdasarkan email
    const user = await User.findOne({ email });

    // PENTING: Jika user tidak ditemukan, TETAP kirim respons sukses.
    // Ini adalah praktik keamanan untuk mencegah orang menebak-nebak email mana yang terdaftar.
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'Jika email terdaftar, link reset password akan dikirim.' 
      });
    }

    // 3. Buat token reset (plain text)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 4. Hash token tersebut dan simpan ke database
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 5. Set waktu kedaluwarsa token (10 menit)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 6. Buat URL reset (menunjuk ke frontend)
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // 7. Kirim email
    await sendEmail({
      to: user.email,
      subject: 'Link Reset Password SecureAuth',
      html: `<p>Halo ${user.username},</p>
             <p>Anda meminta untuk mereset password Anda. Silakan klik link di bawah ini:</p>
             <a href="${resetURL}">${resetURL}</a>
             <p>Link ini hanya berlaku selama 10 menit. Jika Anda tidak meminta ini, abaikan saja email ini.</p>`
    });

    res.status(200).json({ 
      success: true, 
      message: 'Jika email terdaftar, link reset password akan dikirim.' 
    });

  } catch (error) {
    // Jika terjadi error, jangan bocorkan detailnya.
    // Kita juga hapus token dari user jika ada error saat kirim email.
    // (Logika ini bisa ditambahkan jika diperlukan)
    res.status(500).json({ /* ... struktur error internal server ... */ });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // 1. Ambil token dari URL (req.params) dan password baru dari body
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token dan password baru diperlukan.' });
    }

    // 2. Hash token dari URL agar bisa dibandingkan dengan yang ada di DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 3. Cari pengguna berdasarkan hashedToken dan pastikan token belum kedaluwarsa
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // $gt berarti "greater than"
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak valid atau sudah kedaluwarsa.',
        error: { code: 'INVALID_RESET_TOKEN' }
      });
    }

    // 4. Jika token valid, set password baru dan hapus token reset
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // Pre-save hook akan otomatis me-hash password baru

    // 5. Kirim respons sukses
    res.status(200).json({
      success: true,
      message: 'Password berhasil direset! Silakan login dengan password baru Anda.',
      data: null,
      error: null
    });

  } catch (error) {
    res.status(500).json({ /* ... struktur error internal server ... */ });
  }
};