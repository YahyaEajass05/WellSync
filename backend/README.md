# WellSync Backend API

## 🚀 Overview

WellSync Backend is a comprehensive Node.js/Express.js API that integrates with FastAPI-powered AI models to provide mental wellness and academic impact predictions. The system includes full user authentication, email notifications, prediction history tracking, and robust security features.

## 🏗️ Architecture

```
Backend (Node.js/Express.js + MongoDB)
    ↓
FastAPI AI Service (Python)
    ↓
AI Models (Mental Wellness & Academic Impact)
```

## ✨ Features

- 🔐 **User Authentication & Authorization**
  - JWT-based authentication
  - Email verification
  - Password reset functionality
  - Role-based access control (User/Admin)

- 🤖 **AI Predictions Integration**
  - Mental Wellness Score Prediction
  - Academic Impact Analysis
  - Real-time communication with FastAPI service
  - Prediction history and trends

- 📧 **Email Functionality**
  - Welcome emails
  - Email verification
  - Password reset
  - Prediction reports
  - Account notifications

- 📊 **User Dashboard**
  - Personal statistics
  - Prediction history
  - Trend analysis
  - Favorite predictions

- 🛡️ **Security**
  - Helmet.js for HTTP headers security
  - Rate limiting
  - MongoDB sanitization
  - Password hashing with bcrypt
  - JWT token validation

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── email.js             # Email configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── predictionController.js  # Prediction handling
│   └── userController.js    # User management
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   ├── rateLimiter.js       # Rate limiting
│   └── validator.js         # Input validation
├── models/
│   ├── User.js              # User schema
│   └── Prediction.js        # Prediction schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── predictionRoutes.js  # Prediction endpoints
│   ├── userRoutes.js        # User endpoints
│   └── index.js             # Route aggregation
├── utils/
│   ├── aiService.js         # FastAPI integration
│   ├── emailService.js      # Email operations
│   ├── emailTemplates.js    # Email HTML templates
│   └── logger.js            # Winston logger
├── .env                     # Environment variables
├── package.json             # Dependencies
└── server.js                # Main entry point
```

## 🔧 Installation

### Prerequisites

- Node.js (v16+)
- MongoDB (v4.4+)
- Python FastAPI service running (port 8000)

### Steps

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configurations
```

3. **Start MongoDB:**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

4. **Start the FastAPI service:**
```bash
cd ai/api
python main.py
# Should run on http://localhost:8000
```

5. **Start the backend server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/auth/verify-email/:token` | Verify email | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password/:token` | Reset password | No |
| PUT | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

### Predictions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/predictions/mental-wellness` | Mental wellness prediction | Yes |
| POST | `/api/predictions/academic-impact` | Academic impact prediction | Yes |
| GET | `/api/predictions` | Get all predictions | Yes |
| GET | `/api/predictions/:id` | Get single prediction | Yes |
| PUT | `/api/predictions/:id` | Update prediction | Yes |
| DELETE | `/api/predictions/:id` | Delete prediction | Yes |
| GET | `/api/predictions/stats` | Get user statistics | Yes |
| GET | `/api/predictions/trends/:type` | Get prediction trends | Yes |
| POST | `/api/predictions/:id/email` | Email prediction report | Yes |
| GET | `/api/predictions/examples/:type` | Get example data | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| GET | `/api/users/dashboard` | Get dashboard data | Yes |
| DELETE | `/api/users/account` | Delete account | Yes |
| GET | `/api/users` | Get all users | Yes (Admin) |
| PUT | `/api/users/:id/role` | Update user role | Yes (Admin) |

### System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |
| GET | `/api/models/info` | AI models info | No |

## 📝 Request Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Mental Wellness Prediction

```bash
POST /api/predictions/mental-wellness
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 28,
  "gender": "Male",
  "occupation": "Software Engineer",
  "work_mode": "Hybrid",
  "screen_time_hours": 9.5,
  "work_screen_hours": 7.0,
  "leisure_screen_hours": 2.5,
  "sleep_hours": 7.0,
  "sleep_quality_1_5": 4,
  "stress_level_0_10": 5,
  "productivity_0_100": 75,
  "exercise_minutes_per_week": 180,
  "social_hours_per_week": 10.0
}
```

### Academic Impact Prediction

```bash
POST /api/predictions/academic-impact
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 21,
  "gender": "Female",
  "academic_level": "Bachelor",
  "country": "USA",
  "most_used_platform": "Instagram",
  "avg_daily_usage_hours": 4.5,
  "sleep_hours_per_night": 6.5,
  "mental_health_score": 6,
  "conflicts_over_social_media": 2,
  "affects_academic_performance": "Yes",
  "relationship_status": "Single"
}
```

## 🔐 Environment Variables

```bash
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/wellsync

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=WellSync <noreply@wellsync.com>

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=30000

# Frontend
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 🛡️ Security Features

1. **Helmet.js** - Sets secure HTTP headers
2. **Rate Limiting** - Prevents abuse and DDoS attacks
3. **MongoDB Sanitization** - Prevents NoSQL injection
4. **JWT Authentication** - Secure token-based auth
5. **Password Hashing** - Bcrypt with configurable rounds
6. **Input Validation** - Express-validator for all inputs
7. **CORS Configuration** - Controlled cross-origin access
8. **Error Handling** - Centralized error management

## 📈 Rate Limits

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Predictions**: 10 requests per minute
- **Email**: 3 requests per hour

## 🔍 Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error-level logs
- `combined.log` - All logs

## 🚀 Deployment

### Production Checklist

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use strong JWT secrets
4. Configure proper MongoDB URI
5. Set up email service (Gmail, SendGrid, etc.)
6. Enable HTTPS
7. Configure proper CORS origins
8. Set up monitoring and logging

## 🤝 Integration with AI Service

The backend communicates with the FastAPI service through HTTP requests:

```javascript
// Mental Wellness Prediction
POST http://localhost:8000/predict/mental-wellness

// Academic Impact Prediction
POST http://localhost:8000/predict/academic-impact

// Health Check
GET http://localhost:8000/health

// Models Info
GET http://localhost:8000/models/info
```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-factor authentication
2. Generate app-specific password
3. Use in `EMAIL_PASSWORD` variable

### Other Providers

Configure SMTP settings:
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP server

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
mongod --version
mongo --eval "db.adminCommand('ping')"
```

### AI Service Connection
```bash
# Test AI service
curl http://localhost:8000/health
```

### Email Issues
- Check SMTP credentials
- Verify firewall settings
- Enable "Less secure app access" (Gmail)

## 📚 Dependencies

### Production Dependencies
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `nodemailer` - Email sending
- `express-validator` - Input validation
- `helmet` - Security headers
- `cors` - CORS handling
- `axios` - HTTP client
- `winston` - Logging

### Dev Dependencies
- `nodemon` - Development server
- `jest` - Testing framework
- `supertest` - API testing

## 📄 License

MIT

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@wellsync.com

---

**Built with ❤️ using Node.js, Express.js, MongoDB, and FastAPI**
