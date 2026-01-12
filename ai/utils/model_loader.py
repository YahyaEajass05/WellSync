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
        self.base_path = f"ai/models/{model_type}"
        self.model = None
        self.preprocessors = None
        self.feature_names = None
        self.metadata = None
        
    def load_model(self, model_name: str = "best_model.pkl"):
        """Load a trained model"""
        model_path = os.path.join(self.base_path, model_name)
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
            
        self.model = joblib.load(model_path)
        print(f"✅ Loaded model: {model_path}")
        return self.model
    
    def load_preprocessors(self):
        """Load preprocessing objects"""
        preprocessor_path = os.path.join(self.base_path, "preprocessors.pkl")
        
        if not os.path.exists(preprocessor_path):
            raise FileNotFoundError(f"Preprocessors not found: {preprocessor_path}")
            
        self.preprocessors = joblib.load(preprocessor_path)
        print(f"✅ Loaded preprocessors")
        return self.preprocessors
    
    def load_feature_names(self):
        """Load feature names"""
        feature_path = os.path.join(self.base_path, "feature_names.pkl")
        
        if not os.path.exists(feature_path):
            raise FileNotFoundError(f"Feature names not found: {feature_path}")
            
        self.feature_names = joblib.load(feature_path)
        print(f"✅ Loaded {len(self.feature_names)} feature names")
        return self.feature_names
    
    def load_metadata(self):
        """Load model metadata"""
        metadata_path = os.path.join(self.base_path, "model_metadata.pkl")
        
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
        # This is a placeholder - actual preprocessing would happen here
        # based on the preprocess.py logic
        
        # For now, return model info
        return {
            "prediction": "Feature engineering required",
            "model_info": self.loader.get_model_info(),
            "note": "Full preprocessing pipeline needed for actual predictions"
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
        # This is a placeholder - actual preprocessing would happen here
        
        return {
            "prediction": "Feature engineering required",
            "model_info": self.loader.get_model_info(),
            "note": "Full preprocessing pipeline needed for actual predictions"
        }


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
