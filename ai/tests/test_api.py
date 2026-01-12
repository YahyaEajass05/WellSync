"""
API Tests for WellSync AI
Tests all endpoints and functionality
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from ai.api.main import app

client = TestClient(app)


class TestRootEndpoints:
    """Test root and health endpoints"""
    
    def test_root(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["version"] == "1.0.0"
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "models" in data


class TestModelEndpoints:
    """Test model information endpoints"""
    
    def test_models_info(self):
        """Test models info endpoint"""
        response = client.get("/models/info")
        assert response.status_code == 200
        data = response.json()
        assert "mental_wellness" in data
        assert "academic_impact" in data
    
    def test_available_models(self):
        """Test available models endpoint"""
        response = client.get("/models/available")
        assert response.status_code == 200
        data = response.json()
        assert "mental_health" in data
        assert "academic" in data


class TestExampleEndpoints:
    """Test example endpoints"""
    
    def test_mental_wellness_example(self):
        """Test mental wellness example endpoint"""
        response = client.get("/examples/mental-wellness")
        assert response.status_code == 200
        data = response.json()
        assert "example" in data
        example = data["example"]
        assert "age" in example
        assert "gender" in example
        assert "screen_time_hours" in example
    
    def test_academic_impact_example(self):
        """Test academic impact example endpoint"""
        response = client.get("/examples/academic-impact")
        assert response.status_code == 200
        data = response.json()
        assert "example" in data
        example = data["example"]
        assert "age" in example
        assert "gender" in example
        assert "avg_daily_usage_hours" in example


class TestPredictionEndpoints:
    """Test prediction endpoints"""
    
    def test_mental_wellness_prediction_valid(self):
        """Test mental wellness prediction with valid input"""
        data = {
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
        
        response = client.post("/predict/mental-wellness", json=data)
        assert response.status_code == 200
        result = response.json()
        assert "model_info" in result
    
    def test_mental_wellness_prediction_invalid_age(self):
        """Test mental wellness prediction with invalid age"""
        data = {
            "age": 150,  # Invalid age
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
        
        response = client.post("/predict/mental-wellness", json=data)
        assert response.status_code == 422  # Validation error
    
    def test_academic_impact_prediction_valid(self):
        """Test academic impact prediction with valid input"""
        data = {
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
        
        response = client.post("/predict/academic-impact", json=data)
        assert response.status_code == 200
        result = response.json()
        assert "model_info" in result
    
    def test_academic_impact_prediction_missing_field(self):
        """Test academic impact prediction with missing field"""
        data = {
            "age": 21,
            "gender": "Female",
            # Missing academic_level
            "country": "USA",
            "most_used_platform": "Instagram",
            "avg_daily_usage_hours": 4.5,
            "sleep_hours_per_night": 6.5,
            "mental_health_score": 6,
            "conflicts_over_social_media": 2,
            "affects_academic_performance": "Yes",
            "relationship_status": "Single"
        }
        
        response = client.post("/predict/academic-impact", json=data)
        assert response.status_code == 422  # Validation error


class TestInputValidation:
    """Test input validation"""
    
    def test_negative_screen_time(self):
        """Test negative screen time is rejected"""
        data = {
            "age": 28,
            "gender": "Male",
            "occupation": "Software Engineer",
            "work_mode": "Hybrid",
            "screen_time_hours": -5.0,  # Invalid
            "work_screen_hours": 7.0,
            "leisure_screen_hours": 2.5,
            "sleep_hours": 7.0,
            "sleep_quality_1_5": 4,
            "stress_level_0_10": 5,
            "productivity_0_100": 75,
            "exercise_minutes_per_week": 180,
            "social_hours_per_week": 10.0
        }
        
        response = client.post("/predict/mental-wellness", json=data)
        assert response.status_code == 422
    
    def test_invalid_stress_level(self):
        """Test invalid stress level is rejected"""
        data = {
            "age": 28,
            "gender": "Male",
            "occupation": "Software Engineer",
            "work_mode": "Hybrid",
            "screen_time_hours": 9.5,
            "work_screen_hours": 7.0,
            "leisure_screen_hours": 2.5,
            "sleep_hours": 7.0,
            "sleep_quality_1_5": 4,
            "stress_level_0_10": 15,  # Invalid (max is 10)
            "productivity_0_100": 75,
            "exercise_minutes_per_week": 180,
            "social_hours_per_week": 10.0
        }
        
        response = client.post("/predict/mental-wellness", json=data)
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
