"""
Model Loader Utility
Loads trained models and preprocessors for predictions
"""

import joblib
import os
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np

class ModelLoader:
    """Load and manage trained ML models"""
    
    def __init__(self, model_type: str):
        """
        Initialize model loader
        
        Args:
            model_type: Either 'mental_health' or 'academic'
        """
        self.model_type = model_type
        
        # Determine base path based on current working directory
        # This handles both running from project root and from ai/api
        cwd = os.getcwd()
        
        if cwd.endswith(os.path.join('ai', 'api')):
            # Running from ai/api directory
            self.base_path = os.path.join("..", "models", model_type)
        elif os.path.exists(os.path.join("ai", "models")):
            # Running from project root
            self.base_path = os.path.join("ai", "models", model_type)
        else:
            # Fallback: try relative path
            self.base_path = os.path.join("models", model_type)
        
        self.model = None
        self.preprocessors = None
        self.feature_names = None
        self.metadata = None
        
    def load_model(self, model_name: str = "best_model.pkl"):
        """Load a trained model"""
        model_path = os.path.join(self.base_path, model_name)
        
        # Normalize path for Windows/Linux compatibility
        model_path = os.path.normpath(model_path)
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
            
        self.model = joblib.load(model_path)
        print(f"✅ Loaded model: {model_path}")
        return self.model
    
    def load_preprocessors(self):
        """Load preprocessing objects"""
        preprocessor_path = os.path.join(self.base_path, "preprocessors.pkl")
        preprocessor_path = os.path.normpath(preprocessor_path)
        
        if not os.path.exists(preprocessor_path):
            raise FileNotFoundError(f"Preprocessors not found: {preprocessor_path}")
            
        self.preprocessors = joblib.load(preprocessor_path)
        print(f"✅ Loaded preprocessors")
        return self.preprocessors
    
    def load_feature_names(self):
        """Load feature names"""
        feature_path = os.path.join(self.base_path, "feature_names.pkl")
        feature_path = os.path.normpath(feature_path)
        
        if not os.path.exists(feature_path):
            raise FileNotFoundError(f"Feature names not found: {feature_path}")
            
        self.feature_names = joblib.load(feature_path)
        print(f"✅ Loaded {len(self.feature_names)} feature names")
        return self.feature_names
    
    def load_metadata(self):
        """Load model metadata"""
        metadata_path = os.path.join(self.base_path, "model_metadata.pkl")
        metadata_path = os.path.normpath(metadata_path)
        
        if not os.path.exists(metadata_path):
            raise FileNotFoundError(f"Metadata not found: {metadata_path}")
            
        self.metadata = joblib.load(metadata_path)
        print(f"✅ Loaded metadata")
        return self.metadata
    
    def load_all(self):
        """Load model, preprocessors, features, and metadata"""
        self.load_model()
        self.load_preprocessors()
        self.load_feature_names()
        self.load_metadata()
        print(f"✅ All components loaded for {self.model_type}")
        return self
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        if self.metadata is None:
            self.load_metadata()
            
        return {
            "model_type": self.model_type,
            "model_name": self.metadata.get("best_model_name", "Unknown"),
            "training_date": self.metadata.get("training_date", "Unknown"),
            "test_r2_score": self.metadata.get("best_model_results", {}).get("test_r2", 0),
            "test_mae": self.metadata.get("best_model_results", {}).get("test_mae", 0),
            "feature_count": self.metadata.get("feature_count", 0),
            "dataset_size": self.metadata.get("dataset_size", 0)
        }


class MentalWellnessPredictor:
    """Mental Wellness Prediction Interface"""
    
    def __init__(self):
        self.loader = ModelLoader("mental_health")
        self.loader.load_all()
    
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict mental wellness score
        
        Args:
            input_data: Dictionary with user lifestyle data
            
        Returns:
            Dictionary with prediction and confidence
        """
        from ai.utils.preprocessing import preprocess_mental_wellness_input, interpret_mental_wellness_score
        
        try:
            # Preprocess input data
            X_processed = preprocess_mental_wellness_input(input_data, self.loader.preprocessors)
            
            # Make prediction
            prediction = self.loader.model.predict(X_processed)[0]
            
            # Get interpretation
            interpretation = interpret_mental_wellness_score(prediction)
            
            # Get model info
            model_info = self.loader.get_model_info()
            
            return {
                "prediction": float(prediction),
                "interpretation": interpretation,
                "model_name": model_info["model_name"],
                "confidence_metrics": {
                    "model_r2_score": model_info["test_r2_score"],
                    "model_mae": model_info["test_mae"]
                },
                "input_features_processed": int(X_processed.shape[1]),
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "model_info": self.loader.get_model_info()
            }


class AcademicImpactPredictor:
    """Academic Impact Prediction Interface"""
    
    def __init__(self):
        self.loader = ModelLoader("academic")
        self.loader.load_all()
    
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict addiction score and academic impact
        
        Args:
            input_data: Dictionary with student social media data
            
        Returns:
            Dictionary with prediction and confidence
        """
        from ai.utils.preprocessing import preprocess_academic_input, interpret_addiction_score
        
        try:
            # Preprocess input data
            X_processed = preprocess_academic_input(input_data, self.loader.preprocessors)
            
            # Make prediction
            prediction = self.loader.model.predict(X_processed)[0]
            
            # Get interpretation
            interpretation = interpret_addiction_score(prediction)
            
            # Get model info
            model_info = self.loader.get_model_info()
            
            return {
                "prediction": float(prediction),
                "interpretation": interpretation,
                "model_name": model_info["model_name"],
                "confidence_metrics": {
                    "model_r2_score": model_info["test_r2_score"],
                    "model_mae": model_info["test_mae"]
                },
                "input_features_processed": int(X_processed.shape[1]),
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "model_info": self.loader.get_model_info()
            }


class StressPredictionPredictor:
    """Stress Level Prediction Interface"""
    
    def __init__(self):
        """Initialize stress prediction model"""
        # Use mental_health path since stress model is stored there
        self.base_path = None
        cwd = os.getcwd()
        
        if cwd.endswith(os.path.join('ai', 'api')):
            self.base_path = os.path.join("..", "models", "mental_health")
        elif os.path.exists(os.path.join("ai", "models")):
            self.base_path = os.path.join("ai", "models", "mental_health")
        else:
            self.base_path = os.path.join("models", "mental_health")
        
        self.model = None
        self.preprocessors = None
        self._load_model()
    
    def _load_model(self):
        """Load the stress prediction model and preprocessors"""
        model_path = os.path.normpath(os.path.join(self.base_path, "stress_model.pkl"))
        preprocessor_path = os.path.normpath(os.path.join(self.base_path, "stress_preprocessors.pkl"))
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Stress model not found: {model_path}")
        if not os.path.exists(preprocessor_path):
            raise FileNotFoundError(f"Stress preprocessors not found: {preprocessor_path}")
        
        self.model = joblib.load(model_path)
        self.preprocessors = joblib.load(preprocessor_path)
        print(f"✅ Loaded stress prediction model")
    
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict stress level
        
        Args:
            input_data: Dictionary with lifestyle data
            
        Returns:
            Dictionary with prediction and interpretation
        """
        try:
            # Create DataFrame from input
            df = pd.DataFrame([input_data])
            
            # Drop user_id if present
            if 'user_id' in df.columns:
                df = df.drop(columns=['user_id'])
            
            # Apply same feature engineering as training (BEFORE encoding)
            df = self._engineer_features(df)
            
            # Get numeric columns (all except categorical)
            categorical_cols = ['gender', 'occupation', 'work_mode']
            numeric_cols = [col for col in df.columns if col not in categorical_cols]
            
            # Apply imputation ONLY to numeric columns (like in training)
            imputer = self.preprocessors['imputer']
            df[numeric_cols] = imputer.transform(df[numeric_cols])
            
            # NOW encode categorical variables (after imputation)
            encoders = self.preprocessors['encoders']
            for col, encoder in encoders.items():
                if col in df.columns:
                    try:
                        df[col] = encoder.transform(df[col])
                    except:
                        # Handle unknown categories - use most common class
                        df[col] = 0
            
            # Get feature names and ensure all are present
            feature_names = self.preprocessors['feature_names']
            for feature in feature_names:
                if feature not in df.columns:
                    df[feature] = 0
            
            # Reorder columns to match training
            df = df[feature_names]
            
            # Convert to numpy array and scale
            scaler = self.preprocessors['scaler']
            X_scaled = scaler.transform(df.values)
            
            # Make prediction
            prediction = self.model.predict(X_scaled)[0]
            
            # Get interpretation
            interpretation = self._interpret_stress(prediction)
            
            return {
                "prediction": float(prediction),
                "interpretation": interpretation,
                "model_name": type(self.model).__name__,
                "stress_category": self._categorize_stress(prediction),
                "recommendations": self._get_recommendations(prediction, input_data),
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply feature engineering (same as preprocessing)"""
        # Screen time patterns
        df['total_screen_ratio'] = df['screen_time_hours'] / 24.0
        df['work_screen_ratio'] = df['work_screen_hours'] / (df['screen_time_hours'] + 1e-6)
        df['leisure_screen_ratio'] = df['leisure_screen_hours'] / (df['screen_time_hours'] + 1e-6)
        
        # Sleep deficiency
        df['sleep_deficit'] = np.maximum(0, 8 - df['sleep_hours'])
        df['sleep_efficiency'] = df['sleep_quality_1_5'] / (df['sleep_hours'] + 1e-6)
        df['poor_sleep_indicator'] = ((df['sleep_hours'] < 6) | (df['sleep_quality_1_5'] < 2)).astype(int)
        
        # Work-life imbalance
        df['work_life_balance'] = df['social_hours_per_week'] / (df['work_screen_hours'] + 1e-6)
        df['screen_sleep_ratio'] = df['screen_time_hours'] / (df['sleep_hours'] + 1e-6)
        df['excessive_work_screen'] = (df['work_screen_hours'] > 8).astype(int)
        
        # Physical activity
        df['exercise_hours_week'] = df['exercise_minutes_per_week'] / 60.0
        df['low_exercise'] = (df['exercise_minutes_per_week'] < 150).astype(int)
        
        # Social isolation
        df['social_isolation'] = (df['social_hours_per_week'] < 5).astype(int)
        df['social_exercise_score'] = (df['social_hours_per_week'] + df['exercise_hours_week']) / 2
        
        # Productivity
        df['low_productivity'] = (df['productivity_0_100'] < 50).astype(int)
        df['productivity_wellness_gap'] = abs(df['productivity_0_100'] - df['mental_wellness_index_0_100'])
        
        # Age groups
        df['age_group'] = pd.cut(df['age'], bins=[0, 25, 35, 45, 100], labels=[0, 1, 2, 3])
        df['age_group'] = df['age_group'].astype(int)
        df['young_professional'] = ((df['age'] >= 25) & (df['age'] <= 35)).astype(int)
        
        # Overall health score
        df['overall_health_score'] = (
            (df['sleep_quality_1_5'] / 5) * 0.25 + 
            (df['exercise_minutes_per_week'] / df['exercise_minutes_per_week'].max()) * 0.25 +
            (df['social_hours_per_week'] / df['social_hours_per_week'].max()) * 0.25 +
            (df['mental_wellness_index_0_100'] / 100) * 0.25
        )
        
        # Screen time categories
        df['high_screen_time'] = (df['screen_time_hours'] > 8).astype(int)
        df['extreme_screen_time'] = (df['screen_time_hours'] > 12).astype(int)
        
        # Polynomial features
        df['screen_time_squared'] = df['screen_time_hours'] ** 2
        df['sleep_hours_squared'] = df['sleep_hours'] ** 2
        df['age_squared'] = df['age'] ** 2
        
        return df
    
    def _interpret_stress(self, stress_level: float) -> str:
        """Interpret stress level"""
        if stress_level <= 3:
            return "Low stress - You're managing well with minimal stress"
        elif stress_level <= 6:
            return "Moderate stress - Normal stress levels, manageable"
        elif stress_level <= 8:
            return "High stress - Elevated stress, consider stress management techniques"
        else:
            return "Very high stress - Critical stress levels, professional help recommended"
    
    def _categorize_stress(self, stress_level: float) -> str:
        """Categorize stress level"""
        if stress_level <= 3:
            return "Low"
        elif stress_level <= 6:
            return "Moderate"
        elif stress_level <= 8:
            return "High"
        else:
            return "Very High"
    
    def _get_recommendations(self, stress_level: float, input_data: Dict[str, Any]) -> list:
        """Get personalized recommendations based on stress and lifestyle"""
        recommendations = []
        
        if stress_level > 6:
            recommendations.append("Consider stress management techniques like meditation or yoga")
        
        if input_data.get('sleep_hours', 8) < 7:
            recommendations.append("Aim for 7-9 hours of sleep per night")
        
        if input_data.get('screen_time_hours', 0) > 10:
            recommendations.append("Reduce screen time, especially before bed")
        
        if input_data.get('exercise_minutes_per_week', 0) < 150:
            recommendations.append("Increase physical activity to at least 150 minutes per week")
        
        if input_data.get('social_hours_per_week', 0) < 5:
            recommendations.append("Spend more time on social activities and connections")
        
        if not recommendations:
            recommendations.append("Maintain your current healthy lifestyle")
        
        return recommendations


def get_available_models() -> Dict[str, list]:
    """Get list of available trained models"""
    models = {
        "mental_health": [],
        "academic": []
    }
    
    for model_type in models.keys():
        model_dir = f"ai/models/{model_type}"
        if os.path.exists(model_dir):
            models[model_type] = [f for f in os.listdir(model_dir) if f.endswith('.pkl')]
    
    return models


if __name__ == "__main__":
    # Test model loading
    print("\n=== Testing Model Loader ===\n")
    
    # Test Mental Wellness
    print("Mental Wellness Model:")
    mw_loader = ModelLoader("mental_health")
    mw_loader.load_all()
    print(mw_loader.get_model_info())
    
    print("\n" + "="*50 + "\n")
    
    # Test Academic Impact
    print("Academic Impact Model:")
    ac_loader = ModelLoader("academic")
    ac_loader.load_all()
    print(ac_loader.get_model_info())
    
    print("\n" + "="*50 + "\n")
    
    # Show available models
    print("Available Models:")
    print(get_available_models())
