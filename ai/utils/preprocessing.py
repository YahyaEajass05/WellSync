"""
Preprocessing utilities for production predictions
Transforms raw input data into model-ready features
"""
import pandas as pd
import numpy as np
from typing import Dict, Any


def preprocess_mental_wellness_input(input_data: Dict[str, Any], preprocessors: Dict) -> pd.DataFrame:
    """
    Transform raw mental wellness input into model-ready features
    
    Args:
        input_data: Dictionary with user input
        preprocessors: Loaded preprocessing objects (scaler, encoders, etc.)
        
    Returns:
        DataFrame with engineered and scaled features
    """
    # Create DataFrame from input
    df = pd.DataFrame([input_data])
    
    # ============= FEATURE ENGINEERING (Same as training) =============
    
    # 1. Screen time ratios and patterns
    df['work_screen_ratio'] = df['work_screen_hours'] / (df['screen_time_hours'] + 1e-6)
    df['leisure_screen_ratio'] = df['leisure_screen_hours'] / (df['screen_time_hours'] + 1e-6)
    
    # 2. Sleep efficiency
    df['sleep_efficiency'] = df['sleep_quality_1_5'] / (df['sleep_hours'] + 1e-6)
    
    # 3. Work-life balance indicators
    df['work_life_balance'] = df['social_hours_per_week'] / (df['work_screen_hours'] + 1e-6)
    df['screen_sleep_ratio'] = df['screen_time_hours'] / (df['sleep_hours'] + 1e-6)
    
    # 4. Health score
    df['health_score'] = (
        (df['sleep_quality_1_5'] / 5) * 0.3 + 
        (df['exercise_minutes_per_week'] / 300) * 0.4 +  # Assuming max 300 mins
        (df['social_hours_per_week'] / 20) * 0.3  # Assuming max 20 hours
    )
    
    # 5. Stress-productivity interaction
    df['stress_productivity_interaction'] = df['stress_level_0_10'] * (100 - df['productivity_0_100']) / 100
    
    # 6. Age groups
    age = df['age'].iloc[0]
    if age <= 25:
        df['age_group'] = 0
    elif age <= 35:
        df['age_group'] = 1
    elif age <= 45:
        df['age_group'] = 2
    else:
        df['age_group'] = 3
    
    # 7. Screen time categories
    df['high_screen_time'] = (df['screen_time_hours'] > 8).astype(int)  # Median approximation
    df['excessive_work_screen'] = (df['work_screen_hours'] > 8).astype(int)
    
    # 8. Polynomial features
    df['screen_time_squared'] = df['screen_time_hours'] ** 2
    df['stress_squared'] = df['stress_level_0_10'] ** 2
    df['sleep_squared'] = df['sleep_hours'] ** 2
    
    # ============= ENCODE CATEGORICAL VARIABLES =============
    encoders = preprocessors['encoders']
    categorical_cols = ['gender', 'occupation', 'work_mode']
    
    for col in categorical_cols:
        if col in encoders:
            # Handle unseen categories
            try:
                df[col] = encoders[col].transform(df[col])
            except ValueError:
                # Use most common class (0) for unseen categories
                df[col] = 0
    
    # ============= ENSURE CORRECT FEATURE ORDER =============
    feature_names = preprocessors['feature_names']
    
    # Add missing features with default values if any
    for feature in feature_names:
        if feature not in df.columns:
            df[feature] = 0
    
    # Select and order features correctly
    df = df[feature_names]
    
    # ============= SCALE FEATURES =============
    scaler = preprocessors['scaler']
    X_scaled = scaler.transform(df)
    
    return pd.DataFrame(X_scaled, columns=feature_names)


def preprocess_academic_input(input_data: Dict[str, Any], preprocessors: Dict) -> pd.DataFrame:
    """
    Transform raw academic impact input into model-ready features
    
    Args:
        input_data: Dictionary with student input
        preprocessors: Loaded preprocessing objects
        
    Returns:
        DataFrame with engineered and scaled features
    """
    # Create DataFrame from input
    df = pd.DataFrame([input_data])
    
    # ============= FEATURE ENGINEERING (Same as training) =============
    
    # 1. Usage intensity
    usage = df['avg_daily_usage_hours'].iloc[0]
    if usage <= 2:
        df['usage_intensity'] = 0
    elif usage <= 4:
        df['usage_intensity'] = 1
    elif usage <= 6:
        df['usage_intensity'] = 2
    else:
        df['usage_intensity'] = 3
    
    # 2. Sleep deficit
    df['sleep_deficit'] = (8 - df['sleep_hours_per_night']).clip(lower=0)
    df['severe_sleep_deficit'] = (df['sleep_hours_per_night'] < 6).astype(int)
    
    # 3. Mental health risk
    mh_score = df['mental_health_score'].iloc[0]
    if mh_score <= 3:
        df['mental_health_risk'] = 2  # High risk
    elif mh_score <= 6:
        df['mental_health_risk'] = 1  # Medium risk
    else:
        df['mental_health_risk'] = 0  # Low risk
    
    # 4. Usage-sleep interaction
    df['usage_sleep_ratio'] = df['avg_daily_usage_hours'] / (df['sleep_hours_per_night'] + 1e-6)
    
    # 5. Mental-sleep score
    df['mental_sleep_score'] = df['mental_health_score'] * df['sleep_hours_per_night'] / 10
    
    # 6. Conflict intensity
    df['high_conflict'] = (df['conflicts_over_social_media'] >= 4).astype(int)
    
    # 7. Age groups
    age = df['age'].iloc[0]
    if age <= 19:
        df['age_group'] = 0
    elif age <= 21:
        df['age_group'] = 1
    else:
        df['age_group'] = 2
    
    # 8. Academic performance binary
    df['poor_academic_performance'] = (df['affects_academic_performance'].str.lower() == 'yes').astype(int)
    
    # 9. Combined risk score
    df['combined_risk_score'] = (
        (df['avg_daily_usage_hours'] / 10) * 0.3 +
        (df['sleep_deficit'] / 8) * 0.25 +
        ((10 - df['mental_health_score']) / 10) * 0.25 +
        (df['conflicts_over_social_media'] / 5) * 0.2
    ) * 10
    
    # 10. Usage squared
    df['usage_squared'] = df['avg_daily_usage_hours'] ** 2
    
    # 11. Mental health squared
    df['mental_health_squared'] = df['mental_health_score'] ** 2
    
    # 12. Usage × conflicts interaction
    df['usage_conflict_interaction'] = df['avg_daily_usage_hours'] * df['conflicts_over_social_media']
    
    # 13. Platform usage intensity
    popular_platforms = ['Instagram', 'TikTok', 'Snapchat', 'Facebook', 'Twitter']
    df['uses_popular_platform'] = df['most_used_platform'].isin(popular_platforms).astype(int)
    
    # 14. Relationship impact
    df['has_relationship'] = (df['relationship_status'].str.lower() != 'single').astype(int)
    
    # ============= RENAME COLUMNS TO MATCH TRAINING =============
    # Training data uses capitalized column names
    column_mapping = {
        'age': 'Age',
        'gender': 'Gender',
        'academic_level': 'Academic_Level',
        'country': 'Country',
        'most_used_platform': 'Most_Used_Platform',
        'avg_daily_usage_hours': 'Avg_Daily_Usage_Hours',
        'sleep_hours_per_night': 'Sleep_Hours_Per_Night',
        'mental_health_score': 'Mental_Health_Score',
        'conflicts_over_social_media': 'Conflicts_Over_Social_Media',
        'affects_academic_performance': 'Affects_Academic_Performance',
        'relationship_status': 'Relationship_Status'
    }
    
    df = df.rename(columns=column_mapping)
    
    # ============= ENCODE CATEGORICAL VARIABLES =============
    encoders = preprocessors['encoders']
    categorical_cols = ['Gender', 'Academic_Level', 'Country', 'Most_Used_Platform', 
                       'Affects_Academic_Performance', 'Relationship_Status']
    
    for col in categorical_cols:
        if col in encoders and col in df.columns:
            try:
                df[col] = encoders[col].transform(df[col])
            except ValueError:
                # Use default value for unseen categories
                df[col] = 0
    
    # ============= ENSURE CORRECT FEATURE ORDER =============
    feature_names = preprocessors['feature_names']
    
    # Add missing features
    for feature in feature_names:
        if feature not in df.columns:
            df[feature] = 0
    
    # Select and order features
    df = df[feature_names]
    
    # ============= SCALE FEATURES =============
    scaler = preprocessors['scaler']
    X_scaled = scaler.transform(df)
    
    return pd.DataFrame(X_scaled, columns=feature_names)


def interpret_mental_wellness_score(score: float) -> str:
    """Provide human-readable interpretation of mental wellness score"""
    if score >= 80:
        return "Excellent mental wellness"
    elif score >= 70:
        return "Good mental wellness"
    elif score >= 60:
        return "Moderate mental wellness"
    elif score >= 50:
        return "Below average mental wellness"
    else:
        return "Poor mental wellness - consider lifestyle changes"


def interpret_addiction_score(score: float) -> str:
    """Provide human-readable interpretation of addiction score"""
    if score >= 7:
        return "High social media addiction risk - significant academic impact likely"
    elif score >= 5:
        return "Moderate addiction risk - some academic impact"
    elif score >= 4:
        return "Low to moderate addiction risk"
    else:
        return "Low addiction risk - healthy social media usage"
