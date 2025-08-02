# Taskyn — AI-Powered Skill Development Platform

Taskyn is a comprehensive full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) that revolutionizes skill development through AI-personalized learning experiences. The platform leverages Google Gemini AI to create custom learning tracks, generate daily challenges, and provide intelligent feedback to help developers master technical skills efficiently.

## Overview

Taskyn transforms traditional learning by combining artificial intelligence with personalized education. The platform analyzes user preferences, learning goals, and progress patterns to deliver tailored assignments and track development milestones. Whether you're a beginner programmer or an experienced developer looking to expand your skill set, Taskyn provides the tools and guidance needed to accelerate your learning journey.

## Core Features

### Authentication & Security
- JWT-based authentication with refresh token support
- Email verification system with OTP functionality
- Secure password reset mechanisms
- Role-based access control and authorization

### AI-Powered Learning
- Intelligent skill track generation based on user preferences
- Daily assignment creation using Google Gemini AI
- Personalized learning path recommendations
- Adaptive difficulty adjustment based on performance

### Progress Tracking
- Comprehensive submission tracking with reflection capabilities
- Detailed analytics and performance metrics
- Learning streak monitoring and achievement system
- Progress visualization and milestone tracking

### User Experience
- Intuitive onboarding system with deep personalization
- Learning goal configuration and time management
- Programming language preference settings
- Real-time feedback and improvement suggestions

### Technical Architecture
- Scalable microservices architecture
- Cloud-ready deployment configuration
- File upload integration with Cloudinary
- Email service integration for notifications
- Comprehensive API documentation

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh token rotation
- **AI Integration**: Google Gemini API for content generation
- **File Storage**: Cloudinary for media management
- **Email Service**: Nodemailer with Gmail integration
- **Validation**: Express-validator for input sanitization

### Frontend
- **Framework**: React with Vite build tool
- **State Management**: React hooks and context
- **Styling**: CSS with modern design principles
- **Development**: ESLint configuration for code quality

### Infrastructure
- **Environment**: Docker containerization support
- **Deployment**: Cloud platform ready (Render, Railway, Vercel, DigitalOcean)
- **Security**: CORS protection, input validation, secure cookies
- **Monitoring**: Error handling and logging systems

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database (local or cloud)
- Google Gemini API access
- Cloudinary account for file storage
- Gmail account for email services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Taskyn
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017
DB_NAME=Taskyn

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key

# File Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## API Documentation

The backend provides a comprehensive REST API with the following main endpoints:

- **Authentication**: User registration, login, token refresh
- **User Management**: Profile updates, avatar management, account settings
- **Learning Tracks**: AI-generated skill tracks and assignments
- **Progress Tracking**: Submission management and analytics
- **Feedback System**: AI-powered feedback and improvement suggestions

For detailed API documentation, refer to the backend README file.

## Project Structure

```
Taskyn/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   └── utils/          # Frontend utilities
│   └── package.json
└── README.md
```

## Development

### Backend Development
- Run `npm run dev` for development with hot reload
- API server runs on `http://localhost:8000`
- Comprehensive error handling and validation
- Modular architecture for easy maintenance

### Frontend Development
- Run `npm run dev` for development server
- Application runs on `http://localhost:3000`
- Modern React patterns and best practices
- Responsive design for all device types

## Deployment

Taskyn is designed for easy deployment to various cloud platforms:

1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up MongoDB Atlas or self-hosted MongoDB
3. **File Storage**: Configure Cloudinary for production
4. **Email Service**: Set up production email service
5. **Security**: Enable HTTPS and configure CORS for production domains

## Contributing

We welcome contributions to improve Taskyn:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Review the documentation in the backend README

---

**Taskyn** - Empowering developers to master new skills through intelligent, personalized learning experiences.