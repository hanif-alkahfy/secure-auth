# SecureAuth API Backend

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)

Blueprint backend yang tangguh dan siap produksi untuk sistem autentikasi modern. Dibangun dengan Node.js, Express, dan MongoDB, proyek ini memiliki arsitektur keamanan berlapis termasuk JWT, verifikasi OTP, proteksi CSRF, dan Kontrol Akses Berbasis Peran (RBAC).

---

## ✅ Fitur yang Sudah Diimplementasikan

### Onboarding Pengguna yang Aman
- [x] Registrasi Pengguna dengan pengiriman **OTP (One-Time Password)** via Email
- [x] Endpoint untuk verifikasi OTP dan aktivasi akun

### Manajemen Sesi & Autentikasi
- [x] Login Pengguna dengan verifikasi password (`bcryptjs`)
- [x] Pembuatan **JWT (Access Token)** sebagai sesi
- [x] Pembuatan **CSRF Token** untuk proteksi tambahan
- [x] Pengiriman token melalui **`HttpOnly` Cookie** yang aman
- [x] Logout yang menghancurkan sesi cookie

### Keamanan Berlapis
- [x] **Middleware Proteksi (JWT):** Melindungi route yang memerlukan login
- [x] **Middleware Proteksi (CSRF):** Melindungi route yang mengubah data (`PUT`, `DELETE`, dll)
- [x] **Middleware Otorisasi (RBAC):** Melindungi route khusus `admin`

### Manajemen Akun Pengguna
- [x] Mendapatkan profil pengguna yang sedang login
- [x] Mengubah password (memerlukan konfirmasi password lama)
- [x] Menghapus akun (memerlukan konfirmasi password)

### Pemulihan Akun
- [x] Alur "Lupa Password" lengkap via email
- [x] Pembuatan token reset yang aman dan berbatas waktu

### Arsitektur Profesional
- [x] Struktur respons API ("envelope") yang konsisten untuk semua endpoint
- [x] Penanganan error yang aman untuk lingkungan produksi
- [x] Penggunaan variabel lingkungan (`.env`) untuk semua kredensial

---

## 🚀 Roadmap & Fitur Mendatang

- [ ] **Integrasi Google OAuth 2.0:** Memungkinkan pengguna untuk mendaftar dan login menggunakan akun Google mereka
- [ ] **Fungsionalitas "Remember Me":** Mengimplementasikan sesi login yang bertahan lebih lama (misalnya 30 hari) menggunakan *Refresh Token*
- [ ] **Advanced Logging:** Mengintegrasikan library logging seperti `Winston` atau `Morgan` untuk pemantauan produksi yang lebih baik
- [ ] **API Rate Limiting:** Mencegah serangan *brute-force* pada endpoint login dan lainnya

---

## 🛠️ Tumpukan Teknologi

- **Backend:** Node.js, Express.js
- **Database:** MongoDB dengan Mongoose (dihosting di MongoDB Atlas)
- **Autentikasi:** JSON Web Token (JWT)
- **Keamanan:** Bcryptjs, CSRF Protection, Cookie Parser
- **Pengiriman Email:** Nodemailer, SendGrid

---

## ⚙️ Variabel Lingkungan (.env)

Untuk menjalankan proyek ini, Anda perlu membuat file `.env` di root folder `backend` dan mengisi variabel berikut:

```env
# Server Configuration
PORT=5000

# MongoDB Atlas Database Configuration
MONGO_URI="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/DATABASE?retryWrites=true&w=majority"

# JWT Configuration
JWT_SECRET="your_super_long_and_secure_random_string"

# Client/Frontend URL
CLIENT_URL="http://localhost:3000"

# Email Configuration (SendGrid)
EMAIL_FROM="your_verified_email@example.com"
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
```

---

## 📦 Instalasi & Setup Lokal

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/NAMA_USER_ANDA/secure-auth-backend.git
   cd secure-auth-backend
   ```

2. **Instal semua dependencies:**
   ```bash
   npm install
   ```

3. **Buat dan isi file `.env`** dengan meniru `.env.example` di atas

4. **Jalankan server development:**
   ```bash
   npm run dev
   ```

Server akan berjalan di `http://localhost:5000`

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi | Proteksi |
|--------|----------|-----------|----------|
| POST | `/api/auth/register` | Mendaftarkan pengguna baru & mengirim OTP | - |
| POST | `/api/auth/verify-otp` | Memverifikasi OTP & mengaktifkan akun | - |
| POST | `/api/auth/login` | Login pengguna & membuat sesi cookie | - |
| POST | `/api/auth/logout` | Logout pengguna & menghapus sesi cookie | - |
| POST | `/api/auth/forgot-password` | Mengirim email reset password | - |
| POST | `/api/auth/reset-password/:token` | Mereset password dengan token | - |
| GET | `/api/user/me` | Mendapatkan profil pengguna saat ini | JWT |
| PUT | `/api/user/me/change-password` | Mengubah password pengguna | JWT, CSRF |
| DELETE | `/api/user/me` | Menghapus akun pengguna | JWT, CSRF |
| GET | `/api/admin/users` | Mendapatkan semua data pengguna | JWT, Admin |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.