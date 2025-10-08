# SecureAuth API Backend

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)

A robust and production-ready backend blueprint for modern authentication systems. Built with Node.js, Express, and MongoDB, this project features layered security architecture including JWT, OTP verification, CSRF protection, and Role-Based Access Control (RBAC).

---

## ✅ Features

### Secure User Onboarding
- [x] User Registration with **OTP (One-Time Password)** delivery via Email
- [x] Endpoint for OTP verification and account activation

### Session Management & Authentication
- [x] User Login with password verification (`bcryptjs`)
- [x] **JWT (Access Token)** generation as session
- [x] **CSRF Token** generation for additional protection
- [x] Token delivery via secure **`HttpOnly` Cookie**
- [x] Logout that destroys session cookie

### Layered Security
- [x] **Protection Middleware (JWT):** Protects routes requiring login
- [x] **Protection Middleware (CSRF):** Protects routes that modify data (`PUT`, `DELETE`, etc.)
- [x] **Authorization Middleware (RBAC):** Protects `admin` specific routes

### User Account Management
- [x] Get current logged-in user profile
- [x] Change password (requires old password confirmation)
- [x] Delete account (requires password confirmation)

### Account Recovery
- [x] Complete "Forgot Password" flow via email
- [x] Secure and time-limited reset token generation

### Professional Architecture
- [x] Consistent API response structure ("envelope") for all endpoints
- [x] Safe error handling for production environment
- [x] Use of environment variables (`.env`) for all credentials

---

## 🚀 Roadmap & Upcoming Features

- [ ] **Google OAuth 2.0 Integration:** Allow users to register and login using their Google accounts
- [ ] **"Remember Me" Functionality:** Implement longer-lasting login sessions (e.g., 30 days) using *Refresh Tokens*
- [ ] **Advanced Logging:** Integrate logging libraries like `Winston` or `Morgan` for better production monitoring
- [ ] **API Rate Limiting:** Prevent *brute-force* attacks on login and other endpoints

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose (hosted on MongoDB Atlas)
- **Authentication:** JSON Web Token (JWT)
- **Security:** Bcryptjs, CSRF Protection, Cookie Parser
- **Email Delivery:** Nodemailer, SendGrid

---

## ⚙️ Environment Variables (.env)

To run this project, you need to create a `.env` file in the `backend` root folder and fill in the following variables:

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

## 📦 Installation & Local Setup

1. **Clone this repository:**
   ```bash
   git clone https://github.com/hanif-alkahfy/secure-auth.git
   cd secure-auth
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Create and fill the `.env` file** by copying the `.env.example` above

4. **Run the development server:**
   ```bash
   npm run dev
   ```

The server will run at `http://localhost:5000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Protection |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Register new user & send OTP | - |
| POST | `/api/auth/verify-otp` | Verify OTP & activate account | - |
| POST | `/api/auth/login` | Login user & create session cookie | - |
| POST | `/api/auth/logout` | Logout user & remove session cookie | - |
| POST | `/api/auth/forgot-password` | Send password reset email | - |
| POST | `/api/auth/reset-password/:token` | Reset password with token | - |
| GET | `/api/user/me` | Get current user profile | JWT |
| PUT | `/api/user/me/change-password` | Change user password | JWT, CSRF |
| DELETE | `/api/user/me` | Delete user account | JWT, CSRF |
| GET | `/api/admin/users` | Get all user data | JWT, Admin |

---

## 📄 License

This project is licensed under the MIT License.