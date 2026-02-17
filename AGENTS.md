# WellSync - AI Agent Guidelines

## Project Overview

**WellSync** is an AI-powered mental wellness and academic performance prediction system for students in educational institutions. The platform uses machine learning to predict mental wellness scores, stress levels, and academic impact based on lifestyle factors, screen time, sleep quality, and social media usage patterns.

### Key Technologies
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM)
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Three.js
- **AI/ML**: Python, scikit-learn, FastAPI, pandas, numpy
- **Authentication**: JWT tokens, bcrypt password hashing
- **Email**: Nodemailer with Gmail SMTP
- **Visualization**: matplotlib, seaborn, recharts

### Project Structure
```
WellSync/
├── ai/                      # Python ML models and FastAPI service
├── backend/                 # Node.js Express API server
├── frontend/                # Next.js TypeScript application
├── email_template_previews/ # HTML email template previews
├── logo/                    # Project logo assets
└── report/                  # Project documentation
```

## Architecture

### Three-Tier Architecture
1. **Frontend (Port 3000)**: Next.js application with React Three Fiber for 3D visualizations
2. **Backend (Port 5000)**: Express.js REST API with MongoDB database
3. **AI Service (Port 8000)**: FastAPI service serving ML models

### AI/ML Models
- **Mental Wellness Prediction**: Predicts wellness score (0-100) using ensemble methods
- **Stress Level Prediction**: Multi-class classification (Low/Moderate/High/Very High)
- **Academic Impact Prediction**: Predicts addiction level and academic risk

### Model Training Pipeline
1. Data loading and EDA
2. Preprocessing and feature engineering
3. Train-test split (80/20)
4. Baseline model comparison
5. Hyperparameter tuning (GridSearchCV/RandomizedSearchCV)
6. Ensemble model creation (Voting/Stacking)
7. Evaluation (R², MAE, RMSE, MAPE)

## Development Guidelines

### Environment Setup

#### Required Environment Variables
- Copy `.env.example` to `.env` in the `backend/` directory
- Set `MONGODB_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASSWORD`, `AI_SERVICE_URL`, `FRONTEND_URL`
- For frontend, copy `frontend/.env.local.example` to `frontend/.env.local`

#### Service Startup Order
1. Start MongoDB: `mongod` or use MongoDB Atlas
2. Start AI service: `cd ai && uvicorn api.main:app --reload --port 8000`
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`

### Code Conventions

#### Backend (Node.js/Express)
- Use async/await with try-catch blocks
- Wrap async route handlers with `asyncHandler` middleware
- Follow RESTful API conventions
- Use JSDoc comments for functions
- Return consistent JSON responses: `{ success: true/false, data: {}, error: "" }`
- Use environment variables for all configuration
- Implement proper error handling with custom error classes
- Use Winston logger instead of console.log

#### Frontend (Next.js/TypeScript)
- Use TypeScript for all new code
- Follow Next.js 14 App Router conventions
- Use server components by default, client components only when needed ('use client')
- Use Zustand for global state management
- Use React Query (@tanstack/react-query) for API calls
- Use Tailwind CSS for styling (avoid inline styles)
- Follow the shadcn/ui component patterns
- Use Zod for schema validation with React Hook Form

#### AI/ML (Python)
- Follow PEP 8 style guide
- Use type hints for function parameters and returns
- Use docstrings for all functions and classes
- Save trained models in `ai/models/{model_type}/` with timestamp
- Generate evaluation reports and visualizations
- Use joblib for model serialization
- Implement proper error handling and validation

### File Organization

#### Backend Structure
```
backend/
├── config/          # Database, email configuration
├── controllers/     # Route handler logic
├── middleware/      # Auth, validation, error handling, rate limiting
├── models/          # Mongoose schemas
├── routes/          # Express route definitions
├── utils/           # Helper functions, services
└── tests/           # Backend tests
```

#### Frontend Structure
```
frontend/
├── app/             # Next.js 14 App Router pages
│   ├── (auth)/      # Authentication pages (grouped route)
│   └── (dashboard)/ # Dashboard pages (grouped route)
├── components/      # React components
│   ├── layout/      # Layout components
│   ├── three/       # Three.js 3D components
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities and configurations
│   ├── api/         # API client functions
│   ├── hooks/       # Custom React hooks
│   └── store/       # Zustand state stores
└── types/           # TypeScript type definitions
```

#### AI Structure
```
ai/
├── api/             # FastAPI application
├── data/            # Training datasets (CSV files)
├── models/          # Trained models, reports, visualizations
├── src/             # Training and evaluation scripts
│   ├── academic/    # Academic impact model
│   └── mental_health/ # Mental wellness and stress models
├── tests/           # AI service tests
└── utils/           # Preprocessing, validation utilities
```

## Key Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt (12 rounds)
- Email verification on registration
- Password reset via email token
- Role-based access control (user, admin)
- Rate limiting on auth endpoints

### AI Predictions
- Mental wellness score prediction (0-100 scale)
- Stress level classification (4 categories)
- Academic impact risk assessment
- Prediction history tracking
- Trend analysis and insights

### Email Notifications
- Welcome email with verification code
- Email verification confirmations
- Password reset emails
- Prediction report emails with PDF attachments
- Weekly wellness summary emails (automated via cron)
- Beautiful HTML templates with CSS animations

### Security Features
- Helmet.js security headers
- CORS configuration
- MongoDB query sanitization
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- JWT token expiration and refresh
- Secure password policies

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Predictions
- `POST /api/predictions/mental-wellness` - Get mental wellness prediction
- `POST /api/predictions/stress-level` - Get stress level prediction
- `POST /api/predictions/academic-impact` - Get academic impact prediction
- `GET /api/predictions` - Get user's prediction history
- `GET /api/predictions/:id` - Get specific prediction

### User & Profile
- `GET /api/users/dashboard` - Get dashboard data with statistics
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/statistics` - Get user statistics

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/analytics` - Get system analytics (admin only)

## Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
node test-backend.js        # Integration tests
```

### AI Service Testing
```bash
cd ai
pytest                      # Run all tests
pytest tests/test_api.py    # Test API endpoints
python -m ai.api.main       # Start FastAPI server
```

### Frontend Testing
```bash
cd frontend
npm run lint                # ESLint checks
npm run build               # Production build test
```

## Database Models

### User
- Basic info: name, email, password (hashed)
- Profile: age, gender, institution
- Authentication: isEmailVerified, isActive, role
- Timestamps: createdAt, updatedAt

### Prediction
- userId (reference to User)
- predictionType: mental_wellness, stress_level, academic_impact
- inputData: original input features
- prediction: model output
- confidence: prediction confidence score
- timestamp

### Additional Models
- StudentProfile, MentalWellnessProfile, ScreenTimeLog
- SleepRecord, SocialMediaUsage, MentalHealthAssessment
- Notification, Analytics

## Important Practices

### Error Handling
- Always use try-catch blocks for async operations
- Return meaningful error messages to clients
- Log errors with Winston (backend) or console.error (frontend)
- Use custom error classes for different error types
- Don't expose sensitive information in error messages

### Data Validation
- Validate all user inputs on both frontend and backend
- Use Zod schemas for frontend validation
- Use express-validator for backend validation
- Sanitize database queries to prevent injection
- Validate ML model inputs before prediction

### Performance
- Use MongoDB indexes on frequently queried fields
- Implement response compression
- Cache frequently accessed data
- Use pagination for large result sets
- Optimize images and assets
- Use React.memo() for expensive components

### Security
- Never commit `.env` files or secrets
- Use environment variables for all sensitive data
- Implement rate limiting on all public endpoints
- Validate and sanitize all user inputs
- Use HTTPS in production
- Set secure HTTP headers with Helmet.js
- Implement CSRF protection where needed

### Email Best Practices
- Use HTML templates with inline CSS
- Include both HTML and plain text versions
- Test emails across different clients
- Use responsive design for mobile devices
- Include unsubscribe links in marketing emails
- Handle email failures gracefully

### ML Model Best Practices
- Version your models (use timestamps in filenames)
- Save training reports and visualizations
- Validate input features before prediction
- Handle missing values appropriately
- Monitor model performance over time
- Retrain models periodically with new data

## Common Commands

### Start All Services
```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start AI Service
cd ai
python -m uvicorn api.main:app --reload --port 8000

# Terminal 3: Start Backend
cd backend
npm run dev

# Terminal 4: Start Frontend
cd frontend
npm run dev
```

### Model Training
```bash
cd ai

# Mental Wellness Model
python -m src.mental_health.train

# Stress Level Model
python -m src.mental_health.train_stress

# Academic Impact Model
python -m src.academic.train
```

### Database Operations
```bash
# Connect to MongoDB
mongosh

# Use WellSync database
use wellsync

# Common queries
db.users.find()
db.predictions.find().sort({createdAt: -1}).limit(10)
db.users.updateOne({email: "user@example.com"}, {$set: {isEmailVerified: true}})
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000  # or netstat -ano | findstr :5000 on Windows

# Kill process
kill -9 <PID>  # or taskkill /PID <PID> /F on Windows
```

#### MongoDB Connection Error
- Verify MongoDB is running: `mongosh` or check MongoDB Atlas
- Check `MONGODB_URI` in `.env` file
- Ensure network connectivity
- Check firewall settings

#### AI Service Not Responding
- Verify Python virtual environment is activated
- Check all dependencies are installed: `pip install -r requirements.txt`
- Verify models are trained and saved in correct locations
- Check AI_SERVICE_URL in backend `.env`

#### Email Sending Fails
- Verify Gmail App Password is correct (not regular password)
- Enable "Less secure app access" or use App Passwords
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- Verify SMTP settings (host, port, secure)

#### JWT Token Issues
- Verify JWT_SECRET is set in `.env`
- Check token expiration settings
- Clear browser localStorage and cookies
- Verify token format: `Bearer <token>`

### Debugging Tips
- Use Winston logger in backend instead of console.log
- Check browser console for frontend errors
- Use MongoDB Compass to inspect database
- Test API endpoints with Postman or Thunder Client
- Use React DevTools and Redux DevTools
- Enable verbose logging in development

## Documentation References

- **Quick Start**: See `QUICK_START_GUIDE.md` for initial setup
- **Backend API**: See `backend/README.md` for detailed API documentation
- **Frontend**: See `frontend/README.md` for component library and routing
- **AI/ML**: See `ai/README.md` for model details and training procedures
- **User Guide**: See `backend/USER_DOCUMENTATION.md` for end-user instructions

## Git Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Commit Message Format
```
type(scope): brief description

Detailed description if needed

- Bullet points for multiple changes
```

**Types**: feat, fix, docs, style, refactor, test, chore

### Before Committing
1. Run linters and formatters
2. Test affected functionality
3. Update documentation if needed
4. Verify no sensitive data in commits
5. Review `.gitignore` compliance

## Deployment Considerations

### Environment-Specific Settings
- Use environment variables for all configuration
- Set `NODE_ENV=production` for production
- Use strong, unique secrets for JWT and database
- Configure CORS with specific origins
- Enable HTTPS/SSL certificates
- Set up proper logging and monitoring

### Database
- Use MongoDB Atlas or managed service for production
- Enable authentication and access controls
- Set up regular backups
- Create indexes for performance
- Monitor database metrics

### AI Service
- Consider using GPU for faster inference
- Implement model caching
- Set up model versioning
- Monitor prediction latency
- Plan for model updates without downtime

## Known Issues & TODOs

### Current Limitations
- Weekly email cron job runs in server timezone (may need adjustment)
- Large prediction history can slow down dashboard (implement pagination)
- Email templates not tested on all email clients
- Model retraining requires manual trigger

### Future Enhancements
- Implement WebSocket for real-time notifications
- Add data export functionality (CSV, JSON)
- Create admin dashboard for system monitoring
- Add internationalization (i18n) support
- Implement progressive web app (PWA) features
- Add social authentication (Google, Facebook)
- Create mobile app with React Native

## Contact & Support

- **Project Supervisor**: Ms. Upeka Wijeshinghe
- **Institution**: ICBT Campus
- **License**: MIT

---

**Last Updated**: February 2026

*This document should be updated as the project evolves. All developers should review this file before making changes to the codebase.*
