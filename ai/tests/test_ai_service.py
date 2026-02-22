"""
WellSync AI Service — Comprehensive Test Suite
Covers: root/health endpoints, mental wellness, stress, academic impact,
        input validation, boundary values, cross-field rules, preprocessing,
        and score interpretation functions.

Run with:
    cd ai
    pytest tests/test_ai_service.py -v
    pytest tests/test_ai_service.py -v --tb=short --no-header
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from ai.api.main import app
from ai.utils.validators import (
    MentalWellnessInput,
    StressPredictionInput,
    AcademicImpactInput,
)
from ai.utils.preprocessing import (
    interpret_mental_wellness_score,
    interpret_addiction_score,
)
from .conftest import (
    VALID_MENTAL_WELLNESS_PAYLOAD,
    VALID_STRESS_PAYLOAD,
    VALID_ACADEMIC_PAYLOAD,
    make_mock_mental_wellness_predictor,
    make_mock_academic_predictor,
    make_mock_stress_predictor,
)

# ---------------------------------------------------------------------------
# Shared mocked client (no real models needed)
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def client():
    with patch("ai.api.main.mental_wellness_predictor", make_mock_mental_wellness_predictor()), \
         patch("ai.api.main.academic_impact_predictor", make_mock_academic_predictor()), \
         patch("ai.api.main.stress_prediction_predictor", make_mock_stress_predictor()):
        yield TestClient(app)


# ===========================================================================
# SECTION 1: Root & Utility Endpoints
# ===========================================================================

class TestRootEndpoints:
    """Tests for root and health check endpoints."""

    def test_root_returns_200(self, client):
        """GET / should return HTTP 200."""
        response = client.get("/")
        assert response.status_code == 200

    def test_root_contains_version(self, client):
        """GET / should include version field."""
        data = client.get("/").json()
        assert "version" in data
        assert data["version"] == "1.0.0"

    def test_root_contains_message(self, client):
        """GET / should include a message field."""
        data = client.get("/").json()
        assert "message" in data

    def test_health_check_returns_200(self, client):
        """GET /health should return HTTP 200."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_check_status_healthy(self, client):
        """GET /health should report status as healthy."""
        data = client.get("/health").json()
        assert data.get("status") == "healthy"

    def test_health_check_contains_models(self, client):
        """GET /health should list model statuses."""
        data = client.get("/health").json()
        assert "models" in data

    def test_models_info_returns_200(self, client):
        """GET /models/info should return HTTP 200."""
        response = client.get("/models/info")
        assert response.status_code == 200

    def test_models_info_contains_mental_wellness(self, client):
        """GET /models/info should include mental_wellness key."""
        data = client.get("/models/info").json()
        assert "mental_wellness" in data

    def test_models_info_contains_academic(self, client):
        """GET /models/info should include academic_impact key."""
        data = client.get("/models/info").json()
        assert "academic_impact" in data

    def test_models_available_returns_200(self, client):
        """GET /models/available should return HTTP 200."""
        response = client.get("/models/available")
        assert response.status_code == 200


# ===========================================================================
# SECTION 2: Example Endpoints
# ===========================================================================

class TestExampleEndpoints:
    """Tests for example payload endpoints."""

    def test_mental_wellness_example_returns_200(self, client):
        """GET /examples/mental-wellness should return HTTP 200."""
        response = client.get("/examples/mental-wellness")
        assert response.status_code == 200

    def test_mental_wellness_example_has_age(self, client):
        """Mental wellness example should include age field."""
        data = client.get("/examples/mental-wellness").json()
        assert "age" in data.get("example", data)

    def test_mental_wellness_example_has_gender(self, client):
        """Mental wellness example should include gender field."""
        data = client.get("/examples/mental-wellness").json()
        example = data.get("example", data)
        assert "gender" in example

    def test_stress_example_returns_200(self, client):
        """GET /examples/stress should return HTTP 200."""
        response = client.get("/examples/stress")
        assert response.status_code == 200

    def test_stress_example_has_wellness_index(self, client):
        """Stress example should include mental_wellness_index_0_100."""
        data = client.get("/examples/stress").json()
        example = data.get("example", data)
        assert "mental_wellness_index_0_100" in example

    def test_academic_example_returns_200(self, client):
        """GET /examples/academic-impact should return HTTP 200."""
        response = client.get("/examples/academic-impact")
        assert response.status_code == 200

    def test_academic_example_has_platform(self, client):
        """Academic example should include most_used_platform field."""
        data = client.get("/examples/academic-impact").json()
        example = data.get("example", data)
        assert "most_used_platform" in example


# ===========================================================================
# SECTION 3: Mental Wellness Prediction
# ===========================================================================

class TestMentalWellnessPrediction:
    """Tests for POST /predict/mental-wellness."""

    def test_valid_payload_returns_200(self, client):
        """Valid mental wellness payload should return HTTP 200."""
        response = client.post("/predict/mental-wellness", json=VALID_MENTAL_WELLNESS_PAYLOAD)
        assert response.status_code == 200

    def test_valid_payload_returns_prediction(self, client):
        """Response should contain a prediction value."""
        data = client.post("/predict/mental-wellness", json=VALID_MENTAL_WELLNESS_PAYLOAD).json()
        assert "prediction" in data

    def test_valid_payload_returns_interpretation(self, client):
        """Response should contain an interpretation field."""
        data = client.post("/predict/mental-wellness", json=VALID_MENTAL_WELLNESS_PAYLOAD).json()
        assert "interpretation" in data

    def test_valid_payload_returns_model_name(self, client):
        """Response should contain model_name field."""
        data = client.post("/predict/mental-wellness", json=VALID_MENTAL_WELLNESS_PAYLOAD).json()
        assert "model_name" in data

    def test_boundary_age_18_accepted(self, client):
        """Age 18 (minimum boundary) should be accepted."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "age": 18}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 200

    def test_boundary_age_100_accepted(self, client):
        """Age 100 (maximum boundary) should be accepted."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "age": 100}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 200

    def test_age_17_rejected(self, client):
        """Age 17 (below minimum) should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "age": 17}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_age_101_rejected(self, client):
        """Age 101 (above maximum) should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "age": 101}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_sleep_quality_min_boundary(self, client):
        """Sleep quality of 1 (minimum) should be accepted."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "sleep_quality_1_5": 1}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 200

    def test_sleep_quality_max_boundary(self, client):
        """Sleep quality of 5 (maximum) should be accepted."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "sleep_quality_1_5": 5}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 200

    def test_sleep_quality_0_rejected(self, client):
        """Sleep quality of 0 (below minimum) should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "sleep_quality_1_5": 0}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_sleep_quality_6_rejected(self, client):
        """Sleep quality of 6 (above maximum) should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "sleep_quality_1_5": 6}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_stress_level_min_boundary(self, client):
        """Stress level of 0 (minimum) should be accepted."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "stress_level_0_10": 0}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 200

    def test_stress_level_max_boundary(self, client):
        """Stress level of 10 (maximum) should be accepted."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "stress_level_0_10": 10}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 200

    def test_stress_level_11_rejected(self, client):
        """Stress level of 11 (above maximum) should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "stress_level_0_10": 11}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_negative_stress_level_rejected(self, client):
        """Negative stress level should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "stress_level_0_10": -1}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_productivity_min_boundary(self, client):
        """Productivity of 0 (minimum) should be accepted."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "productivity_0_100": 0}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 200

    def test_productivity_max_boundary(self, client):
        """Productivity of 100 (maximum) should be accepted."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "productivity_0_100": 100}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 200

    def test_productivity_101_rejected(self, client):
        """Productivity of 101 (above maximum) should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "productivity_0_100": 101}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_negative_screen_time_rejected(self, client):
        """Negative screen time should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "screen_time_hours": -1.0}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_screen_time_exceeding_24h_rejected(self, client):
        """Screen time exceeding 24 hours should be rejected with 422."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "screen_time_hours": 25.0}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_work_screen_exceeds_total_rejected(self, client):
        """work_screen_hours exceeding screen_time_hours should be rejected with 422."""
        payload = {
            **VALID_MENTAL_WELLNESS_PAYLOAD,
            "screen_time_hours": 4.0,
            "work_screen_hours": 6.0,
            "leisure_screen_hours": 1.0,
        }
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_leisure_screen_exceeds_total_rejected(self, client):
        """leisure_screen_hours exceeding screen_time_hours should be rejected with 422."""
        payload = {
            **VALID_MENTAL_WELLNESS_PAYLOAD,
            "screen_time_hours": 4.0,
            "work_screen_hours": 1.0,
            "leisure_screen_hours": 6.0,
        }
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_missing_required_field_rejected(self, client):
        """Missing a required field should return 422."""
        payload = dict(VALID_MENTAL_WELLNESS_PAYLOAD)
        del payload["occupation"]
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == 422

    def test_empty_payload_rejected(self, client):
        """Empty payload should return 422."""
        response = client.post("/predict/mental-wellness", json={})
        assert response.status_code == 422


# ===========================================================================
# SECTION 4: Stress Level Prediction
# ===========================================================================

class TestStressPrediction:
    """Tests for POST /predict/stress."""

    def test_valid_payload_returns_200(self, client):
        """Valid stress payload should return HTTP 200."""
        response = client.post("/predict/stress", json=VALID_STRESS_PAYLOAD)
        assert response.status_code == 200

    def test_valid_payload_returns_prediction(self, client):
        """Stress response should contain a prediction value."""
        data = client.post("/predict/stress", json=VALID_STRESS_PAYLOAD).json()
        assert "prediction" in data

    def test_valid_payload_returns_stress_category(self, client):
        """Stress response should contain stress_category."""
        data = client.post("/predict/stress", json=VALID_STRESS_PAYLOAD).json()
        assert "stress_category" in data

    def test_valid_payload_returns_recommendations(self, client):
        """Stress response should include recommendations list."""
        data = client.post("/predict/stress", json=VALID_STRESS_PAYLOAD).json()
        assert "recommendations" in data

    def test_valid_payload_returns_interpretation(self, client):
        """Stress response should contain an interpretation."""
        data = client.post("/predict/stress", json=VALID_STRESS_PAYLOAD).json()
        assert "interpretation" in data

    def test_boundary_age_18_accepted(self, client):
        """Age 18 (minimum) should be accepted for stress prediction."""
        payload = {**VALID_STRESS_PAYLOAD, "age": 18}
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 200

    def test_boundary_age_100_accepted(self, client):
        """Age 100 (maximum) should be accepted for stress prediction."""
        payload = {**VALID_STRESS_PAYLOAD, "age": 100}
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 200

    def test_age_17_rejected(self, client):
        """Age 17 (below minimum) should be rejected with 422."""
        payload = {**VALID_STRESS_PAYLOAD, "age": 17}
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 422

    def test_age_101_rejected(self, client):
        """Age 101 (above maximum) should be rejected with 422."""
        payload = {**VALID_STRESS_PAYLOAD, "age": 101}
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 422

    def test_wellness_index_min_boundary(self, client):
        """Wellness index of 0.0 (minimum) should be accepted."""
        payload = {**VALID_STRESS_PAYLOAD, "mental_wellness_index_0_100": 0.0}
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 200

    def test_wellness_index_max_boundary(self, client):
        """Wellness index of 100.0 (maximum) should be accepted."""
        payload = {**VALID_STRESS_PAYLOAD, "mental_wellness_index_0_100": 100.0}
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 200

    def test_wellness_index_above_100_rejected(self, client):
        """Wellness index above 100 should be rejected with 422."""
        payload = {**VALID_STRESS_PAYLOAD, "mental_wellness_index_0_100": 101.0}
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 422

    def test_negative_wellness_index_rejected(self, client):
        """Negative wellness index should be rejected with 422."""
        payload = {**VALID_STRESS_PAYLOAD, "mental_wellness_index_0_100": -1.0}
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 422

    def test_work_screen_exceeds_total_rejected(self, client):
        """work_screen_hours exceeding screen_time_hours should be rejected."""
        payload = {
            **VALID_STRESS_PAYLOAD,
            "screen_time_hours": 3.0,
            "work_screen_hours": 5.0,
            "leisure_screen_hours": 1.0,
        }
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 422

    def test_missing_wellness_index_rejected(self, client):
        """Missing mental_wellness_index_0_100 should return 422."""
        payload = dict(VALID_STRESS_PAYLOAD)
        del payload["mental_wellness_index_0_100"]
        response = client.post("/predict/stress", json=payload)
        assert response.status_code == 422

    def test_empty_payload_rejected(self, client):
        """Empty stress payload should return 422."""
        response = client.post("/predict/stress", json={})
        assert response.status_code == 422


# ===========================================================================
# SECTION 5: Academic Impact Prediction
# ===========================================================================

class TestAcademicImpactPrediction:
    """Tests for POST /predict/academic-impact."""

    def test_valid_payload_returns_200(self, client):
        """Valid academic payload should return HTTP 200."""
        response = client.post("/predict/academic-impact", json=VALID_ACADEMIC_PAYLOAD)
        assert response.status_code == 200

    def test_valid_payload_returns_prediction(self, client):
        """Academic response should contain a prediction value."""
        data = client.post("/predict/academic-impact", json=VALID_ACADEMIC_PAYLOAD).json()
        assert "prediction" in data

    def test_valid_payload_returns_interpretation(self, client):
        """Academic response should contain an interpretation."""
        data = client.post("/predict/academic-impact", json=VALID_ACADEMIC_PAYLOAD).json()
        assert "interpretation" in data

    def test_boundary_age_17_accepted(self, client):
        """Age 17 (minimum for academic) should be accepted."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "age": 17}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 200

    def test_boundary_age_30_accepted(self, client):
        """Age 30 (maximum for academic) should be accepted."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "age": 30}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 200

    def test_age_16_rejected(self, client):
        """Age 16 (below minimum) should be rejected with 422."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "age": 16}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 422

    def test_age_31_rejected(self, client):
        """Age 31 (above maximum) should be rejected with 422."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "age": 31}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 422

    def test_mental_health_score_min_boundary(self, client):
        """Mental health score of 0 (minimum) should be accepted."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "mental_health_score": 0}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 200

    def test_mental_health_score_max_boundary(self, client):
        """Mental health score of 100 (maximum) should be accepted."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "mental_health_score": 100}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 200

    def test_mental_health_score_68_accepted(self, client):
        """Mental health score of 68 should be accepted (was broken before fix)."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "mental_health_score": 68}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 200

    def test_mental_health_score_101_rejected(self, client):
        """Mental health score above 100 should be rejected with 422."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "mental_health_score": 101}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 422

    def test_negative_mental_health_score_rejected(self, client):
        """Negative mental health score should be rejected with 422."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "mental_health_score": -1}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 422

    def test_conflicts_min_boundary(self, client):
        """Conflicts score of 0 (minimum) should be accepted."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "conflicts_over_social_media": 0}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 200

    def test_conflicts_max_boundary(self, client):
        """Conflicts score of 5 (maximum) should be accepted."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "conflicts_over_social_media": 5}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 200

    def test_conflicts_6_rejected(self, client):
        """Conflicts score above 5 should be rejected with 422."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "conflicts_over_social_media": 6}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 422

    def test_usage_hours_above_24_rejected(self, client):
        """Daily usage exceeding 24 hours should be rejected with 422."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "avg_daily_usage_hours": 25.0}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 422

    def test_missing_academic_level_rejected(self, client):
        """Missing academic_level should return 422."""
        payload = dict(VALID_ACADEMIC_PAYLOAD)
        del payload["academic_level"]
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 422

    def test_missing_platform_rejected(self, client):
        """Missing most_used_platform should return 422."""
        payload = dict(VALID_ACADEMIC_PAYLOAD)
        del payload["most_used_platform"]
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == 422

    def test_empty_payload_rejected(self, client):
        """Empty academic payload should return 422."""
        response = client.post("/predict/academic-impact", json={})
        assert response.status_code == 422


# ===========================================================================
# SECTION 6: Score Interpretation Unit Tests
# ===========================================================================

class TestScoreInterpretation:
    """Unit tests for interpretation helper functions."""

    # Mental Wellness Score Interpretation
    def test_mental_wellness_excellent(self):
        """Score >= 80 should contain 'excellent' in interpretation."""
        assert "excellent" in interpret_mental_wellness_score(80.0).lower()
        assert "excellent" in interpret_mental_wellness_score(95.0).lower()
        assert "excellent" in interpret_mental_wellness_score(100.0).lower()

    def test_mental_wellness_good(self):
        """Score 70-79 should contain 'good' in interpretation."""
        assert "good" in interpret_mental_wellness_score(70.0).lower()
        assert "good" in interpret_mental_wellness_score(75.0).lower()
        assert "good" in interpret_mental_wellness_score(79.9).lower()

    def test_mental_wellness_moderate(self):
        """Score 60-69 should contain 'moderate' in interpretation."""
        assert "moderate" in interpret_mental_wellness_score(60.0).lower()
        assert "moderate" in interpret_mental_wellness_score(65.0).lower()
        assert "moderate" in interpret_mental_wellness_score(69.9).lower()

    def test_mental_wellness_below_average(self):
        """Score 50-59 should contain 'below' or 'average' in interpretation."""
        result = interpret_mental_wellness_score(50.0).lower()
        assert "below" in result or "average" in result

    def test_mental_wellness_poor(self):
        """Score below 50 should contain 'poor' in interpretation."""
        assert "poor" in interpret_mental_wellness_score(49.9).lower()
        assert "poor" in interpret_mental_wellness_score(0.0).lower()

    # Addiction Score Interpretation
    def test_addiction_high_risk(self):
        """Addiction score >= 7 should be High risk."""
        result = interpret_addiction_score(7.0)
        assert "high" in result.lower()

    def test_addiction_moderate(self):
        """Addiction score 5-6.9 should be Moderate."""
        result = interpret_addiction_score(5.0)
        assert "moderate" in result.lower()

    def test_addiction_low_moderate(self):
        """Addiction score 4-4.9 should be Low-Moderate."""
        result = interpret_addiction_score(4.0)
        assert "low" in result.lower() or "moderate" in result.lower()

    def test_addiction_low_risk(self):
        """Addiction score < 4 should be Low risk."""
        result = interpret_addiction_score(2.0)
        assert "low" in result.lower()


# ===========================================================================
# SECTION 7: Pydantic Schema Validation Unit Tests
# ===========================================================================

class TestPydanticValidators:
    """Direct unit tests for Pydantic validator schemas."""

    def test_mental_wellness_valid_schema(self):
        """Valid data should create MentalWellnessInput without errors."""
        obj = MentalWellnessInput(**VALID_MENTAL_WELLNESS_PAYLOAD)
        assert obj.age == 28
        assert obj.gender == "Male"

    def test_mental_wellness_age_too_low_raises(self):
        """Age below 18 should raise a validation error."""
        with pytest.raises(Exception):
            MentalWellnessInput(**{**VALID_MENTAL_WELLNESS_PAYLOAD, "age": 17})

    def test_mental_wellness_age_too_high_raises(self):
        """Age above 100 should raise a validation error."""
        with pytest.raises(Exception):
            MentalWellnessInput(**{**VALID_MENTAL_WELLNESS_PAYLOAD, "age": 101})

    def test_mental_wellness_cross_field_work_screen_raises(self):
        """work_screen_hours exceeding screen_time_hours should raise error."""
        with pytest.raises(Exception):
            MentalWellnessInput(**{
                **VALID_MENTAL_WELLNESS_PAYLOAD,
                "screen_time_hours": 3.0,
                "work_screen_hours": 5.0,
                "leisure_screen_hours": 1.0,
            })

    def test_stress_valid_schema(self):
        """Valid data should create StressPredictionInput without errors."""
        obj = StressPredictionInput(**VALID_STRESS_PAYLOAD)
        assert obj.mental_wellness_index_0_100 == 65.0

    def test_stress_wellness_index_above_100_raises(self):
        """Wellness index above 100 should raise a validation error."""
        with pytest.raises(Exception):
            StressPredictionInput(**{**VALID_STRESS_PAYLOAD, "mental_wellness_index_0_100": 101.0})

    def test_academic_valid_schema(self):
        """Valid data should create AcademicImpactInput without errors."""
        obj = AcademicImpactInput(**VALID_ACADEMIC_PAYLOAD)
        assert obj.mental_health_score == 60

    def test_academic_mental_health_score_68(self):
        """Mental health score of 68 should be accepted by schema."""
        obj = AcademicImpactInput(**{**VALID_ACADEMIC_PAYLOAD, "mental_health_score": 68})
        assert obj.mental_health_score == 68

    def test_academic_mental_health_score_above_100_raises(self):
        """Mental health score above 100 should raise a validation error."""
        with pytest.raises(Exception):
            AcademicImpactInput(**{**VALID_ACADEMIC_PAYLOAD, "mental_health_score": 101})

    def test_academic_age_too_high_raises(self):
        """Academic age above 30 should raise a validation error."""
        with pytest.raises(Exception):
            AcademicImpactInput(**{**VALID_ACADEMIC_PAYLOAD, "age": 31})

    def test_academic_conflicts_above_5_raises(self):
        """Conflicts above 5 should raise a validation error."""
        with pytest.raises(Exception):
            AcademicImpactInput(**{**VALID_ACADEMIC_PAYLOAD, "conflicts_over_social_media": 6})


# ===========================================================================
# SECTION 8: Model Unavailable (503) Tests
# ===========================================================================

class TestModelUnavailable:
    """Tests for error responses when models are not loaded."""

    def test_mental_wellness_returns_error_when_model_missing(self):
        """Should return 503 or 500 when mental wellness model is not loaded."""
        with patch("ai.api.main.mental_wellness_predictor", None):
            client = TestClient(app)
            response = client.post("/predict/mental-wellness", json=VALID_MENTAL_WELLNESS_PAYLOAD)
            assert response.status_code in (500, 503)

    def test_stress_returns_error_when_model_missing(self):
        """Should return 503 or 500 when stress model is not loaded."""
        with patch("ai.api.main.stress_prediction_predictor", None):
            client = TestClient(app)
            response = client.post("/predict/stress", json=VALID_STRESS_PAYLOAD)
            assert response.status_code in (500, 503)

    def test_academic_returns_error_when_model_missing(self):
        """Should return 503 or 500 when academic model is not loaded."""
        with patch("ai.api.main.academic_impact_predictor", None):
            client = TestClient(app)
            response = client.post("/predict/academic-impact", json=VALID_ACADEMIC_PAYLOAD)
            assert response.status_code in (500, 503)


# ===========================================================================
# SECTION 9: Parametrized Boundary Tests
# ===========================================================================

class TestParametrizedBoundaries:
    """Parametrized boundary tests for all three prediction endpoints."""

    @pytest.mark.parametrize("age,expected", [
        (18, 200), (100, 200), (17, 422), (101, 422), (0, 422), (150, 422),
    ])
    def test_mental_wellness_age_boundaries(self, client, age, expected):
        """Mental wellness age boundary values should return correct status."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "age": age}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == expected

    @pytest.mark.parametrize("age,expected", [
        (17, 200), (30, 200), (16, 422), (31, 422),
    ])
    def test_academic_age_boundaries(self, client, age, expected):
        """Academic age boundary values should return correct status."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "age": age}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == expected

    @pytest.mark.parametrize("score,expected", [
        (0, 200), (100, 200), (68, 200), (-1, 422), (101, 422),
    ])
    def test_mental_health_score_boundaries(self, client, score, expected):
        """Mental health score boundary values should return correct status."""
        payload = {**VALID_ACADEMIC_PAYLOAD, "mental_health_score": score}
        response = client.post("/predict/academic-impact", json=payload)
        assert response.status_code == expected

    @pytest.mark.parametrize("quality,expected", [
        (1, 200), (5, 200), (0, 422), (6, 422),
    ])
    def test_sleep_quality_boundaries(self, client, quality, expected):
        """Sleep quality boundary values should return correct status."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "sleep_quality_1_5": quality}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == expected

    @pytest.mark.parametrize("level,expected", [
        (0, 200), (10, 200), (-1, 422), (11, 422),
    ])
    def test_stress_level_boundaries(self, client, level, expected):
        """Stress level boundary values should return correct status."""
        payload = {**VALID_MENTAL_WELLNESS_PAYLOAD, "stress_level_0_10": level}
        response = client.post("/predict/mental-wellness", json=payload)
        assert response.status_code == expected


# ===========================================================================
# Runner (for direct execution)
# ===========================================================================

if __name__ == "__main__":
    import subprocess
    import sys
    result = subprocess.run(
        [sys.executable, "-m", "pytest", __file__, "-v", "--tb=short", "--no-header"],
        cwd=str(__import__("pathlib").Path(__file__).parent.parent.parent)
    )
    sys.exit(result.returncode)

