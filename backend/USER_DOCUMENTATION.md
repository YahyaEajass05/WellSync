# 📚 WellSync Backend - User Documentation

**Version:** 1.0.0  
**Last Updated:** January 13, 2026  
**API Base URL:** `http://localhost:5000/api`

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Best Practices](#best-practices)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Introduction

WellSync Backend is a RESTful API service that provides:
- User authentication and authorization
- Mental wellness predictions via AI integration
- Academic impact analysis
- Profile management
- Data analytics and insights
- Notification system
- Data export functionality

### Key Features

✅ **Secure Authentication** - JWT-based authentication system  
✅ **AI-Powered Predictions** - Mental wellness and academic impact analysis  
✅ **User Profiles** - Comprehensive profile management  
✅ **Real-time Analytics** - Track wellness trends over time  
✅ **Email Notifications** - Beautiful animated email templates  
✅ **Data Export** - Export your data in multiple formats  
✅ **Admin Dashboard** - Complete administrative control  

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Python 3.8+ (for AI service)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YahyaEajass05/WellSync.git
cd WellSync/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if not running)
# Windows: mongod
# Linux/Mac: sudo systemctl start mongodb

# Start the backend server
npm start
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/wellsync

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Email Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=WellSync <your-email@gmail.com>

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Verify Installation

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-13T...",
  "database": {
    "status": "connected"
  },
  "aiService": {
    "status": "connected"
  }
}
```

---

## 🔐 Authentication

WellSync uses **JWT (JSON Web Tokens)** for authentication.

### Authentication Flow

```
1. Register or Login
   ↓
2. Receive JWT Token
   ↓
3. Include Token in Headers
   ↓
4. Access Protected Endpoints
```

### How to Authenticate

#### 1. Register a New User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "user"
    }
  }
}
```

#### 2. Login Existing User

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### 3. Use Token for Protected Endpoints

Include the token in the `Authorization` header:

```bash
GET /api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Information

- **Expiration:** 7 days (configurable)
- **Storage:** Store securely (localStorage/sessionStorage for web, secure storage for mobile)
- **Refresh:** Login again to get a new token when expired

---

## 📡 API Endpoints

### Public Endpoints (No Authentication Required)

#### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": { "status": "connected" },
  "aiService": { "status": "connected" }
}
```

#### Get Model Information

```http
GET /api/models/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mental_wellness": {
      "model_name": "Voting Ensemble",
      "test_r2_score": 0.9426,
      "test_mae": 5.58
    },
    "academic_impact": {
      "model_name": "Tuned Gradient Boosting",
      "test_r2_score": 0.8926,
      "test_mae": 0.40
    }
  }
}
```

#### Get Example Data

```http
GET /api/predictions/examples/mental-wellness
GET /api/predictions/examples/academic-impact
```

---

### Authentication Endpoints

#### Register User

```http
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

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetCode": "123456",
  "newPassword": "NewSecurePass123"
}
```

---

### Prediction Endpoints

#### Mental Wellness Prediction

```http
POST /api/predictions/mental-wellness
Authorization: Bearer {token}
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "prediction": {
      "score": 75.5,
      "interpretation": "Good mental wellness",
      "modelUsed": "Voting Ensemble",
      "confidence": {
        "r2Score": 0.9426,
        "mae": 5.58
      }
    },
    "processingTime": 245
  }
}
```

#### Academic Impact Prediction

```http
POST /api/predictions/academic-impact
Authorization: Bearer {token}
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

#### Get All Predictions

```http
GET /api/predictions
Authorization: Bearer {token}
```

#### Get Single Prediction

```http
GET /api/predictions/:id
Authorization: Bearer {token}
```

#### Delete Prediction

```http
DELETE /api/predictions/:id
Authorization: Bearer {token}
```

---

### User Endpoints

#### Get User Profile

```http
GET /api/users/profile
Authorization: Bearer {token}
```

#### Update User Profile

```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Get User Dashboard

```http
GET /api/users/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPredictions": 15,
    "latestScore": 75.5,
    "averageScore": 72.3,
    "trend": "improving",
    "recentPredictions": [...],
    "insights": [...]
  }
}
```

---

### Profile Management Endpoints

#### Get Mental Wellness Profile

```http
GET /api/profiles/mental-wellness
Authorization: Bearer {token}
```

#### Create/Update Mental Wellness Profile

```http
POST /api/profiles/mental-wellness
Authorization: Bearer {token}
Content-Type: application/json

{
  "occupation": "Software Engineer",
  "workMode": "Hybrid",
  "screenTimeHours": 9.5,
  "sleepHours": 7.0,
  "exerciseMinutesPerWeek": 180,
  "stressLevel": 5
}
```

#### Get Student Profile

```http
GET /api/profiles/student
Authorization: Bearer {token}
```

#### Create/Update Student Profile

```http
POST /api/profiles/student
Authorization: Bearer {token}
Content-Type: application/json

{
  "academicLevel": "Bachelor",
  "major": "Computer Science",
  "university": "MIT",
  "country": "USA",
  "mostUsedPlatform": "Instagram",
  "avgDailyUsageHours": 4.5
}
```

---

### Notification Endpoints

#### Get All Notifications

```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Mark Notification as Read

```http
POST /api/notifications/read/:id
Authorization: Bearer {token}
```

#### Delete Notification

```http
DELETE /api/notifications/:id
Authorization: Bearer {token}
```

---

### Analytics Endpoints

#### Get Wellness Trends

```http
GET /api/analytics/trends?period=weekly&type=mental_wellness
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: `daily`, `weekly`, `monthly`, `yearly`
- `type`: `mental_wellness`, `academic_impact`

#### Get Personalized Insights

```http
GET /api/analytics/insights
Authorization: Bearer {token}
```

---

### Export Endpoints

#### Export Predictions

```http
POST /api/export/predictions
Authorization: Bearer {token}
Content-Type: application/json

{
  "format": "json",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-01-31"
}
```

**Formats:** `json`, `csv`, `pdf`

---

### Admin Endpoints (Admin Role Required)

#### Get All Users

```http
GET /api/admin/users?page=1&limit=20
Authorization: Bearer {admin-token}
```

#### Get System Statistics

```http
GET /api/admin/stats
Authorization: Bearer {admin-token}
```

#### Delete User

```http
DELETE /api/admin/users/:id
Authorization: Bearer {admin-token}
```

---

## 📦 Data Models

### User Model

```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "user | admin",
  "isEmailVerified": "boolean",
  "avatar": "string (url)",
  "phone": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Prediction Model

```json
{
  "id": "string",
  "userId": "string",
  "predictionType": "mental_wellness | academic_impact",
  "inputData": "object",
  "result": {
    "prediction": "number",
    "interpretation": "string",
    "modelName": "string",
    "confidence": "object"
  },
  "createdAt": "timestamp"
}
```

### Mental Wellness Profile

```json
{
  "userId": "string",
  "occupation": "string",
  "workMode": "Remote | Hybrid | Office",
  "screenTimeHours": "number",
  "workScreenHours": "number",
  "leisureScreenHours": "number",
  "sleepHours": "number",
  "sleepQuality": "number (1-5)",
  "stressLevel": "number (0-10)",
  "productivity": "number (0-100)",
  "exerciseMinutesPerWeek": "number",
  "socialHoursPerWeek": "number"
}
```

### Student Profile

```json
{
  "userId": "string",
  "academicLevel": "Bachelor | Master | PhD",
  "major": "string",
  "university": "string",
  "country": "string",
  "mostUsedPlatform": "string",
  "avgDailyUsageHours": "number",
  "sleepHoursPerNight": "number",
  "mentalHealthScore": "number (0-10)",
  "conflictsOverSocialMedia": "number (0-5)",
  "affectsAcademicPerformance": "Yes | No",
  "relationshipStatus": "string"
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Examples

#### Missing Token
```json
{
  "success": false,
  "error": "Not authorized to access this route",
  "statusCode": 401
}
```

#### Invalid Input
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "age must be between 18 and 100",
  "statusCode": 400
}
```

#### Rate Limit Exceeded
```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Please try again in 15 minutes",
  "statusCode": 429
}
```

---

## 🚦 Rate Limiting

To prevent abuse, the API implements rate limiting:

- **Default Limit:** 100 requests per 15 minutes per IP
- **Headers:** Response includes rate limit information

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642089600
```

---

## ✨ Best Practices

### 1. Security

✅ **Always use HTTPS in production**  
✅ **Never expose JWT tokens in URLs**  
✅ **Store tokens securely (not in localStorage for sensitive apps)**  
✅ **Implement token refresh mechanism**  
✅ **Validate all user inputs on client side**  

### 2. Error Handling

✅ **Check `success` field in responses**  
✅ **Handle all HTTP status codes appropriately**  
✅ **Display user-friendly error messages**  
✅ **Log errors for debugging**  

### 3. Performance

✅ **Cache frequently accessed data**  
✅ **Use pagination for large datasets**  
✅ **Implement request debouncing**  
✅ **Minimize unnecessary API calls**  

### 4. Data Management

✅ **Validate data before sending requests**  
✅ **Handle loading states**  
✅ **Implement optimistic updates where appropriate**  
✅ **Clean up old data periodically**  

---

## 💡 Examples

### Complete JavaScript Example (React/Next.js)

```javascript
// auth.js - Authentication helper
class AuthService {
  static async register(userData) {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      return data.data;
    }
    
    throw new Error(data.error);
  }
  
  static async login(email, password) {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      return data.data;
    }
    
    throw new Error(data.error);
  }
  
  static logout() {
    localStorage.removeItem('token');
  }
  
  static getToken() {
    return localStorage.getItem('token');
  }
}

// api.js - API helper
class WellSyncAPI {
  static baseURL = 'http://localhost:5000/api';
  
  static async request(endpoint, options = {}) {
    const token = AuthService.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.data;
  }
  
  static async getMentalWellnessPrediction(inputData) {
    return this.request('/predictions/mental-wellness', {
      method: 'POST',
      body: JSON.stringify(inputData)
    });
  }
  
  static async getAcademicImpactPrediction(inputData) {
    return this.request('/predictions/academic-impact', {
      method: 'POST',
      body: JSON.stringify(inputData)
    });
  }
  
  static async getDashboard() {
    return this.request('/users/dashboard');
  }
  
  static async getPredictions() {
    return this.request('/predictions');
  }
}

// Usage in React component
function PredictionComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handlePredict = async (formData) => {
    try {
      setLoading(true);
      const prediction = await WellSyncAPI.getMentalWellnessPrediction(formData);
      setResult(prediction);
    } catch (error) {
      console.error('Prediction failed:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading && <p>Processing...</p>}
      {result && (
        <div>
          <h3>Your Score: {result.prediction.score}/100</h3>
          <p>{result.prediction.interpretation}</p>
        </div>
      )}
    </div>
  );
}
```

### Python Example

```python
import requests

class WellSyncClient:
    def __init__(self, base_url="http://localhost:5000/api"):
        self.base_url = base_url
        self.token = None
    
    def register(self, user_data):
        response = requests.post(
            f"{self.base_url}/auth/register",
            json=user_data
        )
        data = response.json()
        
        if data['success']:
            self.token = data['data']['token']
            return data['data']
        
        raise Exception(data['error'])
    
    def login(self, email, password):
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        data = response.json()
        
        if data['success']:
            self.token = data['data']['token']
            return data['data']
        
        raise Exception(data['error'])
    
    def get_mental_wellness_prediction(self, input_data):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/predictions/mental-wellness",
            json=input_data,
            headers=headers
        )
        data = response.json()
        
        if data['success']:
            return data['data']
        
        raise Exception(data['error'])
    
    def get_dashboard(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/users/dashboard",
            headers=headers
        )
        data = response.json()
        
        if data['success']:
            return data['data']
        
        raise Exception(data['error'])

# Usage
client = WellSyncClient()
client.login("john@example.com", "password123")

prediction = client.get_mental_wellness_prediction({
    "age": 28,
    "gender": "Male",
    "occupation": "Software Engineer",
    # ... other fields
})

print(f"Score: {prediction['prediction']['score']}")
print(f"Interpretation: {prediction['prediction']['interpretation']}")
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Get Prediction (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/predictions/mental-wellness \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
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
  }'
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Cannot connect to server"

**Cause:** Backend server not running

**Solution:**
```bash
cd backend
npm start
```

#### 2. "Database connection failed"

**Cause:** MongoDB not running

**Solution:**
```bash
# Start MongoDB
mongod  # Windows
sudo systemctl start mongodb  # Linux
```

#### 3. "401 Unauthorized"

**Cause:** Missing or invalid JWT token

**Solution:**
- Ensure you're logged in
- Check token is included in Authorization header
- Token format: `Bearer <token>`
- Login again if token expired

#### 4. "AI Service unavailable"

**Cause:** AI service not running

**Solution:**
```bash
python ai/api/main.py
```

#### 5. "Rate limit exceeded"

**Cause:** Too many requests in short time

**Solution:**
- Wait 15 minutes before retrying
- Implement request throttling in your client
- Contact admin for higher rate limit

### Getting Help

- **GitHub Issues:** [Report bugs](https://github.com/YahyaEajass05/WellSync/issues)
- **Email:** support@wellsync.com
- **Documentation:** Check this guide and AI documentation

---

## 📝 Changelog

### Version 1.0.0 (January 2026)
- Initial release
- Complete authentication system
- Mental wellness predictions
- Academic impact predictions
- Profile management
- Analytics and insights
- Email notifications with animations
- Admin dashboard

---

## 📄 License

Copyright © 2026 WellSync. All rights reserved.

---

## 🎯 Quick Reference Card

### Essential Endpoints

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Register | POST | `/api/auth/register` | No |
| Login | POST | `/api/auth/login` | No |
| Get Profile | GET | `/api/users/profile` | Yes |
| Mental Wellness | POST | `/api/predictions/mental-wellness` | Yes |
| Academic Impact | POST | `/api/predictions/academic-impact` | Yes |
| Dashboard | GET | `/api/users/dashboard` | Yes |
| Predictions List | GET | `/api/predictions` | Yes |

### Authentication Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Base URL

```
Development: http://localhost:5000/api
Production: https://api.wellsync.com/api
```

---

**Need AI Service Documentation?** See [AI_USER_DOCUMENTATION.md](../ai/AI_USER_DOCUMENTATION.md)

---

*This documentation is maintained by the WellSync team. Last updated: January 13, 2026*
