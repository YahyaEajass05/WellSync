<div align="center">

# 🧠 WellSync

### AI-Powered Mental Wellness & Academic Performance Prediction System

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-≥16.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Jest](https://img.shields.io/badge/Jest-220_Tests_Passing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![GitHub](https://img.shields.io/badge/GitHub-WellSync-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YahyaEajass05/WellSync)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge&logo=github)](https://github.com/YahyaEajass05/WellSync/pulls)

**WellSync** is a full-stack AI-powered digital health platform designed for students and educational institutions. It uses machine learning to predict mental wellness scores, stress levels, and academic impact based on lifestyle factors including screen time, sleep quality, physical activity, and social media usage patterns.

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [AI Models](#-ai-models) • [Screenshots](#-project-structure)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [AI Models](#-ai-models)
- [Frontend Pages](#-frontend-pages)
- [Database Models](#-database-models)
- [Email Templates](#-email-templates)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [Performance](#-performance)

---

## 🌟 Project Overview

WellSync is built as a three-tier application addressing the growing need for student mental health monitoring in educational institutions. The platform collects lifestyle data through intuitive forms, processes it through trained machine learning models, and delivers actionable insights, predictions, and weekly wellness summaries.

### Key Highlights

- **3 AI Prediction Models** — Mental Wellness (R² = 0.943), Stress Level (R² = 0.837), Academic Impact (R² = 0.990)
- **< 200ms Inference** — FastAPI-powered prediction service
- **220 Backend Tests Passing** — 8 Jest test suites covering auth, users, predictions, admin, analytics, notifications, middleware & integration
- **7 Email Templates** — Beautiful HTML emails for all lifecycle events
- **Automated Weekly Reports** — node-cron powered weekly wellness summaries
- **Role-Based Access** — User and Admin roles with full admin dashboard
- **Dark/Light Mode** — Full theme support via next-themes
- **3D Animated UI** — React Three Fiber background on auth pages
- **Export Functionality** — JSON and CSV export of all user data
- **Production Branch** — Hardened for deployment with restricted CORS, TypeScript enforcement, and secure error handling

---

## ✨ Features

### For Students / Users
| Feature | Description |
|---|---|
| 🧠 Mental Wellness Prediction | AI score (0–100) from lifestyle factors |
| 😰 Stress Level Detection | 4-category classification (Low / Moderate / High / Very High) |
| 📚 Academic Impact Analysis | Social media addiction & academic risk score (2–9) |
| 📊 Personal Analytics | Trend charts, period comparisons, AI-generated insights |
| 📅 Weekly Email Reports | Automated weekly wellness summary with recommendations |
| 📁 Data Export | Download predictions as CSV or full data as JSON |
| 🔔 In-App Notifications | Real-time notifications for all platform events |
| 👤 Profile Management | Mental wellness profile, student profile, screen time & sleep logs |
| ⚙️ Settings | Theme, notification preferences, password change, account management |

### For Administrators
| Feature | Description |
|---|---|
| 🏠 Admin Dashboard | System-wide stats, charts, and real-time metrics |
| 👥 User Management | View, promote, deactivate, or delete any user |
| 📢 Broadcast Notifications | Send in-app + email notifications to all users |
| 🔍 Prediction Viewer | Browse all predictions across all users |
| 📈 System Statistics | Detailed platform usage and prediction analytics |
| 🗂️ Notification History | Full CRUD management of all platform notifications |

---

## 🏗️ Architecture

WellSync follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│           Next.js 16 (React 18, TypeScript)             │
│                  Port: 3000                              │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│   │  Auth    │ │Dashboard │ │Analytics │ │  Admin   │  │
│   │  Pages   │ │  Pages   │ │  Pages   │ │  Pages   │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (Axios)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│              Node.js + Express.js API                    │
│                    Port: 5000                            │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐  │
│  │  Auth   │ │Prediction│ │  User  │ │    Admin     │  │
│  │ Routes  │ │  Routes  │ │ Routes │ │    Routes    │  │
│  └─────────┘ └──────────┘ └────────┘ └──────────────┘  │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Middleware: Auth | Rate Limit | Validator |    │    │
│  │             Cache | Error Handler | Logger      │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │ HTTP
               ▼                      ▼
┌──────────────────┐    ┌─────────────────────────────────┐
│    DATA LAYER    │    │          AI SERVICE LAYER        │
│     MongoDB      │    │      FastAPI + scikit-learn      │
│  (Mongoose ODM)  │    │           Port: 8000             │
│                  │    │  ┌──────────┐ ┌──────────────┐  │
│  Users           │    │  │ Mental   │ │   Stress     │  │
│  Predictions     │    │  │Wellness  │ │   Level      │  │
│  Notifications   │    │  │ Model    │ │   Model      │  │
│  Analytics       │    │  └──────────┘ └──────────────┘  │
│  Profiles        │    │  ┌──────────────────────────┐   │
│  ScreenTimeLogs  │    │  │   Academic Impact Model  │   │
│  SleepRecords    │    │  └──────────────────────────┘   │
└──────────────────┘    └─────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | React framework with App Router |
| React | 18.3.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.x | Utility-first styling |
| Zustand | 4.5.x | Global state management |
| TanStack Query | 5.28.x | Server state & API caching |
| React Hook Form | 7.71.x | Form management |
| Zod | 3.x | Schema validation |
| React Three Fiber | 9.5.0 | 3D WebGL animations |
| @react-three/drei | 9.x | Three.js helpers |
| Recharts | 2.12.x | Data visualization charts |
| next-themes | 0.3.x | Dark/light mode |
| Framer Motion | 11.x | Animations |
| Sonner | 1.7.x | Toast notifications |
| Lucide React | 0.363.x | Icons |
| Axios | 1.6.x | HTTP client |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥16.0.0 | Runtime environment |
| Express.js | 4.18.x | Web framework |
| MongoDB | 4.4+ | Database |
| Mongoose | 8.0.x | ODM for MongoDB |
| JSON Web Token | 9.0.x | Authentication tokens |
| bcryptjs | 2.4.x | Password hashing (12 rounds) |
| Nodemailer | 7.x | Email sending (Gmail SMTP) |
| PDFKit | 0.17.x | PDF report generation |
| Winston | 3.11.x | Logging |
| Helmet | 7.1.x | Security headers |
| express-rate-limit | 7.1.x | Rate limiting |
| express-validator | 7.0.x | Input validation |
| express-mongo-sanitize | 2.2.x | MongoDB injection prevention |
| Morgan | 1.10.x | HTTP request logging |
| Compression | 1.7.x | Response compression |

### AI / ML Service
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.8+ | Runtime |
| FastAPI | 0.104+ | REST API framework |
| uvicorn | 0.24+ | ASGI server |
| scikit-learn | 1.3+ | ML models & preprocessing |
| pandas | 2.0+ | Data manipulation |
| numpy | 1.24+ | Numerical computing |
| joblib | 1.3+ | Model serialization |
| matplotlib | 3.7+ | Visualizations |
| seaborn | 0.12+ | Statistical plots |
| scipy | 1.11+ | Scientific computing |
| pydantic | 2.0+ | Data validation |

---

## 📁 Project Structure

```
WellSync/
├── 📂 ai/                          # Python ML service
│   ├── 📂 api/
│   │   └── main.py                 # FastAPI application (port 8000)
│   ├── 📂 data/
│   │   ├── ScreenTime_MentalWellness.csv     # 400 rows × 15 cols
│   │   └── Students_Social_Media_Addiction.csv # 705 rows × 13 cols
│   ├── 📂 models/
│   │   ├── mental_health/          # Trained wellness & stress models
│   │   │   ├── best_model.pkl
│   │   │   ├── stress_model.pkl
│   │   │   ├── reports/            # Training & evaluation reports
│   │   │   └── visualizations/     # Prediction & residual plots
│   │   └── academic/               # Trained academic impact model
│   │       ├── best_model.pkl
│   │       ├── reports/
│   │       └── visualizations/
│   ├── 📂 src/
│   │   ├── mental_health/
│   │   │   ├── preprocess.py       # Feature engineering (wellness)
│   │   │   ├── preprocess_stress.py # Feature engineering (stress)
│   │   │   ├── train.py            # Wellness model training pipeline
│   │   │   ├── train_stress.py     # Stress model training pipeline
│   │   │   ├── evaluate.py         # Model evaluation
│   │   │   └── evaluate_stress.py
│   │   └── academic/
│   │       ├── preprocess.py       # Academic feature engineering
│   │       ├── train.py            # Academic model training
│   │       └── evaluate.py
│   ├── 📂 utils/
│   │   ├── model_loader.py         # Model loading & predictor classes
│   │   ├── preprocessing.py        # Production inference preprocessing
│   │   └── validators.py           # Pydantic request/response models
│   └── requirements.txt
│
├── 📂 backend/                     # Node.js Express API (port 5000)
│   ├── 📂 config/
│   │   ├── database.js             # MongoDB connection
│   │   └── email.js                # Nodemailer transporter
│   ├── 📂 controllers/
│   │   ├── authController.js       # Register, login, verify, reset
│   │   ├── userController.js       # Profile, dashboard, account
│   │   ├── predictionController.js # All prediction CRUD + email/PDF
│   │   ├── adminController.js      # Admin dashboard, user management
│   │   ├── analyticsController.js  # Analytics generation & insights
│   │   ├── exportController.js     # CSV/JSON data export
│   │   ├── notificationController.js # Notification CRUD
│   │   └── profileController.js    # Extended profile data logging
│   ├── 📂 middleware/
│   │   ├── auth.js                 # JWT protect, authorize, optionalAuth
│   │   ├── cache.js                # In-memory response caching
│   │   ├── errorHandler.js         # Centralized error handling
│   │   ├── rateLimiter.js          # Global, auth, prediction, email limiters
│   │   ├── requestLogger.js        # Winston request/response logging
│   │   └── validator.js            # express-validator schemas
│   ├── 📂 models/
│   │   ├── User.js                 # User with auth methods
│   │   ├── Prediction.js           # Prediction with aggregations
│   │   ├── Analytics.js            # Period analytics
│   │   ├── Notification.js         # TTL-indexed notifications
│   │   ├── MentalWellnessProfile.js
│   │   ├── StudentProfile.js
│   │   ├── ScreenTimeLog.js
│   │   ├── SleepRecord.js
│   │   ├── SocialMediaUsage.js
│   │   └── MentalHealthAssessment.js
│   ├── 📂 routes/
│   │   ├── index.js                # Central router
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── predictionRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── exportRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── profileRoutes.js
│   ├── 📂 utils/
│   │   ├── aiService.js            # HTTP client for AI service
│   │   ├── emailService.js         # Email sending functions
│   │   ├── emailTemplates.js       # HTML email templates
│   │   ├── notificationService.js  # Notification creation helpers
│   │   ├── pdfGenerator.js         # PDFKit report generation
│   │   ├── scheduledTasks.js       # node-cron task initialization
│   │   ├── weeklyEmailService.js   # Weekly summary email logic
│   │   └── logger.js               # Winston logger configuration
│   ├── 📂 scripts/
│   │   └── seedAdmin.js            # Admin user seeding script
│   ├── server.js                   # Express app entry point
│   └── package.json
│
├── 📂 frontend/                    # Next.js 16 app (port 3000)
│   ├── 📂 app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Public landing page
│   │   ├── (auth)/                 # Auth route group (no sidebar)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   └── (dashboard)/            # Dashboard route group (with sidebar)
│   │       ├── dashboard/page.tsx
│   │       ├── predictions/
│   │       │   ├── page.tsx        # Prediction history
│   │       │   ├── new/page.tsx    # Prediction type selector
│   │       │   ├── mental-wellness/page.tsx
│   │       │   ├── stress/page.tsx
│   │       │   └── academic/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── profile/page.tsx
│   │       ├── settings/page.tsx
│   │       └── admin/
│   │           ├── page.tsx        # Admin overview
│   │           ├── users/[id]/page.tsx
│   │           ├── broadcast/page.tsx
│   │           ├── notifications/page.tsx
│   │           ├── predictions/page.tsx
│   │           └── stats/page.tsx
│   ├── 📂 components/
│   │   ├── layout/                 # Navbar, Sidebar, ThemeToggle, BackToHomeButton
│   │   ├── three/                  # AuthBackground (dynamic) + AuthBackgroundCanvas
│   │   ├── charts/                 # WellnessTrendChart, UserGrowthChart, PredictionTypeChart,
│   │   │                           # StressDistributionChart, ActivityHeatmap
│   │   ├── ui/                     # button, card, input, label, skeleton, confirmation-dialog,
│   │   │                           # empty-state, error-state, loading-skeleton
│   │   └── providers.tsx           # QueryClient + ThemeProvider + Toaster
│   ├── 📂 lib/
│   │   ├── api/                    # Axios API client functions per domain
│   │   ├── hooks/                  # useAuth, useAdmin, usePredictions, useAnalytics,
│   │   │                           # useDashboard, useProfile
│   │   ├── store/                  # authStore (Zustand persist), uiStore
│   │   └── constants.ts            # Shared constants (thresholds, labels)
│   ├── 📂 types/
│   │   ├── index.ts                # Domain types (User, Prediction, etc.)
│   │   └── api.ts                  # API response types
│   └── package.json
│
├── 📂 email_template_previews/     # HTML preview of all 7 email templates
├── 📂 logo/                        # WellSync logo assets
├── 📂 report/                      # Project documentation
├── .env.example                    # Environment variable template
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | ≥ 16.0.0 | [nodejs.org](https://nodejs.org/) |
| Python | ≥ 3.8 | [python.org](https://python.org/) |
| MongoDB | ≥ 4.4 | [mongodb.com](https://mongodb.com/) or [Atlas](https://cloud.mongodb.com/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### 1. Clone the Repository

```bash
git clone https://github.com/YahyaEajass05/WellSync.git
cd WellSync
```

### 2. Start MongoDB

```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas connection string in .env
```

### 3. Setup & Start the Backend (Port 5000)

```bash
cd backend
npm install

# Copy and configure environment variables
cp ../.env.example .env
# Edit .env with your MongoDB URI, JWT secret, email credentials, etc.

# Seed the admin user (first time only)
node scripts/seedAdmin.js

# Start development server
npm run dev
```

### 4. Setup & Start the AI Service (Port 8000)

```bash
cd ai
pip install -r requirements.txt

# Start the FastAPI service
python -m uvicorn api.main:app --reload --port 8000

# API docs available at:
# Swagger UI: http://localhost:8000/docs
# ReDoc:      http://localhost:8000/redoc
```

### 5. Setup & Start the Frontend (Port 3000)

```bash
cd frontend
npm install

# Copy and configure frontend environment
cp .env.local.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### 6. Verify All Services

| Service | URL | Expected Response |
|---|---|---|
| Frontend | http://localhost:3000 | Landing page |
| Backend Health | http://localhost:5000/api/health | `{ success: true }` |
| AI Service | http://localhost:8000/health | `{ status: "healthy" }` |
| AI Swagger | http://localhost:8000/docs | Interactive API docs |

### Retrain ML Models (Optional)

```bash
cd ai

# Mental Wellness Model
python -m src.mental_health.train

# Stress Level Model
python -m src.mental_health.train_stress

# Academic Impact Model
python -m src.academic.train
```

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# ─── Server ───────────────────────────────────────────────
NODE_ENV=development
PORT=5000
HOST=localhost

# ─── MongoDB ──────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/wellsync
MONGODB_TEST_URI=mongodb://localhost:27017/wellsync_test

# ─── JWT ──────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this
JWT_REFRESH_EXPIRE=30d

# ─── Email (Gmail SMTP) ───────────────────────────────────
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password   # Use App Password, not account password
EMAIL_FROM=WellSync <noreply@wellsync.com>

# ─── AI Service ───────────────────────────────────────────
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=30000

# ─── CORS ─────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000

# ─── Rate Limiting ────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# ─── Security ─────────────────────────────────────────────
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# ─── Logging ──────────────────────────────────────────────
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

For the frontend, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📡 API Reference

All API endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register new user (sends welcome + verification email) |
| `POST` | `/auth/login` | ❌ | Login, returns JWT + refresh token |
| `GET` | `/auth/me` | ✅ | Get current authenticated user |
| `POST` | `/auth/verify-email` | ❌ | Verify email with 6-digit code |
| `POST` | `/auth/resend-verification` | ✅ | Resend email verification code |
| `POST` | `/auth/forgot-password` | ❌ | Request password reset (sends email with code) |
| `POST` | `/auth/reset-password` | ❌ | Reset password with 6-digit code |
| `PUT` | `/auth/change-password` | ✅ | Change password (requires current password) |
| `POST` | `/auth/logout` | ✅ | Logout (server-side logging) |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/profile` | ✅ | Get full user profile |
| `PUT` | `/users/profile` | ✅ | Update name, profile fields, preferences |
| `GET` | `/users/dashboard` | ✅ | Dashboard data (stats, recent predictions) |
| `DELETE` | `/users/account` | ✅ | Permanently delete account (requires password) |
| `PUT` | `/users/deactivate` | ✅ | Deactivate account |

### Predictions — `/api/predictions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/predictions/mental-wellness` | ✅ | Get mental wellness score (0–100) |
| `POST` | `/predictions/stress-level` | ✅ | Get stress level prediction |
| `POST` | `/predictions/academic-impact` | ✅ | Get academic impact/addiction score |
| `GET` | `/predictions` | ✅ | Get prediction history (paginated, filterable) |
| `GET` | `/predictions/stats` | ✅ | Aggregated stats per prediction type |
| `GET` | `/predictions/trends/:type` | ✅ | Time-series scores for a type |
| `GET` | `/predictions/:id` | ✅ | Get specific prediction |
| `PUT` | `/predictions/:id` | ✅ | Update notes, tags, favourite status |
| `DELETE` | `/predictions/:id` | ✅ | Delete a prediction |
| `POST` | `/predictions/:id/email` | ✅ | Email prediction report as PDF attachment |
| `GET` | `/predictions/:id/pdf` | ✅ | Download prediction report as PDF |
| `GET` | `/predictions/examples/:type` | ❌ | Get example input payload |

### Analytics — `/api/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/analytics/insights` | ✅ | AI-generated insights from prediction history |
| `POST` | `/analytics/generate` | ✅ | Compute and save analytics for a period |
| `GET` | `/analytics/:period` | ✅ | Fetch analytics (daily/weekly/monthly/yearly) |
| `GET` | `/analytics/compare` | ✅ | Compare two date ranges |

### Profiles — `/api/profiles`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET/POST` | `/profiles/mental-wellness` | ✅ | Mental wellness profile (upsert) |
| `GET/POST` | `/profiles/student` | ✅ | Student academic profile (upsert) |
| `GET/POST` | `/profiles/screen-time` | ✅ | Daily screen time logging |
| `GET/POST` | `/profiles/sleep` | ✅ | Daily sleep record logging |
| `POST` | `/profiles/social-media` | ✅ | Social media usage logging |
| `POST` | `/profiles/mental-health-assessment` | ✅ | Mental health assessment logging |
| `GET` | `/profiles/overview` | ✅ | Combined overview of all profiles |

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | ✅ | Get notifications (paginated, filterable) |
| `GET` | `/notifications/unread-count` | ✅ | Get unread notification count |
| `PUT` | `/notifications/mark-read` | ✅ | Mark specific notifications as read |
| `PUT` | `/notifications/mark-all-read` | ✅ | Mark all notifications as read |
| `DELETE` | `/notifications/clear-read` | ✅ | Delete all read notifications |
| `DELETE` | `/notifications/:id` | ✅ | Delete specific notification |

### Export — `/api/export`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/export/data` | ✅ | Export all user data as JSON |
| `GET` | `/export/predictions/csv` | ✅ | Export predictions as CSV |
| `GET` | `/export/analytics` | ✅ | Export analytics as JSON report |

### Admin — `/api/admin` (Admin role required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | System overview: user counts, prediction stats, charts data |
| `GET` | `/admin/stats` | Detailed system statistics |
| `GET` | `/admin/users` | All users (paginated, searchable, filterable) |
| `GET` | `/admin/users/:id` | Single user details + recent predictions |
| `PUT` | `/admin/users/:id/role` | Change user role (user/admin) |
| `PUT` | `/admin/users/:id/status` | Activate or deactivate user |
| `DELETE` | `/admin/users/:id` | Delete user and all associated data |
| `GET` | `/admin/predictions` | All predictions across all users |
| `POST` | `/admin/broadcast` | Broadcast notification to all users |
| `GET` | `/admin/notifications` | All notifications (admin view) |
| `DELETE` | `/admin/notifications/:id` | Delete single notification |
| `DELETE` | `/admin/notifications/bulk` | Bulk delete notifications |

### AI Service — `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | AI service health check |
| `GET` | `/models/info` | Model metadata (R², MAE, training date) |
| `GET` | `/models/available` | List all available .pkl model files |
| `POST` | `/predict/mental-wellness` | Mental wellness inference |
| `POST` | `/predict/stress` | Stress level inference |
| `POST` | `/predict/academic-impact` | Academic impact inference |
| `GET` | `/examples/mental-wellness` | Example request payload |
| `GET` | `/examples/stress` | Example request payload |
| `GET` | `/examples/academic-impact` | Example request payload |

---

## 🤖 AI Models

### Model Overview

| Model | Algorithm | Dataset | Train R² | Test R² | MAE | Features |
|---|---|---|---|---|---|---|
| Mental Wellness | Voting Ensemble (RF+GB+ET) | ScreenTime_MentalWellness.csv | 0.9738 | **0.9426** | 4.018 | 26 |
| Stress Level | Ridge Regression (tuned) | ScreenTime_MentalWellness.csv | 0.9088 | **0.8373** | 0.612 | 36 |
| Academic Impact | Gradient Boosting (tuned) | Students_Social_Media_Addiction.csv | 0.9999 | **0.9901** | 0.048 | 26 |

### Training Pipeline (7 Stages)

```
Stage 1: Data Loading & EDA
         ↓
Stage 2: Preprocessing & Feature Engineering
         (11–14 engineered features per model)
         ↓
Stage 3: Train/Test Split (80/20, stratified)
         ↓
Stage 4: Baseline Model Comparison
         (8 algorithms: RF, GB, ET, Ridge, Lasso, ElasticNet, AdaBoost, KNN)
         ↓
Stage 5: Hyperparameter Tuning
         (GridSearchCV / RandomizedSearchCV, 5–20 iterations, 5-fold CV)
         ↓
Stage 6: Ensemble Creation
         (VotingRegressor + StackingRegressor with Ridge meta-learner)
         ↓
Stage 7: Evaluation & Artifact Saving
         (R², MAE, RMSE, MAPE + 10-fold CV + plots + reports)
```

### Input Features

#### Mental Wellness Prediction (`POST /predict/mental-wellness`)

```json
{
  "age": 25,
  "gender": "Male",
  "occupation": "Student",
  "work_mode": "Remote",
  "screen_time_hours": 8.0,
  "work_screen_hours": 4.0,
  "leisure_screen_hours": 4.0,
  "sleep_hours": 7.5,
  "sleep_quality_1_5": 3,
  "stress_level_0_10": 5,
  "productivity_0_100": 65,
  "exercise_minutes_per_week": 150,
  "social_hours_per_week": 10.0
}
```

**Response:** Wellness score (0–100) with interpretation (Poor / Below Average / Moderate / Good / Excellent)

#### Stress Level Prediction (`POST /predict/stress`)

Same 13 fields as mental wellness **plus**:
```json
{
  "mental_wellness_index_0_100": 65.0
}
```

**Response:** Stress score (0–10) with category (Low ≤3 / Moderate ≤6 / High ≤8 / Very High >8) and personalised recommendations

#### Academic Impact Prediction (`POST /predict/academic-impact`)

```json
{
  "age": 20,
  "gender": "Female",
  "academic_level": "Bachelor",
  "country": "Sri Lanka",
  "most_used_platform": "Instagram",
  "avg_daily_usage_hours": 5.0,
  "sleep_hours_per_night": 6.5,
  "mental_health_score": 6,
  "conflicts_over_social_media": 2,
  "affects_academic_performance": "Yes",
  "relationship_status": "Single"
}
```

**Response:** Addiction score (2–9) with interpretation (Low / Low-Moderate / Moderate / High Risk)

### Engineered Features

#### Mental Wellness (11 additional features)
`work_screen_ratio`, `leisure_screen_ratio`, `sleep_efficiency`, `work_life_balance`, `screen_sleep_ratio`, `health_score`, `stress_productivity_interaction`, `age_group`, `high_screen_time`, `excessive_work_screen`, polynomial terms

#### Stress Model (36 total features, 14 additional)
All 11 wellness features **plus**: `total_screen_ratio`, `sleep_deficit`, `poor_sleep_indicator`, `exercise_hours_week`, `low_exercise`, `social_isolation`, `social_exercise_score`, `low_productivity`, `productivity_wellness_gap`, `young_professional`, `overall_health_score`, `high_screen_time`, `extreme_screen_time`, polynomial terms

#### Academic Impact (14 additional features)
`usage_intensity`, `sleep_deficit`, `severe_sleep_deficit`, `mental_health_risk`, `usage_sleep_ratio`, `mental_sleep_score`, `high_conflict`, `age_group`, `poor_academic_performance`, `combined_risk_score`, `usage_squared`, `mental_health_squared`, `usage_conflict_interaction`, `uses_popular_platform`, `has_relationship`

---

## 🖥️ Frontend Pages

### Public Pages
| Page | Route | Description |
|---|---|---|
| Landing | `/` | Animated hero, features, how-it-works, testimonials |
| Login | `/login` | JWT login with email/password + 3D background |
| Register | `/register` | Account creation with email verification flow |
| Forgot Password | `/forgot-password` | Email-based password reset initiation |
| Reset Password | `/reset-password` | 6-digit code + new password form |
| Verify Email | `/verify-email` | 6-digit code verification with 60s resend cooldown |

### Dashboard Pages (Authentication Required)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Stat cards, latest predictions, recent activity |
| Predictions History | `/predictions` | Full history with search, filter, sort, delete |
| New Prediction | `/predictions/new` | Prediction type selector (3 cards) |
| Mental Wellness | `/predictions/mental-wellness` | Full prediction form + result display |
| Stress Level | `/predictions/stress` | Full prediction form + result display |
| Academic Impact | `/predictions/academic` | Full prediction form + result display |
| Analytics | `/analytics` | Charts, insights, period comparison |
| Profile | `/profile` | Multi-tab: Overview, Wellness, Student, Screen Time, Sleep |
| Settings | `/settings` | Personal info, password, theme, notifications, danger zone |

### Admin Pages (Admin Role Required)
| Page | Route | Description |
|---|---|---|
| Admin Overview | `/admin` | Charts: user growth, prediction types, stress distribution, activity heatmap |
| User Details | `/admin/users/[id]` | User info, stats, role/status management |
| Broadcast | `/admin/broadcast` | Compose and send notifications to all users |
| Notifications | `/admin/notifications` | Full CRUD notification management with bulk actions |
| Predictions | `/admin/predictions` | All platform predictions browser |
| Statistics | `/admin/stats` | Detailed system metrics and usage statistics |

---

## 🗄️ Database Models

### User
```
firstName, lastName, email (unique), password (bcrypt),
role (user/admin), isEmailVerified, isActive, isSystemAdmin,
loginAttempts, lockUntil (30-min lock after 5 failed attempts),
profile: { age, gender, occupation, country, phoneNumber, avatar },
preferences: { theme (light/dark/auto), notifications: { email, push } },
lastLogin, emailVerificationCode (6-digit, 15-min expiry),
passwordResetCode (6-digit, 15-min expiry)
Virtual: fullName
Methods: comparePassword, generateAuthToken, generateRefreshToken,
         generateEmailVerificationCode, generatePasswordResetCode,
         isLocked, incLoginAttempts, resetLoginAttempts
```

### Prediction
```
user (ref), predictionType (mental_wellness/stress_level/academic_impact),
inputData (Mixed), result: { prediction, interpretation, modelName,
confidenceMetrics: { modelR2Score, modelMAE }, inputFeaturesProcessed,
stressCategory (stress only), recommendations (stress only) },
metadata: { ipAddress, userAgent, processingTime, apiVersion },
notes, isFavorite, tags
Indexes: { user, createdAt }, { user, predictionType }, { createdAt }
Virtual: predictionAge
Static: getUserStats(userId), getPredictionTrends(userId, type, days)
```

### Analytics
```
user (ref), period (daily/weekly/monthly/yearly), periodDate,
metrics: { totalPredictions, mentalWellness, stressLevel, academicImpact,
           engagement: { activeDays, favoritePredictions, emailsSent } },
insights: [{ type, message, severity }]
Static: updateAnalytics, getAnalytics, calculateTrend
```

### Notification
```
user (ref), type (7 types), title, message, data (Mixed),
isRead, priority (low/medium/high/urgent), expiresAt (TTL auto-delete)
Indexes: { user, isRead, createdAt }, { user, type }, TTL on expiresAt
```

### Additional Models
| Model | Key Fields |
|---|---|
| `MentalWellnessProfile` | occupation, workMode, stressLevel, productivity, exerciseMinutesPerWeek, socialHoursPerWeek, chronicConditions, isSeeingTherapist, medicationUsage |
| `StudentProfile` | academicLevel, country, institution, major, gpa, yearOfStudy, financialStress, studyHoursPerWeek, attendanceRate, extracurricularActivities |
| `ScreenTimeLog` | date (unique per user), screenTimeHours, workScreenHours, leisureScreenHours, deviceTypes, appCategories, mood, eyeStrain, headache |
| `SleepRecord` | date (unique per user), sleepHours, sleepQuality, bedtime, wakeTime, sleepInterruptions, caffeine, screenBeforeSleep, mood |
| `SocialMediaUsage` | avgDailyUsageHours, mostUsedPlatform, platformsUsed, conflictsOverSocialMedia, affectsAcademicPerformance |
| `MentalHealthAssessment` | mentalHealthScore, sleepHoursPerNight, anxietyLevel, depressionLevel, stressLevel, assessmentType |

---

## 📧 Email Templates

WellSync includes 7 professional HTML email templates with responsive design and gradient branding:

| # | Template | Trigger |
|---|---|---|
| 1 | 👋 **Welcome Email** | New user registration |
| 2 | ✉️ **Email Verification** | Verify email address (6-digit code, 15-min expiry) |
| 3 | 🔒 **Password Reset** | User requests password reset (6-digit code) |
| 4 | 💚 **Mental Wellness Report** | After mental wellness prediction (with PDF attachment) |
| 5 | 😰 **Stress Level Report** | After stress level prediction (with PDF attachment) |
| 6 | 📅 **Weekly Wellness Update** | Automated weekly summary (via node-cron) |
| 7 | 🎉 **Account Activation** | After successful email verification |

Preview all templates by opening `email_template_previews/index.html` in a browser.

### Weekly Automated Email (node-cron)
The `weeklyEmailService.js` runs automatically via `scheduledTasks.js` every week to:
1. Fetch all active, verified users
2. Analyse 30-day prediction history per user
3. Calculate wellness averages and stress trends
4. Generate priority-ranked recommendations (High / Medium / Low)
5. Send personalised HTML email reports

---

## 🔐 Security

### Authentication
- **JWT tokens** with configurable expiry (default 7 days)
- **Refresh tokens** (default 30 days)
- **bcrypt** password hashing (12 rounds)
- **Account lockout** after 5 failed login attempts (30-minute lock)
- **6-digit verification codes** with 15-minute expiry for email verification and password reset

### Rate Limiting
| Limiter | Window | Max Requests | Applied To |
|---|---|---|---|
| Global API | 15 min | 100 | All routes |
| Auth | 15 min | 5 | Login, Register |
| Prediction | 1 min | 10 | Prediction endpoints |
| Email | 1 hour | 3 | Email-sending endpoints |

### Other Security Measures
- `helmet.js` — Secure HTTP headers (XSS, clickjacking, etc.)
- `express-mongo-sanitize` — MongoDB query injection prevention
- CORS restricted to `FRONTEND_URL`
- Input validation with `express-validator` on all routes
- Console output stripped in production (errors/warnings only)
- Environment variables for all secrets (never committed)

---

## 🧪 Testing

### Backend Test Suite — 220 Tests Passing ✅

All backend tests use **mocked dependencies** (MongoDB, email service, AI service, rate limiters) — no real database or network required.

#### Run All Tests
```bash
cd backend
npm test                          # Full suite (220 tests, 8 suites)
npm test -- --coverage            # With detailed coverage report
npm run test:watch                # Watch mode (re-runs on file save)
```

#### Run Individual Test Suites
```bash
# Auth tests (50 tests) — register, login, verify email, forgot/reset password
npx jest --testPathPattern=auth.test.js --no-coverage --forceExit --verbose

# User controller tests (26 tests) — dashboard, profile, account deletion
npx jest --testPathPattern=user.test.js --no-coverage --forceExit --verbose

# Prediction API tests (31 tests) — all 3 prediction types, CRUD
npx jest --testPathPattern=prediction.test.js --no-coverage --forceExit --verbose

# Admin API tests (25 tests) — user management, roles, status, broadcast
npx jest --testPathPattern=admin.test.js --no-coverage --forceExit --verbose

# Analytics tests (15 tests) — period analytics, insights, compare
npx jest --testPathPattern=analytics.test.js --no-coverage --forceExit --verbose

# Notification tests (20 tests) — list, unread count, mark read, delete
npx jest --testPathPattern=notification.test.js --no-coverage --forceExit --verbose

# Middleware tests (29 tests) — protect, authorize, errorHandler, validator
npx jest --testPathPattern=middleware.test.js --no-coverage --forceExit --verbose

# Integration tests (24 tests) — end-to-end user journey flows
npx jest --testPathPattern=integration.test.js --no-coverage --forceExit --verbose
```

#### Run a Single Test by Name
```bash
npx jest --testPathPattern=auth.test.js -t "should register a new user" --no-coverage --forceExit
```

#### Test Suite Summary
| Suite | Tests | Coverage |
|---|---|---|
| `auth.test.js` | 50 ✅ | register, login, verify-email, forgot/reset-password, change-password, logout |
| `user.test.js` | 26 ✅ | dashboard stats, profile update, prediction stats, account delete |
| `prediction.test.js` | 31 ✅ | mental-wellness, stress-level, academic-impact, list, get, delete |
| `admin.test.js` | 25 ✅ | list users, get user, role change, status toggle, delete, broadcast |
| `analytics.test.js` | 15 ✅ | insights, generate, period fetch, compare |
| `notification.test.js` | 20 ✅ | list, unread-count, mark-read, mark-all-read, clear-read, delete |
| `middleware.test.js` | 29 ✅ | protect JWT, authorize roles, errorHandler, validator chains |
| `integration.test.js` | 24 ✅ | full user journeys: register→predict→dashboard, password reset, admin flows |
| **Total** | **220 ✅** | |

> **Note:** Console error logs during test runs (e.g. "AI Service is not available") are **expected** — they are Winston logs from intentional error-path test cases. All 220 tests pass.

### AI Service Tests
```bash
cd ai
pytest                          # Run all tests
pytest tests/test_api.py        # Test FastAPI endpoints
pytest --cov=api tests/         # With coverage report
```

### Frontend Checks
```bash
cd frontend
npm run lint    # ESLint — enforce code quality
npm run build   # Production build — TypeScript + Next.js verification
```

---

## 🚢 Deployment

### Environment Setup
1. Set `NODE_ENV=production` in backend `.env`
2. Use strong, unique `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. Set `MONGODB_URI` to your MongoDB Atlas connection string
4. Configure real Gmail App Password for `EMAIL_PASSWORD`
5. Set `FRONTEND_URL` to your production domain
6. Set `AI_SERVICE_URL` to your deployed AI service URL

### Service Ports
| Service | Port | Notes |
|---|---|---|
| Frontend (Next.js) | 3000 | `npm run build && npm start` |
| Backend (Express) | 5000 | `npm start` |
| AI Service (FastAPI) | 8000 | `uvicorn api.main:app --port 8000` |

### Docker (Recommended for Production)
Each service can be containerised independently. Ensure:
- MongoDB is accessible from the backend container
- AI service is accessible from the backend container
- Backend is accessible from the frontend container

### Startup Order
```
1. MongoDB
2. AI Service (FastAPI)
3. Backend (Express)
4. Frontend (Next.js)
```

---

## 🤝 Contributing

### Git Workflow

```bash
# Branch naming
git checkout -b feature/my-new-feature
git checkout -b bugfix/fix-issue-name
git checkout -b hotfix/urgent-fix
```

### Commit Message Format

```
type(scope): brief description

Detailed description if needed

- Bullet points for multiple changes
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Before Committing
1. Run linters: `npm run lint` (frontend), `npm test` (backend)
2. Test affected functionality locally
3. Update documentation if APIs changed
4. Verify no secrets in commits
5. Check `.gitignore` compliance

### Branches
| Branch | Purpose |
|---|---|
| `main` | Production-ready — fully merged, all tests passing |
| `production` | Pre-production hardening & security hardening |
| `testing` | Full backend test suite (220 tests, 10 commits) |
| `Development` | Active development branch |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |
| `hotfix/*` | Urgent production fixes |

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000 && kill -9 <PID>
```

**MongoDB connection error:**
- Verify MongoDB is running: `mongosh`
- Check `MONGODB_URI` in `.env`
- For Atlas: whitelist your IP in Network Access

**AI service not responding:**
- Activate Python virtual environment
- Verify all models are trained: check `ai/models/` for `.pkl` files
- Check `AI_SERVICE_URL` in backend `.env`
- Run `python -m uvicorn api.main:app --reload --port 8000`

**Email sending fails:**
- Use Gmail **App Password** (not account password)
- Enable 2FA on Gmail account, then generate App Password
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

**Three.js/Auth page error (`ReactCurrentOwner`):**
- Fixed in latest build — ensure `@react-three/fiber` is v9.5.0+
- Run `npm install @react-three/fiber@latest --legacy-peer-deps`

**Theme preference not saving:**
- Ensure backend and frontend are both updated to latest code
- Backend uses `$set` with dot notation for nested preference updates
- Frontend uses `next-themes`' `useTheme` hook for theme application

---

## 📊 Performance

### AI Model Inference
- Mental Wellness: ~20–50ms
- Stress Level: ~10–30ms
- Academic Impact: ~20–50ms

### Backend Optimisations
- In-memory response caching (`cache.js`) — short (5min), medium (15min), long (1hr)
- Response compression via `compression` middleware
- MongoDB indexes on all frequently queried fields (`{user, createdAt}`, `{user, predictionType}`)
- Pagination for all list endpoints

### Frontend Optimisations
- `optimizePackageImports` for `lucide-react` and `recharts`
- `transpilePackages` for Three.js ecosystem
- React Query with `staleTime: 60s` to minimise unnecessary API calls
- `ssr: false` for Three.js components (prevents SSR overhead)
- `React.memo()` and lazy loading for expensive components

---

## 📦 Branch Structure

| Branch | Purpose | Status |
|---|---|---|
| `main` | Production-ready — all branches merged | ✅ Up to date |
| `production` | Pre-production hardening & security fixes | ✅ Merged into main |
| `testing` | All 220 backend tests + 10-commit test history | ✅ Merged into main |
| `Development` | Feature development & bug fixes | ✅ Merged into main |

---

## 📊 Datasets

- **ScreenTime_MentalWellness.csv** — 400 student records with lifestyle metrics, screen time patterns, and wellness scores (15 columns)
- **Students_Social_Media_Addiction.csv** — 705 student records with social media usage, academic performance, and mental health data (13 columns)

---

<div align="center">

**Built with ❤️ for student mental wellness**

*WellSync — Sync your mind, sync your life.*

[![GitHub Stars](https://img.shields.io/github/stars/YahyaEajass05/WellSync?style=social)](https://github.com/YahyaEajass05/WellSync/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/YahyaEajass05/WellSync?style=social)](https://github.com/YahyaEajass05/WellSync/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/YahyaEajass05/WellSync?style=flat-square)](https://github.com/YahyaEajass05/WellSync/issues)
[![GitHub](https://img.shields.io/badge/GitHub-YahyaEajass05-181717?style=flat-square&logo=github)](https://github.com/YahyaEajass05/WellSync)

</div>
