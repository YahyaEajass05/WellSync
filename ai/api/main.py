"""
WellSync AI API
FastAPI endpoints for Mental Wellness and Academic Impact predictions
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import sys
import os
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from ai.utils.model_loader import (
    ModelLoader, 
    MentalWellnessPredictor, 
    AcademicImpactPredictor,
    StressPredictionPredictor,
    get_available_models
)
from ai.utils.validators import (
    MentalWellnessInput,
    AcademicImpactInput,
    StressPredictionInput,
    PredictionResponse,
    ModelInfo
)

mental_wellness_predictor = None
academic_impact_predictor = None
stress_prediction_predictor = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup using modern lifespan handler"""
    global mental_wellness_predictor, academic_impact_predictor, stress_prediction_predictor

    try:
        print("\nLoading Mental Wellness Model...")
        mental_wellness_predictor = MentalWellnessPredictor()
        print("Mental Wellness Model Loaded")

        print("\nLoading Academic Impact Model...")
        academic_impact_predictor = AcademicImpactPredictor()
        print("Academic Impact Model Loaded")

        print("\nLoading Stress Prediction Model...")
        try:
            stress_prediction_predictor = StressPredictionPredictor()
            print("Stress Prediction Model Loaded")
        except FileNotFoundError:
            print("Stress Prediction Model not found (run training first)")

        print("\nAll available models loaded successfully!\n")
    except Exception as e:
        print(f"\nError loading models: {e}\n")

    yield  # Application runs here

    print("\nShutting down WellSync AI API...")


app = FastAPI(
    title="WellSync AI API",
    description="Dual Machine Learning System for Mental Wellness and Academic Impact Prediction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API information"""
    return {
        "message": "WellSync AI API",
        "version": "1.0.0",
        "models": {
            "mental_wellness": {
                "status": "loaded" if mental_wellness_predictor else "not loaded",
                "endpoint": "/predict/mental-wellness"
            },
            "academic_impact": {
                "status": "loaded" if academic_impact_predictor else "not loaded",
                "endpoint": "/predict/academic-impact"
            },
            "stress_prediction": {
                "status": "loaded" if stress_prediction_predictor else "not loaded",
                "endpoint": "/predict/stress"
            }
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models": {
            "mental_wellness": "ready" if mental_wellness_predictor else "not ready",
            "academic_impact": "ready" if academic_impact_predictor else "not ready",
            "stress_prediction": "ready" if stress_prediction_predictor else "not ready"
        }
    }


@app.get("/models/info", tags=["Models"])
async def get_models_info():
    """Get information about all loaded models"""
    try:
        mental_info = mental_wellness_predictor.loader.get_model_info() if mental_wellness_predictor else None
        academic_info = academic_impact_predictor.loader.get_model_info() if academic_impact_predictor else None
        
        return {
            "mental_wellness": mental_info,
            "academic_impact": academic_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")


@app.get("/models/available", tags=["Models"])
async def get_available_models_endpoint():
    """Get list of all available trained models"""
    try:
        return get_available_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing models: {str(e)}")


@app.post("/predict/mental-wellness", response_model=Dict[str, Any], tags=["Predictions"])
async def predict_mental_wellness(input_data: MentalWellnessInput):
    """Predict mental wellness score from lifestyle and screen time data"""
    try:
        if not mental_wellness_predictor:
            raise HTTPException(
                status_code=503, 
                detail="Mental Wellness model not loaded"
            )
        
        # Convert input to dict
        input_dict = input_data.model_dump()
        
        # Make prediction
        result = mental_wellness_predictor.predict(input_dict)
        
        return result
        
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/academic-impact", response_model=Dict[str, Any], tags=["Predictions"])
async def predict_academic_impact(input_data: AcademicImpactInput):
    """Predict social media addiction score and academic impact"""
    try:
        if not academic_impact_predictor:
            raise HTTPException(
                status_code=503,
                detail="Academic Impact model not loaded"
            )
        
        # Convert input to dict
        input_dict = input_data.model_dump()
        
        # Make prediction
        result = academic_impact_predictor.predict(input_dict)
        
        return result
        
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/examples/mental-wellness", tags=["Examples"])
async def get_mental_wellness_example():
    """Get example input for mental wellness prediction"""
    return {
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
        }
    }


@app.get("/examples/academic-impact", tags=["Examples"])
async def get_academic_impact_example():
    """Get example input for academic impact prediction"""
    return {
        "example": {
            "age": 21,
            "gender": "Female",
            "academic_level": "Bachelor",
            "country": "USA",
            "most_used_platform": "Instagram",
            "avg_daily_usage_hours": 4.5,
            "sleep_hours_per_night": 6.5,
            "mental_health_score": 60,
            "conflicts_over_social_media": 2,
            "affects_academic_performance": "Yes",
            "relationship_status": "Single"
        }
    }


@app.post("/predict/stress", response_model=Dict[str, Any], tags=["Predictions"])
async def predict_stress_level(input_data: StressPredictionInput):
    """Predict stress level from lifestyle and behavioral data"""
    try:
        if not stress_prediction_predictor:
            raise HTTPException(
                status_code=503, 
                detail="Stress Prediction model not loaded. Please run the stress model training script first."
            )
        
        # Convert input to dict
        input_dict = input_data.model_dump()
        
        # Make prediction
        result = stress_prediction_predictor.predict(input_dict)
        
        return result
        
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/examples/stress", tags=["Examples"])
async def get_stress_prediction_example():
    """Get example input for stress level prediction"""
    return {
        "example": {
            "age": 28,
            "gender": "Male",
            "occupation": "Software Engineer",
            "work_mode": "Hybrid",
            "screen_time_hours": 9.5,
            "work_screen_hours": 7.0,
            "leisure_screen_hours": 2.5,
            "sleep_hours": 6.5,
            "sleep_quality_1_5": 3,
            "productivity_0_100": 65,
            "exercise_minutes_per_week": 120,
            "social_hours_per_week": 8.0,
            "mental_wellness_index_0_100": 55.0
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler - never expose internal details in production"""
    import logging
    logging.getLogger("wellsync.ai").error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "An internal server error occurred. Please try again later.",
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*80)
    print("🚀 Starting WellSync AI API Server")
    print("="*80)
    print("\n📚 Documentation available at:")
    print("   • Swagger UI: http://localhost:8000/docs")
    print("   • ReDoc: http://localhost:8000/redoc")
    print("\n🔗 Endpoints:")
    print("   • GET  /health - Health check")
    print("   • GET  /models/info - Model information")
    print("   • POST /predict/mental-wellness - Mental wellness prediction")
    print("   • POST /predict/academic-impact - Academic impact prediction")
    print("   • POST /predict/stress - Stress level prediction")
    print("\n" + "="*80 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
