# ⚡ WellSync - Quick Start Guide

Get your WellSync system up and running in 5 minutes!

---

## 📋 Prerequisites

- **Node.js** v14+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **MongoDB** v4.4+ ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Step-by-Step Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YahyaEajass05/WellSync.git
cd WellSync
```

### 2️⃣ Start MongoDB

**Windows:**
```bash
mongod
```

**Linux/Mac:**
```bash
sudo systemctl start mongodb
```

### 3️⃣ Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edit .env with your settings
# Required: MONGODB_URI, JWT_SECRET, EMAIL credentials

# Start backend server
npm start
```

**Backend will run on:** `http://localhost:5000`

### 4️⃣ Setup AI Service

```bash
# Open new terminal in WellSync directory

# Install Python dependencies
pip install -r ai/requirements.txt
pip install -r ai/src/requirements.txt

# Start AI service
python ai/api/main.py
```

**AI Service will run on:** `http://localhost:8000`

### 5️⃣ Verify Everything Works

Open new terminal and run:

```bash
# Check backend
curl http://localhost:5000/api/health

# Check AI service
curl http://localhost:8000/health
```

If both return `"status": "healthy"`, you're all set! ✅

---

## 🎯 Quick Test

### Test via API

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'

# Copy the token from response, then make a prediction
curl -X POST http://localhost:5000/api/predictions/mental-wellness \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
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

### Test via Browser

1. **Backend API Docs:** http://localhost:5000/api/health
2. **AI Service Docs:** http://localhost:8000/docs (Interactive Swagger UI)
3. **AI Service Alternative:** http://localhost:8000/redoc

---

## 📚 Next Steps

### Learn More

- **Backend Documentation:** [backend/USER_DOCUMENTATION.md](backend/USER_DOCUMENTATION.md)
- **AI Documentation:** [ai/AI_USER_DOCUMENTATION.md](ai/AI_USER_DOCUMENTATION.md)
- **Full Documentation:** [README.md](README.md)

### Test Email Service

```bash
cd backend
node send-test-email.js
```

### View Model Performance

```bash
# Check training reports
cat ai/models/mental_health/reports/training_report_*.txt
cat ai/models/academic/reports/training_report_*.txt
```

---

## 🔧 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
# Windows:
tasklist | findstr mongod

# Linux/Mac:
ps aux | grep mongod

# If not running, start it
mongod  # Windows
sudo systemctl start mongodb  # Linux/Mac
```

### Port Already in Use

```bash
# Backend (Port 5000)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9

# AI Service (Port 8000)
# Similar process for port 8000
```

### Missing Dependencies

```bash
# Backend
cd backend
npm install

# AI Service
pip install -r ai/requirements.txt
pip install -r ai/src/requirements.txt
```

---

## 🎊 You're Ready!

Your WellSync system is now running! You can:

✅ Register users and authenticate  
✅ Make mental wellness predictions  
✅ Analyze academic impact  
✅ Send email notifications  
✅ View analytics and insights  

### API URLs

- **Backend:** http://localhost:5000/api
- **AI Service:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs

---

## 📞 Need Help?

- **Documentation:** Check [USER_DOCUMENTATION.md](backend/USER_DOCUMENTATION.md)
- **Issues:** [GitHub Issues](https://github.com/YahyaEajass05/WellSync/issues)
- **Email:** support@wellsync.com

---

**Ready to build something amazing? Let's go! 🚀**
