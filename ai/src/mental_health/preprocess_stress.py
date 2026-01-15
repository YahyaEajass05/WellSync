import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, RobustScaler
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
import joblib
import os

def preprocess_stress_data(csv_path, save_preprocessors=True):
    """
    Preprocessing pipeline for stress level prediction.
    
    Target: stress_level_0_10
    Features: age, screen_time_hours, sleep_hours, and other lifestyle factors
    
    Args:
        csv_path: Path to the CSV file
        save_preprocessors: Whether to save preprocessing objects for deployment
        
    Returns:
        X_train, X_test, y_train, y_test, feature_names, preprocessors
    """
    print("🔄 Loading dataset for stress prediction...")
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
    print("\n🔧 Feature Engineering for Stress Prediction:")
    
    # 1. Screen time patterns (excessive screen time increases stress)
    df['total_screen_ratio'] = df['screen_time_hours'] / 24.0  # Proportion of day
    df['work_screen_ratio'] = df['work_screen_hours'] / (df['screen_time_hours'] + 1e-6)
    df['leisure_screen_ratio'] = df['leisure_screen_hours'] / (df['screen_time_hours'] + 1e-6)
    
    # 2. Sleep deficiency (poor sleep increases stress)
    df['sleep_deficit'] = np.maximum(0, 8 - df['sleep_hours'])  # Optimal is ~8 hours
    df['sleep_efficiency'] = df['sleep_quality_1_5'] / (df['sleep_hours'] + 1e-6)
    df['poor_sleep_indicator'] = ((df['sleep_hours'] < 6) | (df['sleep_quality_1_5'] < 2)).astype(int)
    
    # 3. Work-life imbalance (poor balance increases stress)
    df['work_life_balance'] = df['social_hours_per_week'] / (df['work_screen_hours'] + 1e-6)
    df['screen_sleep_ratio'] = df['screen_time_hours'] / (df['sleep_hours'] + 1e-6)
    df['excessive_work_screen'] = (df['work_screen_hours'] > 8).astype(int)
    
    # 4. Low physical activity (exercise reduces stress)
    df['exercise_hours_week'] = df['exercise_minutes_per_week'] / 60.0
    df['low_exercise'] = (df['exercise_minutes_per_week'] < 150).astype(int)  # WHO recommends 150 min/week
    
    # 5. Social isolation (low social interaction increases stress)
    df['social_isolation'] = (df['social_hours_per_week'] < 5).astype(int)
    df['social_exercise_score'] = (df['social_hours_per_week'] + df['exercise_hours_week']) / 2
    
    # 6. Productivity stress relationship
    df['low_productivity'] = (df['productivity_0_100'] < 50).astype(int)
    df['productivity_wellness_gap'] = abs(df['productivity_0_100'] - df['mental_wellness_index_0_100'])
    
    # 7. Age-related stress patterns
    df['age_group'] = pd.cut(df['age'], bins=[0, 25, 35, 45, 100], labels=[0, 1, 2, 3])
    df['age_group'] = df['age_group'].astype(int)
    df['young_professional'] = ((df['age'] >= 25) & (df['age'] <= 35)).astype(int)
    
    # 8. Combined health score (inverse relationship with stress)
    df['overall_health_score'] = (
        (df['sleep_quality_1_5'] / 5) * 0.25 + 
        (df['exercise_minutes_per_week'] / df['exercise_minutes_per_week'].max()) * 0.25 +
        (df['social_hours_per_week'] / df['social_hours_per_week'].max()) * 0.25 +
        (df['mental_wellness_index_0_100'] / 100) * 0.25
    )
    
    # 9. Screen time categories
    df['high_screen_time'] = (df['screen_time_hours'] > df['screen_time_hours'].median()).astype(int)
    df['extreme_screen_time'] = (df['screen_time_hours'] > 12).astype(int)
    
    # 10. Polynomial features for key non-linear relationships
    df['screen_time_squared'] = df['screen_time_hours'] ** 2
    df['sleep_hours_squared'] = df['sleep_hours'] ** 2
    df['age_squared'] = df['age'] ** 2
    
    # Replace any inf values with NaN, then handle them
    df = df.replace([np.inf, -np.inf], np.nan)
    
    print(f"   ✅ Created {len(df.columns) - len(df_original.columns) + 1} new features")
    
    # ============= HANDLE MISSING VALUES =============
    print("\n🔧 Handling missing values...")
    
    # CRITICAL: Separate target BEFORE any operations that might affect indices
    y = df['stress_level_0_10'].copy()
    X = df.drop(columns=['stress_level_0_10'])
    
    # Check and remove rows with NaN in target
    nan_mask = y.isnull()
    if nan_mask.sum() > 0:
        print(f"   ⚠️  Removing {nan_mask.sum()} rows with missing stress_level values")
        y = y[~nan_mask]
        X = X[~nan_mask]
    
    # Check for remaining NaN or inf values in features
    nan_counts = X.isnull().sum()
    if nan_counts.sum() > 0:
        print(f"   ⚠️  Found NaN values in {nan_counts[nan_counts > 0].shape[0]} features, imputing...")
    
    # Get numeric columns for imputation
    numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    
    imputer = SimpleImputer(strategy="median")
    X[numeric_cols] = imputer.fit_transform(X[numeric_cols])
    
    # ============= ENCODE CATEGORICAL VARIABLES =============
    print("🔧 Encoding categorical variables...")
    categorical_cols = ["gender", "occupation", "work_mode"]
    
    # Store encoders for each column
    encoders = {}
    for col in categorical_cols:
        if col in X.columns:
            encoder = LabelEncoder()
            X[col] = encoder.fit_transform(X[col])
            encoders[col] = encoder
    
    # ============= HANDLE OUTLIERS =============
    print("🔧 Handling outliers using IQR method...")
    
    outlier_cols = ['screen_time_hours', 'work_screen_hours', 'leisure_screen_hours', 
                    'exercise_minutes_per_week', 'social_hours_per_week']
    
    for col in outlier_cols:
        if col in X.columns:
            Q1 = X[col].quantile(0.25)
            Q3 = X[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 3 * IQR
            upper_bound = Q3 + 3 * IQR
            
            # Cap outliers instead of removing them
            X[col] = X[col].clip(lower=lower_bound, upper=upper_bound)
    
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
    
    # Reset indices to avoid misalignment
    X = X.reset_index(drop=True)
    y = y.reset_index(drop=True)
    
    # Stratify based on stress level bins (include_lowest=True to handle edge cases)
    try:
        stress_bins = pd.cut(y, bins=[0, 3, 6, 8, 11], labels=[0, 1, 2, 3], include_lowest=True)
        
        # Handle any remaining NaN in bins by using qcut instead
        if stress_bins.isnull().sum() > 0:
            print(f"   ⚠️  Using qcut for stratification due to edge cases")
            stress_bins = pd.qcut(y, q=4, labels=[0, 1, 2, 3], duplicates='drop')
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=stress_bins
        )
    except:
        # Fallback: no stratification if binning fails
        print(f"   ⚠️  Skipping stratification due to binning issues")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
    
    print(f"   ✅ Train set: {X_train.shape[0]} samples")
    print(f"   ✅ Test set: {X_test.shape[0]} samples")
    print(f"   📊 Stress level distribution (train):")
    print(f"      Mean: {y_train.mean():.2f}, Std: {y_train.std():.2f}")
    print(f"   📊 Stress level distribution (test):")
    print(f"      Mean: {y_test.mean():.2f}, Std: {y_test.std():.2f}")
    
    # ============= SAVE PREPROCESSORS =============
    if save_preprocessors:
        preprocessors = {
            'scaler': scaler,
            'encoders': encoders,
            'imputer': imputer,
            'feature_names': feature_names
        }
        
        # Create directory if it doesn't exist
        os.makedirs("../../../ai/models/mental_health", exist_ok=True)
        joblib.dump(preprocessors, "../../../ai/models/mental_health/stress_preprocessors.pkl")
        print("\n✅ Stress preprocessors saved for deployment")
    else:
        preprocessors = None
    
    print("\n✅ Stress prediction preprocessing completed successfully!\n")
    
    return X_train, X_test, y_train, y_test, feature_names, preprocessors
