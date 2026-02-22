"""
WellSync AI Test Configuration
Shared fixtures and setup for all AI service tests.
"""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Valid sample payloads (reusable across tests)
# ---------------------------------------------------------------------------

VALID_MENTAL_WELLNESS_PAYLOAD = {
    "age": 28,
    "gender": "Male",
    "occupation": "Software Engineer",
    "work_mode": "Hybrid",
    "screen_time_hours": 8.0,
    "work_screen_hours": 5.0,
    "leisure_screen_hours": 3.0,
    "sleep_hours": 7.0,
    "sleep_quality_1_5": 3,
    "stress_level_0_10": 5,
    "productivity_0_100": 70,
    "exercise_minutes_per_week": 150,
    "social_hours_per_week": 10.0,
}

VALID_STRESS_PAYLOAD = {
    "age": 28,
    "gender": "Male",
    "occupation": "Software Engineer",
    "work_mode": "Hybrid",
    "screen_time_hours": 8.0,
    "work_screen_hours": 5.0,
    "leisure_screen_hours": 3.0,
    "sleep_hours": 7.0,
    "sleep_quality_1_5": 3,
    "productivity_0_100": 70,
    "exercise_minutes_per_week": 150,
    "social_hours_per_week": 10.0,
    "mental_wellness_index_0_100": 65.0,
}

VALID_ACADEMIC_PAYLOAD = {
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
    "relationship_status": "Single",
}


# ---------------------------------------------------------------------------
# Mock predictor factory
# ---------------------------------------------------------------------------

def make_mock_mental_wellness_predictor():
    mock = MagicMock()
    mock.predict.return_value = {
        "prediction": 72.5,
        "interpretation": "Good",
        "model_name": "Voting Ensemble",
        "confidence_metrics": {"r2_score": 0.89, "mae": 4.2},
        "input_features_processed": 25,
        "status": "success",
    }
    mock.loader = MagicMock()
    mock.loader.get_model_info.return_value = {
        "model_type": "mental_health",
        "model_name": "Voting Ensemble",
        "training_date": "2026-01-11",
        "test_r2_score": 0.89,
        "test_mae": 4.2,
        "feature_count": 25,
        "dataset_size": 1000,
    }
    return mock


def make_mock_academic_predictor():
    mock = MagicMock()
    mock.predict.return_value = {
        "prediction": 5.3,
        "interpretation": "Moderate addiction risk",
        "model_name": "Gradient Boosting",
        "confidence_metrics": {"r2_score": 0.85, "mae": 0.6},
        "input_features_processed": 20,
        "status": "success",
    }
    mock.loader = MagicMock()
    mock.loader.get_model_info.return_value = {
        "model_type": "academic",
        "model_name": "Gradient Boosting",
        "training_date": "2026-01-06",
        "test_r2_score": 0.85,
        "test_mae": 0.6,
        "feature_count": 20,
        "dataset_size": 700,
    }
    return mock


def make_mock_stress_predictor():
    mock = MagicMock()
    mock.predict.return_value = {
        "prediction": 6.2,
        "stress_category": "Moderate",
        "interpretation": "Moderate stress level detected.",
        "recommendations": ["Improve sleep schedule", "Reduce screen time"],
        "model_info": {"model_name": "Stress Classifier"},
        "status": "success",
    }
    return mock


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def mock_app():
    """
    Provide a TestClient with all three predictors mocked.
    Models do not need to be trained/loaded for tests to run.
    """
    with patch("ai.api.main.mental_wellness_predictor", make_mock_mental_wellness_predictor()), \
         patch("ai.api.main.academic_impact_predictor", make_mock_academic_predictor()), \
         patch("ai.api.main.stress_prediction_predictor", make_mock_stress_predictor()):
        from ai.api.main import app
        yield TestClient(app)


@pytest.fixture(scope="session")
def real_client():
    """
    Provide a TestClient without mocks (uses real trained models if available).
    Tests using this fixture are skipped if models are not loaded (503 response).
    """
    from ai.api.main import app
    return TestClient(app)


@pytest.fixture
def mental_wellness_payload():
    return dict(VALID_MENTAL_WELLNESS_PAYLOAD)


@pytest.fixture
def stress_payload():
    return dict(VALID_STRESS_PAYLOAD)


@pytest.fixture
def academic_payload():
    return dict(VALID_ACADEMIC_PAYLOAD)
