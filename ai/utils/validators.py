"""
Input Validation Utilities
Validates input data for model predictions
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field, validator


class MentalWellnessInput(BaseModel):
    """Input schema for Mental Wellness prediction"""
    
    age: int = Field(..., ge=18, le=100, description="Age of the person")
    gender: str = Field(..., description="Gender (Male/Female/Other)")
    occupation: str = Field(..., description="Occupation type")
    work_mode: str = Field(..., description="Work mode (Remote/Hybrid/Office)")
    screen_time_hours: float = Field(..., ge=0, le=24, description="Total daily screen time in hours")
    work_screen_hours: float = Field(..., ge=0, le=24, description="Work-related screen time")
    leisure_screen_hours: float = Field(..., ge=0, le=24, description="Leisure screen time")
    sleep_hours: float = Field(..., ge=0, le=24, description="Average sleep hours per night")
    sleep_quality_1_5: int = Field(..., ge=1, le=5, description="Sleep quality rating (1-5)")
    stress_level_0_10: int = Field(..., ge=0, le=10, description="Stress level (0-10)")
    productivity_0_100: int = Field(..., ge=0, le=100, description="Productivity score (0-100)")
    exercise_minutes_per_week: int = Field(..., ge=0, description="Weekly exercise in minutes")
    social_hours_per_week: float = Field(..., ge=0, description="Weekly social interaction hours")
    
    @validator('work_screen_hours', 'leisure_screen_hours')
    def validate_screen_time_breakdown(cls, v, values):
        if 'screen_time_hours' in values:
            total = values.get('screen_time_hours', 0)
            if v > total:
                raise ValueError(f"Screen time component cannot exceed total screen time")
        return v
    
    class Config:
        json_schema_extra = {
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


class AcademicImpactInput(BaseModel):
    """Input schema for Academic Impact prediction"""
    
    age: int = Field(..., ge=17, le=30, description="Student age")
    gender: str = Field(..., description="Gender (Male/Female/Other)")
    academic_level: str = Field(..., description="Academic level (Bachelor/Master/PhD)")
    country: str = Field(..., description="Country of study")
    most_used_platform: str = Field(..., description="Most used social media platform")
    avg_daily_usage_hours: float = Field(..., ge=0, le=24, description="Average daily social media usage")
    sleep_hours_per_night: float = Field(..., ge=0, le=24, description="Average sleep hours")
    mental_health_score: int = Field(..., ge=0, le=10, description="Mental health score (0-10, 10 is best)")
    conflicts_over_social_media: int = Field(..., ge=0, le=5, description="Conflicts frequency (0-5)")
    affects_academic_performance: str = Field(..., description="Does it affect academics? (Yes/No)")
    relationship_status: str = Field(..., description="Relationship status")
    
    @validator('mental_health_score')
    def validate_mental_health(cls, v):
        if v < 0 or v > 10:
            raise ValueError("Mental health score must be between 0 and 10")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
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
        }


class PredictionResponse(BaseModel):
    """Response schema for predictions"""
    
    prediction: float = Field(..., description="Predicted value")
    confidence: float = Field(None, description="Prediction confidence (if available)")
    model_used: str = Field(..., description="Model name used for prediction")
    features_used: int = Field(..., description="Number of features used")
    interpretation: str = Field(None, description="Human-readable interpretation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prediction": 65.5,
                "confidence": 0.94,
                "model_used": "Voting Ensemble",
                "features_used": 26,
                "interpretation": "Good mental wellness predicted"
            }
        }


class ModelInfo(BaseModel):
    """Model information schema"""
    
    model_type: str
    model_name: str
    training_date: str
    test_r2_score: float
    test_mae: float
    feature_count: int
    dataset_size: int


def validate_mental_wellness_input(data: Dict[str, Any]) -> MentalWellnessInput:
    """Validate mental wellness input data"""
    return MentalWellnessInput(**data)


def validate_academic_impact_input(data: Dict[str, Any]) -> AcademicImpactInput:
    """Validate academic impact input data"""
    return AcademicImpactInput(**data)
