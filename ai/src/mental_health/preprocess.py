import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, RobustScaler
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
import joblib
import os

def preprocess_data(csv_path, save_preprocessors=True):
    """
    Advanced preprocessing pipeline with feature engineering for distinction-level quality.
    
    Args:
        csv_path: Path to the CSV file
        save_preprocessors: Whether to save preprocessing objects for deployment
        
    Returns:
        X_train, X_test, y_train, y_test, feature_names, preprocessors
    """
    print("🔄 Loading dataset...")
    df = pd.read_csv(csv_path)
    print(f"✅ Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Store original dataframe for analysis
    df_original = df.copy()
    
    # Drop 'user_id' column (non-predictive)
    df = df.drop(columns=["user_id"])
    
    # ============= DATA QUALITY CHECKS =============
    print("\n📊 Data Quality Analysis:")
    print(f"   Missing values: {df.isnull().sum().sum()}")
    print(f"   Duplicate rows: {df.duplicated().sum()}")
    
    # Remove duplicates if any
    if df.duplicated().sum() > 0:
        df = df.drop_duplicates()
        print(f"   ✅ Removed {df.duplicated().sum()} duplicate rows")
    
    # ============= FEATURE ENGINEERING =============
    print("\n🔧 Feature Engineering:")
    
    # 1. Screen time ratios and patterns
    df['work_screen_ratio'] = df['work_screen_hours'] / (df['screen_time_hours'] + 1e-6)
    df['leisure_screen_ratio'] = df['leisure_screen_hours'] / (df['screen_time_hours'] + 1e-6)
    
    # 2. Sleep efficiency (sleep quality per hour)
    df['sleep_efficiency'] = df['sleep_quality_1_5'] / (df['sleep_hours'] + 1e-6)
    
    # 3. Work-life balance indicators
    df['work_life_balance'] = df['social_hours_per_week'] / (df['work_screen_hours'] + 1e-6)
    df['screen_sleep_ratio'] = df['screen_time_hours'] / (df['sleep_hours'] + 1e-6)
    
    # 4. Health score (combination of exercise, sleep, and social time)
    df['health_score'] = (
        (df['sleep_quality_1_5'] / 5) * 0.3 + 
        (df['exercise_minutes_per_week'] / df['exercise_minutes_per_week'].max()) * 0.4 +
        (df['social_hours_per_week'] / df['social_hours_per_week'].max()) * 0.3
    )
    
    # 5. Stress-productivity interaction
    df['stress_productivity_interaction'] = df['stress_level_0_10'] * (100 - df['productivity_0_100']) / 100
    
    # 6. Age groups for non-linear patterns
    df['age_group'] = pd.cut(df['age'], bins=[0, 25, 35, 45, 100], labels=[0, 1, 2, 3])
    df['age_group'] = df['age_group'].astype(int)
    
    # 7. Screen time categories
    df['high_screen_time'] = (df['screen_time_hours'] > df['screen_time_hours'].median()).astype(int)
    df['excessive_work_screen'] = (df['work_screen_hours'] > 8).astype(int)
    
    # 8. Polynomial features for key metrics
    df['screen_time_squared'] = df['screen_time_hours'] ** 2
    df['stress_squared'] = df['stress_level_0_10'] ** 2
    df['sleep_squared'] = df['sleep_hours'] ** 2
    
    print(f"   ✅ Created {len(df.columns) - len(df_original.columns) + 1} new features")
    
    # ============= HANDLE MISSING VALUES =============
    print("\n🔧 Handling missing values...")
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if 'mental_wellness_index_0_100' in numeric_cols:
        numeric_cols.remove('mental_wellness_index_0_100')
    
    imputer = SimpleImputer(strategy="median")
    df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
    
    # ============= ENCODE CATEGORICAL VARIABLES =============
    print("🔧 Encoding categorical variables...")
    categorical_cols = ["gender", "occupation", "work_mode"]
    
    # Store encoders for each column
    encoders = {}
    for col in categorical_cols:
        encoder = LabelEncoder()
        df[col] = encoder.fit_transform(df[col])
        encoders[col] = encoder
    
    # ============= HANDLE OUTLIERS =============
    print("🔧 Handling outliers using IQR method...")
    
    # Use RobustScaler which is less sensitive to outliers
    outlier_cols = ['screen_time_hours', 'work_screen_hours', 'leisure_screen_hours', 
                    'exercise_minutes_per_week', 'social_hours_per_week']
    
    for col in outlier_cols:
        if col in df.columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 3 * IQR
            upper_bound = Q3 + 3 * IQR
            
            # Cap outliers instead of removing them
            df[col] = df[col].clip(lower=lower_bound, upper=upper_bound)
    
    # ============= PREPARE FEATURES AND TARGET =============
    X = df.drop(columns=["mental_wellness_index_0_100"])
    y = df["mental_wellness_index_0_100"]
    
    # ============= FEATURE SCALING =============
    print("🔧 Scaling features...")
    
    # Use RobustScaler for better handling of outliers
    scaler = RobustScaler()
    
    # Scale all numeric features
    feature_names = X.columns.tolist()
    X_scaled = scaler.fit_transform(X)
    X = pd.DataFrame(X_scaled, columns=feature_names)
    
    # ============= TRAIN-TEST SPLIT =============
    print("🔧 Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=pd.qcut(y, q=5, labels=False, duplicates='drop')
    )
    
    print(f"   ✅ Train set: {X_train.shape[0]} samples")
    print(f"   ✅ Test set: {X_test.shape[0]} samples")
    
    # ============= SAVE PREPROCESSORS =============
    if save_preprocessors:
        preprocessors = {
            'scaler': scaler,
            'encoders': encoders,
            'imputer': imputer,
            'feature_names': feature_names
        }
        
        # Create directory if it doesn't exist
        os.makedirs("ai/models/mental_health", exist_ok=True)
        joblib.dump(preprocessors, "ai/models/mental_health/preprocessors.pkl")
        print("\n✅ Preprocessors saved for deployment")
    else:
        preprocessors = None
    
    print("\n✅ Preprocessing completed successfully!\n")
    
    return X_train, X_test, y_train, y_test, feature_names, preprocessors

