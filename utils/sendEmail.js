const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Buat "transporter"
  // Ini adalah objek yang tahu cara berkomunikasi dengan layanan email (SendGrid)
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587, // Port standar, bisa juga 465
    auth: {
      user: 'apikey', // Nilai ini HARUS 'apikey' untuk SendGrid
      pass: process.env.SENDGRID_API_KEY, // API Key dari file .env
    },
  });

  // 2. Definisikan opsi email (penerima, subjek, isi, dll.)
  const mailOptions = {
    from: `SecureAuth <${process.env.EMAIL_FROM}>`, // Tampilan nama dan email pengirim
    to: options.to,
    subject: options.subject,
    text: options.text, // Versi teks biasa (opsional)
    html: options.html, // Versi HTML dari email
  };

  // 3. Kirim email menggunakan transporter dan opsi yang sudah dibuat
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;