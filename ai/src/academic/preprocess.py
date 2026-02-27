"""
Advanced Preprocessing Pipeline for Academic Impact Analyzer
Predicts social media addiction impact on academic performance
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, RobustScaler
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
import joblib
import os

def preprocess_data(csv_path, target_variable='Addicted_Score', save_preprocessors=True):
    """
    Advanced preprocessing pipeline for Academic Impact prediction.
    
    Args:
        csv_path: Path to the CSV file
        target_variable: Target to predict ('Addicted_Score' or 'Affects_Academic_Performance')
        save_preprocessors: Whether to save preprocessing objects
        
    Returns:
        X_train, X_test, y_train, y_test, feature_names, preprocessors
    """
    print("Loading Academic Impact dataset...")
    df = pd.read_csv(csv_path)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Store original dataframe
    df_original = df.copy()
    
    # Drop Student_ID (non-predictive)
    df = df.drop(columns=["Student_ID"])
    
    # Data quality checks
    print("\nData Quality Analysis:")
    print(f"Missing values: {df.isnull().sum().sum()}")
    print(f"Duplicate rows: {df.duplicated().sum()}")
    
    # Remove duplicates if any
    if df.duplicated().sum() > 0:
        df = df.drop_duplicates()
        print(f"Removed {df.duplicated().sum()} duplicate rows")
    
    # Feature engineering
    print("\nFeature Engineering for Academic Impact:")
    
    # Social media usage intensity
    df['usage_intensity'] = pd.cut(df['Avg_Daily_Usage_Hours'], 
                                    bins=[0, 2, 4, 6, 24], 
                                    labels=[0, 1, 2, 3])  # Low, Medium, High, Very High
    df['usage_intensity'] = df['usage_intensity'].astype(int)
    
    # Sleep deficit indicator
    df['sleep_deficit'] = (8 - df['Sleep_Hours_Per_Night']).clip(lower=0)
    df['severe_sleep_deficit'] = (df['Sleep_Hours_Per_Night'] < 6).astype(int)
    
    # Mental health risk levels
    df['mental_health_risk'] = pd.cut(df['Mental_Health_Score'], 
                                       bins=[0, 3, 6, 10], 
                                       labels=[2, 1, 0])  # High, Medium, Low risk
    df['mental_health_risk'] = df['mental_health_risk'].astype(int)
    
    # Usage-sleep interaction
    df['usage_sleep_ratio'] = df['Avg_Daily_Usage_Hours'] / (df['Sleep_Hours_Per_Night'] + 1e-6)
    
    # Mental health impact score
    df['mental_sleep_score'] = df['Mental_Health_Score'] * df['Sleep_Hours_Per_Night'] / 10
    
    # Conflict intensity
    df['high_conflict'] = (df['Conflicts_Over_Social_Media'] >= 4).astype(int)
    
    # Age groups for pattern detection
    df['age_group'] = pd.cut(df['Age'], bins=[17, 19, 21, 25], labels=[0, 1, 2])
    df['age_group'] = df['age_group'].astype(int)
    
    # Academic performance binary
    df['poor_academic_performance'] = (df['Affects_Academic_Performance'] == 'Yes').astype(int)
    
    # Combined risk score
    df['combined_risk_score'] = (
        (df['Avg_Daily_Usage_Hours'] / 10) * 0.3 +
        (df['sleep_deficit'] / 8) * 0.25 +
        ((10 - df['Mental_Health_Score']) / 10) * 0.25 +
        (df['Conflicts_Over_Social_Media'] / 5) * 0.2
    ) * 10
    
    # Usage squared for non-linear effects
    df['usage_squared'] = df['Avg_Daily_Usage_Hours'] ** 2
    
    # Mental health squared
    df['mental_health_squared'] = df['Mental_Health_Score'] ** 2
    
    # Interaction: usage × conflicts
    df['usage_conflict_interaction'] = df['Avg_Daily_Usage_Hours'] * df['Conflicts_Over_Social_Media']
    
    # Platform usage intensity (encode popular platforms differently)
    popular_platforms = ['Instagram', 'TikTok', 'Snapchat', 'Facebook', 'Twitter']
    df['uses_popular_platform'] = df['Most_Used_Platform'].isin(popular_platforms).astype(int)
    
    # Relationship impact
    df['has_relationship'] = (df['Relationship_Status'] != 'Single').astype(int)
    
    print(f"Created {len(df.columns) - len(df_original.columns) + 1} new features")
    
    # Handle missing values
    print("\nHandling missing values...")
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if target_variable in numeric_cols:
        numeric_cols.remove(target_variable)
    
    imputer = SimpleImputer(strategy="median")
    df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
    
    # Encode categorical variables
    print("Encoding categorical variables...")
    categorical_cols = ["Gender", "Academic_Level", "Country", "Most_Used_Platform", 
                       "Affects_Academic_Performance", "Relationship_Status"]
    
    # Store encoders
    encoders = {}
    for col in categorical_cols:
        if col in df.columns:
            encoder = LabelEncoder()
            df[col] = encoder.fit_transform(df[col])
            encoders[col] = encoder
    
    # Handle outliers
    print("Handling outliers using IQR method...")
    
    outlier_cols = ['Avg_Daily_Usage_Hours', 'Sleep_Hours_Per_Night', 'usage_sleep_ratio']
    
    for col in outlier_cols:
        if col in df.columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 3 * IQR
            upper_bound = Q3 + 3 * IQR
            
            # Cap outliers
            df[col] = df[col].clip(lower=lower_bound, upper=upper_bound)
    
    # Prepare features and target
    X = df.drop(columns=[target_variable])
    y = df[target_variable]
    
    # Feature scaling
    print("Scaling features...")
    
    scaler = RobustScaler()
    feature_names = X.columns.tolist()
    X_scaled = scaler.fit_transform(X)
    X = pd.DataFrame(X_scaled, columns=feature_names)
    
    # Train-test split
    print("Splitting data (80% train, 20% test)...")
    
    # For regression (Addicted_Score)
    if target_variable == 'Addicted_Score':
        stratify_var = pd.qcut(y, q=4, labels=False, duplicates='drop')
    else:
        stratify_var = y
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify_var
    )
    
    print(f"Train set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Save preprocessors
    if save_preprocessors:
        preprocessors = {
            'scaler': scaler,
            'encoders': encoders,
            'imputer': imputer,
            'feature_names': feature_names,
            'target_variable': target_variable
        }
        
        os.makedirs("ai/models/academic", exist_ok=True)
        joblib.dump(preprocessors, "ai/models/academic/preprocessors.pkl")
        print("\nPreprocessors saved for deployment")
    else:
        preprocessors = None
    
    print("\nPreprocessing completed successfully!\n")
    
    return X_train, X_test, y_train, y_test, feature_names, preprocessors
