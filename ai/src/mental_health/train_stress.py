"""
Stress Level Prediction - Training Script
Target: stress_level_0_10
Features: age, screen_time, sleep_hours, and comprehensive lifestyle factors
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import (
    RandomForestRegressor, 
    GradientBoostingRegressor,
    VotingRegressor,
    ExtraTreesRegressor
)
from sklearn.linear_model import Ridge, ElasticNet
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import cross_val_score, GridSearchCV
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os
import warnings
warnings.filterwarnings('ignore')

# Import preprocessing function
from preprocess_stress import preprocess_stress_data

def train_stress_models(csv_path="../../../ai/data/ScreenTime_MentalWellness.csv"):
    """
    Train multiple models for stress level prediction and select the best one.
    
    Args:
        csv_path: Path to the dataset
        
    Returns:
        best_model, model_name, results_dict
    """
    
    print("\nStress Level Prediction - Training Pipeline")
    
    # Step 1: Preprocessing
    print("\nStep 1: Data Preprocessing")
    
    X_train, X_test, y_train, y_test, feature_names, preprocessors = preprocess_stress_data(
        csv_path, save_preprocessors=True
    )
    
    print(f"\nDataset Summary:")
    print(f"   Training samples: {X_train.shape[0]}")
    print(f"   Testing samples: {X_test.shape[0]}")
    print(f"   Number of features: {X_train.shape[1]}")
    print(f"   Target range: [{y_train.min():.2f}, {y_train.max():.2f}]")
    
    # Step 2: Baseline Models
    print("\nStep 2: Training Baseline Models")
    
    models = {
        'Linear Ridge': Ridge(alpha=1.0, random_state=42),
        'K-Nearest Neighbors': KNeighborsRegressor(n_neighbors=5),
        'Decision Tree': DecisionTreeRegressor(max_depth=10, random_state=42),
        'Random Forest': RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        'Extra Trees': ExtraTreesRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42),
        'Support Vector Regressor': SVR(kernel='rbf', C=10, epsilon=0.1)
    }
    
    results = {}
    trained_models = {}
    
    print("\nTraining and evaluating baseline models...")
    
    for name, model in models.items():
        print(f"\n   Training {name}...")
        
        # Train model
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Metrics
        train_r2 = r2_score(y_train, y_pred_train)
        test_r2 = r2_score(y_test, y_pred_test)
        train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
        test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
        train_mae = mean_absolute_error(y_train, y_pred_train)
        test_mae = mean_absolute_error(y_test, y_pred_test)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, 
                                    scoring='r2', n_jobs=-1)
        
        results[name] = {
            'train_r2': train_r2,
            'test_r2': test_r2,
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'train_mae': train_mae,
            'test_mae': test_mae,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'predictions': y_pred_test
        }
        
        trained_models[name] = model
        
        print(f"      R² Score: {test_r2:.4f} | RMSE: {test_rmse:.4f} | MAE: {test_mae:.4f}")
    
    # Step 3: Hyperparameter Tuning
    print("\nStep 3: Hyperparameter Tuning (Top Models)")
    
    # Sort models by test R2 score
    sorted_models = sorted(results.items(), key=lambda x: x[1]['test_r2'], reverse=True)
    top_model_name = sorted_models[0][0]
    
    print(f"\nBest baseline model: {top_model_name} (R² = {sorted_models[0][1]['test_r2']:.4f})")
    
    # Tune the best model
    print(f"\nTuning {top_model_name}...")
    
    if 'Gradient Boosting' in top_model_name:
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [3, 5, 7],
            'learning_rate': [0.01, 0.05, 0.1],
            'min_samples_split': [2, 5, 10],
            'subsample': [0.8, 0.9, 1.0]
        }
        base_model = GradientBoostingRegressor(random_state=42)
        
    elif 'Random Forest' in top_model_name or 'Extra Trees' in top_model_name:
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'max_features': ['sqrt', 'log2']
        }
        if 'Extra Trees' in top_model_name:
            base_model = ExtraTreesRegressor(random_state=42, n_jobs=-1)
        else:
            base_model = RandomForestRegressor(random_state=42, n_jobs=-1)
    else:
        # For other models, use the baseline
        print(f"   No tuning configuration for {top_model_name}, using baseline")
        tuned_model = trained_models[top_model_name]
        param_grid = None
    
    if param_grid:
        grid_search = GridSearchCV(
            base_model, param_grid, cv=5, scoring='r2',
            n_jobs=-1, verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        tuned_model = grid_search.best_estimator_
        
        print(f"\n   Best parameters: {grid_search.best_params_}")
        print(f"   Best CV R² score: {grid_search.best_score_:.4f}")
    
    # Evaluate tuned model
    y_pred_train_tuned = tuned_model.predict(X_train)
    y_pred_test_tuned = tuned_model.predict(X_test)
    
    tuned_r2 = r2_score(y_test, y_pred_test_tuned)
    tuned_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test_tuned))
    tuned_mae = mean_absolute_error(y_test, y_pred_test_tuned)
    
    print(f"\n   Tuned Model Performance:")
    print(f"      R² Score: {tuned_r2:.4f}")
    print(f"      RMSE: {tuned_rmse:.4f}")
    print(f"      MAE: {tuned_mae:.4f}")
    
    # Step 4: Ensemble Model
    print("\nStep 4: Creating Voting Ensemble")
    
    # Select top 3 models for ensemble
    top_3_models = []
    for name, _ in sorted_models[:3]:
        top_3_models.append((name, trained_models[name]))
    
    print(f"\nCreating ensemble with: {[name for name, _ in top_3_models]}")
    
    voting_model = VotingRegressor(estimators=top_3_models, n_jobs=-1)
    voting_model.fit(X_train, y_train)
    
    y_pred_voting = voting_model.predict(X_test)
    voting_r2 = r2_score(y_test, y_pred_voting)
    voting_rmse = np.sqrt(mean_squared_error(y_test, y_pred_voting))
    voting_mae = mean_absolute_error(y_test, y_pred_voting)
    
    print(f"\n   Voting Ensemble Performance:")
    print(f"      R² Score: {voting_r2:.4f}")
    print(f"      RMSE: {voting_rmse:.4f}")
    print(f"      MAE: {voting_mae:.4f}")
    
    # Step 5: Select Best Model
    print("\nStep 5: Model Selection")
    
    candidates = {
        f'Tuned {top_model_name}': (tuned_model, tuned_r2, tuned_rmse, tuned_mae, y_pred_test_tuned),
        'Voting Ensemble': (voting_model, voting_r2, voting_rmse, voting_mae, y_pred_voting)
    }
    
    best_name = max(candidates.items(), key=lambda x: x[1][1])[0]
    best_model, best_r2, best_rmse, best_mae, best_predictions = candidates[best_name]
    
    print(f"\nBest Model: {best_name}")
    print(f"   R² Score: {best_r2:.4f}")
    print(f"   RMSE: {best_rmse:.4f}")
    print(f"   MAE: {best_mae:.4f}")
    
    # Step 6: Feature Importance
    print("\nStep 6: Feature Importance Analysis")
    
    # Get feature importance (if available)
    if hasattr(best_model, 'feature_importances_'):
        feature_importance = best_model.feature_importances_
    elif hasattr(best_model, 'estimators_'):
        # For voting ensemble, average the importances
        importances = []
        for est_name, estimator in best_model.estimators_:
            if hasattr(estimator, 'feature_importances_'):
                importances.append(estimator.feature_importances_)
        if importances:
            feature_importance = np.mean(importances, axis=0)
        else:
            feature_importance = None
    else:
        feature_importance = None
    
    if feature_importance is not None:
        importance_df = pd.DataFrame({
            'Feature': feature_names,
            'Importance': feature_importance
        }).sort_values('Importance', ascending=False)
        
        print(f"\nTop 10 Most Important Features:")
        for idx, row in importance_df.head(10).iterrows():
            print(f"   {row['Feature']:<40} {row['Importance']:.4f}")
    
    # Step 7: Save Model
    print("\nStep 7: Saving Model")
    
    # Create directory
    os.makedirs("../../../ai/models/mental_health", exist_ok=True)
    
    # Save best model
    model_path = "../../../ai/models/mental_health/stress_model.pkl"
    joblib.dump(best_model, model_path)
    print(f"\nModel saved: {model_path}")
    
    # Step 8: Visualizations
    print("\nStep 8: Generating Visualizations")
    
    viz_dir = "../../../ai/models/mental_health/visualizations"
    os.makedirs(viz_dir, exist_ok=True)
    
    # 1. Predictions vs Actual
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test, best_predictions, alpha=0.6, edgecolors='k')
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 
             'r--', lw=2, label='Perfect Prediction')
    plt.xlabel('Actual Stress Level', fontsize=12)
    plt.ylabel('Predicted Stress Level', fontsize=12)
    plt.title(f'Stress Prediction: {best_name}\nR² = {best_r2:.4f}, RMSE = {best_rmse:.4f}', 
              fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{viz_dir}/stress_predictions.png", dpi=300, bbox_inches='tight')
    plt.close()
    print(f"   Saved: stress_predictions.png")
    
    # 2. Residuals Plot
    residuals = y_test - best_predictions
    plt.figure(figsize=(10, 6))
    plt.scatter(best_predictions, residuals, alpha=0.6, edgecolors='k')
    plt.axhline(y=0, color='r', linestyle='--', lw=2)
    plt.xlabel('Predicted Stress Level', fontsize=12)
    plt.ylabel('Residuals', fontsize=12)
    plt.title(f'Residual Plot: {best_name}', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{viz_dir}/stress_residuals.png", dpi=300, bbox_inches='tight')
    plt.close()
    print(f"   Saved: stress_residuals.png")
    
    # 3. Feature Importance
    if feature_importance is not None:
        plt.figure(figsize=(12, 8))
        top_features = importance_df.head(15)
        plt.barh(range(len(top_features)), top_features['Importance'])
        plt.yticks(range(len(top_features)), top_features['Feature'])
        plt.xlabel('Importance Score', fontsize=12)
        plt.ylabel('Feature', fontsize=12)
        plt.title('Top 15 Feature Importances for Stress Prediction', 
                  fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3, axis='x')
        plt.tight_layout()
        plt.savefig(f"{viz_dir}/stress_feature_importance.png", dpi=300, bbox_inches='tight')
        plt.close()
        print(f"   Saved: stress_feature_importance.png")
    
    # 4. Model Comparison
    plt.figure(figsize=(12, 6))
    model_names = list(results.keys())
    r2_scores = [results[name]['test_r2'] for name in model_names]
    colors = ['green' if name == top_model_name else 'steelblue' for name in model_names]
    
    plt.barh(range(len(model_names)), r2_scores, color=colors)
    plt.yticks(range(len(model_names)), model_names)
    plt.xlabel('R² Score', fontsize=12)
    plt.ylabel('Model', fontsize=12)
    plt.title('Model Comparison: R² Scores', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3, axis='x')
    plt.tight_layout()
    plt.savefig(f"{viz_dir}/stress_model_comparison.png", dpi=300, bbox_inches='tight')
    plt.close()
    print(f"   Saved: stress_model_comparison.png")
    
    # Step 9: Training Report
    print("\nStep 9: Generating Training Report")
    
    report_dir = "../../../ai/models/mental_health/reports"
    os.makedirs(report_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = f"{report_dir}/stress_training_report_{timestamp}.txt"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("STRESS LEVEL PREDICTION - TRAINING REPORT\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Dataset: {csv_path}\n")
        f.write(f"Training samples: {X_train.shape[0]}\n")
        f.write(f"Testing samples: {X_test.shape[0]}\n")
        f.write(f"Number of features: {X_train.shape[1]}\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("BASELINE MODEL RESULTS\n")
        f.write("=" * 80 + "\n\n")
        
        for name, metrics in sorted(results.items(), key=lambda x: x[1]['test_r2'], reverse=True):
            f.write(f"{name}:\n")
            f.write(f"  Train R²: {metrics['train_r2']:.4f}\n")
            f.write(f"  Test R²:  {metrics['test_r2']:.4f}\n")
            f.write(f"  RMSE:     {metrics['test_rmse']:.4f}\n")
            f.write(f"  MAE:      {metrics['test_mae']:.4f}\n")
            f.write(f"  CV R² (mean ± std): {metrics['cv_mean']:.4f} ± {metrics['cv_std']:.4f}\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("BEST MODEL\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Model: {best_name}\n")
        f.write(f"R² Score: {best_r2:.4f}\n")
        f.write(f"RMSE: {best_rmse:.4f}\n")
        f.write(f"MAE: {best_mae:.4f}\n\n")
        
        if feature_importance is not None:
            f.write("=" * 80 + "\n")
            f.write("TOP 15 FEATURE IMPORTANCES\n")
            f.write("=" * 80 + "\n\n")
            for idx, row in importance_df.head(15).iterrows():
                f.write(f"{row['Feature']:<40} {row['Importance']:.4f}\n")
    
    print(f"\nReport saved: {report_path}")
    
    # Summary
    print("\nTraining Completed Successfully!")
    print(f"\nFinal Model: {best_name}")
    print(f"   R² Score: {best_r2:.4f}")
    print(f"   RMSE: {best_rmse:.4f}")
    print(f"   MAE: {best_mae:.4f}")
    print(f"\nSaved Files:")
    print(f"   - Model: {model_path}")
    print(f"   - Preprocessors: ai/models/mental_health/stress_preprocessors.pkl")
    print(f"   - Report: {report_path}")
    print(f"   - Visualizations: {viz_dir}/")
    
    return best_model, best_name, results


if __name__ == "__main__":
    # Train the stress prediction model
    model, model_name, results = train_stress_models()
    print("\nStress prediction model training complete!")
