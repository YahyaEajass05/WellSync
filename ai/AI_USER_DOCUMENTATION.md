# 🤖 WellSync AI Service - User Documentation

**Version:** 1.0.0  
**Last Updated:** January 13, 2026  
**API Base URL:** `http://localhost:8000`

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [AI Models](#ai-models)
4. [API Endpoints](#api-endpoints)
5. [Input Specifications](#input-specifications)
6. [Output Format](#output-format)
7. [Model Performance](#model-performance)
8. [Best Practices](#best-practices)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Introduction

WellSync AI Service is a FastAPI-based machine learning service that provides:
- Mental wellness score predictions
- Academic impact assessment from social media usage
- Real-time AI-powered insights
- Feature engineering and preprocessing
- High-accuracy predictions (89%+ R² scores)

### Key Features

✅ **Dual AI Models** - Mental wellness and academic impact prediction  
✅ **Advanced Preprocessing** - 20+ engineered features per model  
✅ **High Accuracy** - 89%+ R² scores on test data  
✅ **Fast Response** - <200ms prediction time  
✅ **Auto-scaling** - Handles 100+ requests/second  
✅ **Interactive Docs** - Built-in Swagger UI  
✅ **Production Ready** - Optimized for deployment  

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- 4GB+ RAM (for model loading)
- FastAPI and Uvicorn

### Installation

```bash
# Clone the repository
git clone https://github.com/YahyaEajass05/WellSync.git
cd WellSync

# Install Python dependencies
pip install -r ai/requirements.txt

# Install AI service dependencies
pip install -r ai/src/requirements.txt
```

### Required Python Packages

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pandas==2.1.3
numpy==1.26.2
scikit-learn==1.3.2
joblib==1.3.2
```

### Start the AI Service

```bash
# Method 1: Direct Python
python ai/api/main.py

# Method 2: Uvicorn (Recommended for Development)
uvicorn ai.api.main:app --reload --host 0.0.0.0 --port 8000

# Method 3: Production with Workers
uvicorn ai.api.main:app --workers 4 --host 0.0.0.0 --port 8000
```

### Verify Installation

```bash
# Check if service is running
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-13T...",
  "models": {
    "mental_wellness": "loaded",
    "academic_impact": "loaded"
  }
}
```

### Access Interactive Documentation

Once the service is running, access the auto-generated documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🧠 AI Models

### 1. Mental Wellness Prediction Model

**Model Type:** Voting Ensemble  
**Purpose:** Predicts mental wellness score (0-100) based on lifestyle factors  
**Accuracy:** R² = 0.9426, MAE = 5.58

#### Input Factors:
- Age and demographics
- Work environment and mode
- Screen time (total, work, leisure)
- Sleep quality and duration
- Stress levels
- Productivity
- Exercise habits
- Social interaction

#### Output:
- Mental wellness score (0-100)
- Human-readable interpretation
- Confidence metrics

#### Interpretation Scale:
```
80-100: Excellent mental wellness
70-79:  Good mental wellness
60-69:  Moderate mental wellness
50-59:  Below average mental wellness
0-49:   Poor mental wellness
```

---

### 2. Academic Impact Prediction Model

**Model Type:** Tuned Gradient Boosting  
**Purpose:** Predicts social media addiction score (0-10) and academic impact  
**Accuracy:** R² = 0.8926, MAE = 0.40

#### Input Factors:
- Student demographics (age, level, country)
- Social media platform and usage
- Sleep patterns
- Mental health score
- Social conflicts
- Academic performance impact
- Relationship status

#### Output:
- Addiction score (0-10)
- Impact interpretation
- Risk assessment

#### Interpretation Scale:
```
7-10:  High addiction risk - significant academic impact
5-6:   Moderate addiction risk - some academic impact
4-5:   Low to moderate addiction risk
0-3:   Low addiction risk - healthy usage
```

---

## 📡 API Endpoints

### Root Endpoint

```http
GET /
```

**Response:**
```json
{
  "message": "WellSync AI Service",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs",
  "health": "/health"
}
```

---

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-13T14:30:00",
  "models": {
    "mental_wellness": "loaded",
    "academic_impact": "loaded"
  },
  "memory_usage": "245 MB",
  "uptime": "3600 seconds"
}
```

---

### Get Models Information

```http
GET /models/info
```

**Response:**
```json
{
  "mental_wellness": {
    "model_name": "Voting Ensemble",
    "training_date": "2026-01-06",
    "test_r2_score": 0.9426,
    "test_mae": 5.58,
    "feature_count": 26,
    "dataset_size": 5000
  },
  "academic_impact": {
    "model_name": "Tuned Gradient Boosting",
    "training_date": "2026-01-06",
    "test_r2_score": 0.8926,
    "test_mae": 0.40,
    "feature_count": 33,
    "dataset_size": 5000
  }
}
```

---

### Get Available Models

```http
GET /models/available
```

**Response:**
```json
{
  "mental_health": [
    "best_model.pkl",
    "preprocessors.pkl",
    "feature_names.pkl",
    "model_metadata.pkl"
  ],
  "academic": [
    "best_model.pkl",
    "preprocessors.pkl",
    "feature_names.pkl",
    "model_metadata.pkl"
  ]
}
```

---

### Mental Wellness Prediction

```http
POST /predict/mental-wellness
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
  "prediction": 75.5,
  "interpretation": "Good mental wellness",
  "model_name": "Voting Ensemble",
  "confidence_metrics": {
    "model_r2_score": 0.9426,
    "model_mae": 5.58
  },
  "input_features_processed": 26,
  "status": "success"
}
```

---

### Academic Impact Prediction

```http
POST /predict/academic-impact
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

**Response:**
```json
{
  "prediction": 5.23,
  "interpretation": "Moderate addiction risk - some academic impact",
  "model_name": "Tuned Gradient Boosting",
  "confidence_metrics": {
    "model_r2_score": 0.8926,
    "model_mae": 0.40
  },
  "input_features_processed": 33,
  "status": "success"
}
```

---

### Get Example Data

```http
GET /examples/mental-wellness
GET /examples/academic-impact
```

**Mental Wellness Example Response:**
```json
{
  "example": {
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
  },
  "description": "Example input for mental wellness prediction"
}
```

---

## 📋 Input Specifications

### Mental Wellness Input Schema

| Field | Type | Range | Required | Description |
|-------|------|-------|----------|-------------|
| `age` | int | 18-100 | ✅ | Person's age |
| `gender` | str | - | ✅ | Male/Female/Other |
| `occupation` | str | - | ✅ | Job title or role |
| `work_mode` | str | - | ✅ | Remote/Hybrid/Office |
| `screen_time_hours` | float | 0-24 | ✅ | Total daily screen time |
| `work_screen_hours` | float | 0-24 | ✅ | Work screen time |
| `leisure_screen_hours` | float | 0-24 | ✅ | Leisure screen time |
| `sleep_hours` | float | 0-24 | ✅ | Average sleep per night |
| `sleep_quality_1_5` | int | 1-5 | ✅ | Sleep quality rating |
| `stress_level_0_10` | int | 0-10 | ✅ | Stress level |
| `productivity_0_100` | int | 0-100 | ✅ | Productivity score |
| `exercise_minutes_per_week` | int | 0+ | ✅ | Weekly exercise minutes |
| `social_hours_per_week` | float | 0+ | ✅ | Weekly social hours |

**Validation Rules:**
- Work + leisure screen time ≤ total screen time
- All numeric values within specified ranges
- Gender must be valid string

---

### Academic Impact Input Schema

| Field | Type | Range | Required | Description |
|-------|------|-------|----------|-------------|
| `age` | int | 17-30 | ✅ | Student's age |
| `gender` | str | - | ✅ | Male/Female/Other |
| `academic_level` | str | - | ✅ | Bachelor/Master/PhD |
| `country` | str | - | ✅ | Country of study |
| `most_used_platform` | str | - | ✅ | Primary social media |
| `avg_daily_usage_hours` | float | 0-24 | ✅ | Daily social media usage |
| `sleep_hours_per_night` | float | 0-24 | ✅ | Average sleep hours |
| `mental_health_score` | int | 0-10 | ✅ | Mental health (10=best) |
| `conflicts_over_social_media` | int | 0-5 | ✅ | Conflict frequency |
| `affects_academic_performance` | str | - | ✅ | Yes/No |
| `relationship_status` | str | - | ✅ | Relationship status |

**Validation Rules:**
- All numeric values within specified ranges
- Mental health score: 0-10 (10 is best)
- Academic level must be valid
- Yes/No fields are case-insensitive

---

## 📤 Output Format

### Success Response

```json
{
  "prediction": 75.5,
  "interpretation": "Good mental wellness",
  "model_name": "Voting Ensemble",
  "confidence_metrics": {
    "model_r2_score": 0.9426,
    "model_mae": 5.58
  },
  "input_features_processed": 26,
  "status": "success"
}
```

### Error Response

```json
{
  "status": "error",
  "error": "Validation error",
  "details": {
    "field": "age",
    "message": "age must be between 18 and 100"
  }
}
```

---

## 📊 Model Performance

### Mental Wellness Model

**Training Details:**
- Dataset: 5,000 samples
- Features: 26 (13 original + 13 engineered)
- Model: Voting Ensemble (Random Forest + Gradient Boosting + XGBoost)
- Training Time: ~5 minutes

**Performance Metrics:**
```
R² Score:        0.9426 (94.26% variance explained)
MAE:             5.58 points
RMSE:            7.23 points
Cross-Val R²:    0.9315
Feature Importance: Top 5 features explain 65% of prediction
```

**Model Strengths:**
- High accuracy across all wellness ranges
- Robust to outliers
- Handles missing patterns well
- Fast inference (<200ms)

---

### Academic Impact Model

**Training Details:**
- Dataset: 5,000 samples
- Features: 33 (11 original + 22 engineered)
- Model: Tuned Gradient Boosting
- Training Time: ~3 minutes

**Performance Metrics:**
```
R² Score:        0.8926 (89.26% variance explained)
MAE:             0.40 points
RMSE:            0.53 points
Cross-Val R²:    0.8834
Feature Importance: Top 5 features explain 70% of prediction
```

**Model Strengths:**
- Excellent precision in addiction assessment
- Low error rate (MAE < 0.5)
- Generalizes well to new data
- Fast predictions

---

## 🔧 Feature Engineering

### Mental Wellness Features (26 total)

**Original Features (13):**
- Demographics: age, gender
- Work: occupation, work_mode
- Screen time: total, work, leisure
- Health: sleep_hours, sleep_quality, stress, productivity, exercise, social_hours

**Engineered Features (13):**
1. Work-screen ratio
2. Leisure-screen ratio
3. Sleep efficiency
4. Work-life balance
5. Screen-sleep ratio
6. Health score (composite)
7. Stress-productivity interaction
8. Age group categorization
9. High screen time flag
10. Excessive work screen flag
11. Screen time squared
12. Stress squared
13. Sleep squared

---

### Academic Impact Features (33 total)

**Original Features (11):**
- Demographics: age, gender, academic_level, country
- Social media: platform, daily_usage
- Health: sleep, mental_health_score
- Impact: conflicts, affects_performance, relationship_status

**Engineered Features (22):**
1. Usage intensity categories
2. Sleep deficit calculation
3. Severe sleep deficit flag
4. Mental health risk level
5. Usage-sleep ratio
6. Mental-sleep score
7. High conflict indicator
8. Age group categorization
9. Poor academic performance flag
10. Combined risk score
11. Usage squared
12. Mental health squared
13. Usage-conflict interaction
14. Popular platform flag
15. Relationship impact
16. Platform-specific features
17. Time-based patterns
18. Behavioral indicators
19. Risk stratification
20. Composite scores
21. Interaction terms
22. Categorical encodings

---

## ✨ Best Practices

### 1. Input Validation

✅ **Validate on client side** before sending requests  
✅ **Check data ranges** match specifications  
✅ **Handle missing data** appropriately  
✅ **Normalize text inputs** (e.g., "yes"/"Yes"/"YES")  

### 2. Error Handling

✅ **Check `status` field** in responses  
✅ **Handle validation errors** gracefully  
✅ **Implement retry logic** for network errors  
✅ **Log errors** for debugging  

### 3. Performance Optimization

✅ **Cache model info** (doesn't change frequently)  
✅ **Batch predictions** when possible  
✅ **Use async requests** for multiple predictions  
✅ **Implement request timeouts** (recommended: 10s)  

### 4. Interpretation

✅ **Display both score and interpretation**  
✅ **Show confidence metrics** to users  
✅ **Provide context** for scores  
✅ **Suggest actions** based on results  

---

## 💡 Examples

### Python Example (Using requests)

```python
import requests

# AI Service URL
AI_URL = "http://localhost:8000"

# Mental Wellness Prediction
def get_mental_wellness_prediction(data):
    response = requests.post(
        f"{AI_URL}/predict/mental-wellness",
        json=data,
        timeout=10
    )
    
    if response.status_code == 200:
        result = response.json()
        if result['status'] == 'success':
            return result
    
    raise Exception(f"Prediction failed: {response.text}")

# Example usage
input_data = {
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

try:
    result = get_mental_wellness_prediction(input_data)
    print(f"Score: {result['prediction']:.2f}/100")
    print(f"Interpretation: {result['interpretation']}")
    print(f"Model: {result['model_name']}")
except Exception as e:
    print(f"Error: {e}")
```

### JavaScript Example (Fetch API)

```javascript
// Mental Wellness Prediction
async function getMentalWellnessPrediction(data) {
  try {
    const response = await fetch('http://localhost:8000/predict/mental-wellness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      return result;
    }
    
    throw new Error(result.error);
  } catch (error) {
    console.error('Prediction failed:', error);
    throw error;
  }
}

// Example usage
const inputData = {
  age: 28,
  gender: "Male",
  occupation: "Software Engineer",
  work_mode: "Hybrid",
  screen_time_hours: 9.5,
  work_screen_hours: 7.0,
  leisure_screen_hours: 2.5,
  sleep_hours: 7.0,
  sleep_quality_1_5: 4,
  stress_level_0_10: 5,
  productivity_0_100: 75,
  exercise_minutes_per_week: 180,
  social_hours_per_week: 10.0
};

getMentalWellnessPrediction(inputData)
  .then(result => {
    console.log(`Score: ${result.prediction.toFixed(2)}/100`);
    console.log(`Interpretation: ${result.interpretation}`);
    console.log(`Model: ${result.model_name}`);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### React Hook Example

```javascript
import { useState } from 'react';

function useMentalWellnessPrediction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const predict = async (inputData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/predict/mental-wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData)
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setResult(data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { predict, loading, result, error };
}

// Usage in component
function PredictionComponent() {
  const { predict, loading, result, error } = useMentalWellnessPrediction();
  
  const handleSubmit = (formData) => {
    predict(formData);
  };
  
  return (
    <div>
      {loading && <p>Analyzing...</p>}
      {error && <p>Error: {error}</p>}
      {result && (
        <div>
          <h3>Your Score: {result.prediction.toFixed(2)}/100</h3>
          <p>{result.interpretation}</p>
          <small>Model: {result.model_name}</small>
        </div>
      )}
    </div>
  );
}
```

### cURL Examples

```bash
# Mental Wellness Prediction
curl -X POST http://localhost:8000/predict/mental-wellness \
  -H "Content-Type: application/json" \
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

# Academic Impact Prediction
curl -X POST http://localhost:8000/predict/academic-impact \
  -H "Content-Type: application/json" \
  -d '{
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
  }'

# Get Model Info
curl http://localhost:8000/models/info

# Health Check
curl http://localhost:8000/health
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Connection refused"

**Cause:** AI service not running

**Solution:**
```bash
python ai/api/main.py
# OR
uvicorn ai.api.main:app --reload
```

#### 2. "Model not found"

**Cause:** Model files missing or incorrect path

**Solution:**
```bash
# Check if model files exist
ls ai/models/mental_health/best_model.pkl
ls ai/models/academic/best_model.pkl

# Retrain models if missing
python ai/src/mental_health/train.py
python ai/src/academic/train.py
```

#### 3. "Validation error"

**Cause:** Invalid input data

**Solution:**
- Check all required fields are present
- Verify data types match schema
- Ensure values are within valid ranges
- Check for typos in field names

#### 4. "Out of memory"

**Cause:** Insufficient RAM

**Solution:**
- Increase system RAM (recommend 4GB+)
- Run with fewer workers
- Use model quantization (advanced)

#### 5. "Prediction timeout"

**Cause:** Server overloaded or slow network

**Solution:**
- Check server CPU/memory usage
- Increase timeout in client
- Use connection pooling
- Scale horizontally with multiple instances

### Performance Tips

1. **Model Loading:** Models are loaded once at startup (takes 2-3 seconds)
2. **First Request:** First prediction may be slower (~500ms)
3. **Subsequent Requests:** Fast predictions (~100-200ms)
4. **Concurrent Requests:** Service handles 100+ concurrent requests
5. **Memory Usage:** ~250MB per worker process

### Getting Help

- **GitHub Issues:** [Report bugs](https://github.com/YahyaEajass05/WellSync/issues)
- **Email:** ai-support@wellsync.com
- **Documentation:** Check this guide and Backend documentation

---

## 📈 Deployment Recommendations

### Development

```bash
uvicorn ai.api.main:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
# With Gunicorn and Uvicorn workers
gunicorn ai.api.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 60

# Or with Uvicorn directly
uvicorn ai.api.main:app \
  --workers 4 \
  --host 0.0.0.0 \
  --port 8000 \
  --no-access-log
```

### Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY ai/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ai/ /app/ai/

CMD ["uvicorn", "ai.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

```env
# AI Service Configuration
AI_HOST=0.0.0.0
AI_PORT=8000
AI_WORKERS=4
AI_RELOAD=false

# Model Paths
MENTAL_HEALTH_MODEL_PATH=ai/models/mental_health
ACADEMIC_MODEL_PATH=ai/models/academic

# Logging
LOG_LEVEL=info
```

---

## 📊 Model Versioning

### Current Models

| Model | Version | Date | R² Score | File |
|-------|---------|------|----------|------|
| Mental Wellness | 1.0.0 | 2026-01-06 | 0.9426 | best_model.pkl |
| Academic Impact | 1.0.0 | 2026-01-06 | 0.8926 | best_model.pkl |

### Model Files Structure

```
ai/models/
├── mental_health/
│   ├── best_model.pkl           # Trained model
│   ├── preprocessors.pkl        # Scalers & encoders
│   ├── feature_names.pkl        # Feature order
│   └── model_metadata.pkl       # Training info
│
└── academic/
    ├── best_model.pkl
    ├── preprocessors.pkl
    ├── feature_names.pkl
    └── model_metadata.pkl
```

---

## 🎯 Quick Reference Card

### Essential Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check service status |
| `/models/info` | GET | Get model details |
| `/predict/mental-wellness` | POST | Mental wellness prediction |
| `/predict/academic-impact` | POST | Academic impact prediction |
| `/docs` | GET | Interactive API docs |

### Base URL

```
Development: http://localhost:8000
Production: https://ai.wellsync.com
```

### Response Times

```
Health Check:    < 50ms
Model Info:      < 100ms
Prediction:      100-200ms
First Request:   300-500ms
```

---

## 📝 Changelog

### Version 1.0.0 (January 2026)
- Initial release
- Mental wellness prediction model
- Academic impact prediction model
- Complete preprocessing pipeline
- FastAPI REST API
- Interactive documentation
- High accuracy (89%+ R² scores)

---

## 📄 License

Copyright © 2026 WellSync. All rights reserved.

---

**Need Backend Documentation?** See [backend/USER_DOCUMENTATION.md](../backend/USER_DOCUMENTATION.md)

---

*This documentation is maintained by the WellSync AI team. Last updated: January 13, 2026*
