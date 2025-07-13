# Taskyn Backend API

AI-Based Skill Testing Platform Backend

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Email verification with OTP
  - Password reset with OTP
  - Secure password hashing with bcrypt

- **File Upload**
  - Avatar upload with Cloudinary integration
  - File type validation
  - Automatic cleanup of temporary files

- **User Management**
  - User registration and login
  - Profile management
  - Account deletion
  - Learning progress tracking

- **Security Features**
  - Input validation and sanitization
  - CORS configuration
  - Secure cookie settings
  - Rate limiting (to be implemented)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Gmail account (for email service)
- Cloudinary account (for file uploads)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskyn/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=8000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=taskyn

   # JWT Configuration
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration (Gmail)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /users/register
Content-Type: multipart/form-data

{
  "fullName": "John Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "avatarUrl": [file]
}
```

#### Login User
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /users/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Email Verification Endpoints

#### Send Email Verification OTP
```http
POST /users/send-email-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Verify Email OTP
```http
POST /users/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Resend Email Verification OTP
```http
POST /users/resend-email-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Password Reset Endpoints

#### Send Password Reset OTP
```http
POST /users/send-password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password with OTP
```http
POST /users/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

#### Resend Password Reset OTP
```http
POST /users/resend-password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Protected User Endpoints

#### Get Current User
```http
GET /users/me
Authorization: Bearer <access_token>
```

#### Update Account Details
```http
PATCH /users/update-account
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Update Avatar
```http
PATCH /users/update-avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "avatar": [file]
}
```

#### Change Password
```http
PATCH /users/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Delete Account
```http
DELETE /users/delete-account
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "currentpassword"
}
```

#### Logout
```http
POST /users/logout
Authorization: Bearer <access_token>
```

## 🔧 Configuration

### Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in your `.env` file

### Cloudinary Setup

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

### MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update the `MONGODB_URI` in your `.env` file

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js          # Database configuration
│   │   └── gemini.js      # AI service configuration
│   ├── controllers/
│   │   ├── user.controller.js    # User management logic
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── assignment.controller.js
│   │   ├── track.controller.js
│   │   ├── explore.controller.js
│   │   └── feedback.controller.js
│   ├── middleware/
│   │   ├── auth.js        # JWT verification
│   │   ├── multer.js      # File upload handling
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js        # User model with OTP support
│   │   ├── Assignment.js
│   │   ├── Track.js
│   │   ├── Task.js
│   │   ├── Feedback.js
│   │   ├── Userpreferences.js
│   │   ├── RefreshToken.js
│   │   └── ExploreSession.js
│   ├── routes/
│   │   ├── index.js       # Main router
│   │   ├── user.routes.js # User endpoints
│   │   ├── auth.routes.js
│   │   ├── assignment.routes.js
│   │   ├── track.routes.js
│   │   └── explore.routes.js
│   ├── services/
│   │   ├── auth.service.js    # Authentication services
│   │   ├── user.service.js    # User management services
│   │   ├── email.service.js   # Email services
│   │   ├── assignment.service.js
│   │   ├── track.service.js
│   │   └── gemini.service.js
│   ├── utils/
│   │   ├── apiError.js    # Error handling utilities
│   │   ├── apiResponse.js # Response formatting
│   │   ├── hash.js        # Password hashing
│   │   ├── jwt.js         # JWT utilities
│   │   ├── cloudinary.js  # File upload utilities
│   │   └── constants.js
│   ├── app.js            # Express app configuration
│   └── server.js         # Server entry point
├── package.json
└── README.md
```

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: Type validation and secure storage
- **CORS Protection**: Configurable cross-origin resource sharing
- **Cookie Security**: HttpOnly, Secure, and SameSite attributes

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong, unique secrets for JWT tokens
   - Configure production database URL
   - Set up production email service

2. **Security**
   - Enable HTTPS
   - Configure proper CORS origins
   - Set up rate limiting
   - Add security headers

3. **Monitoring**
   - Set up logging
   - Configure error tracking
   - Monitor database performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@taskyn.com or create an issue in the repository. 