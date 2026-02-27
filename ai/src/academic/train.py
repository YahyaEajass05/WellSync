"""
Advanced Machine Learning Training Pipeline for Academic Impact Analyzer
Predicts social media addiction score and academic performance impact
"""

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings
from datetime import datetime
warnings.filterwarnings('ignore')

# Scikit-learn imports
from sklearn.ensemble import (
    RandomForestRegressor, 
    GradientBoostingRegressor, 
    ExtraTreesRegressor,
    AdaBoostRegressor,
    VotingRegressor,
    StackingRegressor
)
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import (
    cross_val_score, 
    GridSearchCV, 
    RandomizedSearchCV,
    KFold
)
from sklearn.metrics import (
    mean_absolute_error, 
    mean_squared_error, 
    r2_score,
    mean_absolute_percentage_error
)

# Import preprocessing
from ai.src.academic.preprocess import preprocess_data

def evaluate_model(model, X_train, X_test, y_train, y_test, model_name="Model"):
    """Comprehensive model evaluation with multiple metrics"""
    
    # Predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Calculate metrics
    train_mae = mean_absolute_error(y_train, y_train_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    
    train_mse = mean_squared_error(y_train, y_train_pred)
    test_mse = mean_squared_error(y_test, y_test_pred)
    
    train_rmse = np.sqrt(train_mse)
    test_rmse = np.sqrt(test_mse)
    
    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    
    # MAPE
    train_mape = mean_absolute_percentage_error(y_train, y_train_pred)
    test_mape = mean_absolute_percentage_error(y_test, y_test_pred)
    
    results = {
        'model_name': model_name,
        'train_mae': train_mae,
        'test_mae': test_mae,
        'train_rmse': train_rmse,
        'test_rmse': test_rmse,
        'train_r2': train_r2,
        'test_r2': test_r2,
        'train_mape': train_mape,
        'test_mape': test_mape
    }
    
    return results, y_test_pred

def train_multiple_models(X_train, X_test, y_train, y_test):
    """Train and compare multiple ML models"""
    
    print("Training multiple machine learning models")
    
    models = {
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
        'Extra Trees': ExtraTreesRegressor(n_estimators=100, random_state=42, n_jobs=-1),
        'Ridge Regression': Ridge(alpha=1.0, random_state=42),
        'Lasso Regression': Lasso(alpha=1.0, random_state=42),
        'ElasticNet': ElasticNet(alpha=1.0, random_state=42),
        'AdaBoost': AdaBoostRegressor(n_estimators=100, random_state=42),
        'K-Nearest Neighbors': KNeighborsRegressor(n_neighbors=5, n_jobs=-1)
    }
    
    results_list = []
    predictions_dict = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        results, y_pred = evaluate_model(model, X_train, X_test, y_train, y_test, name)
        results_list.append(results)
        predictions_dict[name] = y_pred
        
        print(f"Test R²: {results['test_r2']:.4f} | Test MAE: {results['test_mae']:.4f} | Test RMSE: {results['test_rmse']:.4f}")
    
    # Create results dataframe
    results_df = pd.DataFrame(results_list)
    results_df = results_df.sort_values('test_r2', ascending=False)
    
    print("\nModel comparison results:")
    print(results_df.to_string(index=False))
    
    return results_df, models, predictions_dict

def hyperparameter_tuning(X_train, y_train, X_test, y_test):
    """Advanced hyperparameter tuning for top models"""
    
    print("\nHyperparameter tuning - optimizing top models")
    
    # Random Forest tuning
    print("Tuning Random Forest...")
    rf_param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, 30, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'max_features': ['sqrt', 'log2']
    }
    
    rf_random = RandomizedSearchCV(
        RandomForestRegressor(random_state=42, n_jobs=-1),
        param_distributions=rf_param_grid,
        n_iter=20,
        cv=5,
        scoring='r2',
        random_state=42,
        n_jobs=-1,
        verbose=0
    )
    rf_random.fit(X_train, y_train)
    best_rf = rf_random.best_estimator_
    print(f"Best RF params: {rf_random.best_params_}")
    print(f"Best CV R² score: {rf_random.best_score_:.4f}")
    
    # Gradient Boosting tuning
    print("Tuning Gradient Boosting...")
    gb_param_grid = {
        'n_estimators': [100, 200, 300],
        'learning_rate': [0.01, 0.05, 0.1],
        'max_depth': [3, 5, 7],
        'min_samples_split': [2, 5, 10],
        'subsample': [0.8, 0.9, 1.0]
    }
    
    gb_random = RandomizedSearchCV(
        GradientBoostingRegressor(random_state=42),
        param_distributions=gb_param_grid,
        n_iter=20,
        cv=5,
        scoring='r2',
        random_state=42,
        n_jobs=-1,
        verbose=0
    )
    gb_random.fit(X_train, y_train)
    best_gb = gb_random.best_estimator_
    print(f"Best GB params: {gb_random.best_params_}")
    print(f"Best CV R² score: {gb_random.best_score_:.4f}")
    
    # Extra Trees tuning
    print("Tuning Extra Trees...")
    et_param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, 30, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }
    
    et_random = RandomizedSearchCV(
        ExtraTreesRegressor(random_state=42, n_jobs=-1),
        param_distributions=et_param_grid,
        n_iter=15,
        cv=5,
        scoring='r2',
        random_state=42,
        n_jobs=-1,
        verbose=0
    )
    et_random.fit(X_train, y_train)
    best_et = et_random.best_estimator_
    print(f"Best ET params: {et_random.best_params_}")
    print(f"Best CV R² score: {et_random.best_score_:.4f}")
    
    return best_rf, best_gb, best_et

def create_ensemble_model(best_rf, best_gb, best_et, X_train, y_train):
    """Create advanced ensemble models"""
    
    print("\nCreating advanced ensemble models")
    
    # Voting Regressor
    print("Creating Voting Ensemble...")
    voting_regressor = VotingRegressor(
        estimators=[
            ('rf', best_rf),
            ('gb', best_gb),
            ('et', best_et)
        ],
        n_jobs=-1
    )
    voting_regressor.fit(X_train, y_train)
    print("Voting Ensemble trained")
    
    # Stacking Regressor
    print("Creating Stacking Ensemble...")
    stacking_regressor = StackingRegressor(
        estimators=[
            ('rf', best_rf),
            ('gb', best_gb),
            ('et', best_et)
        ],
        final_estimator=Ridge(alpha=1.0),
        cv=5,
        n_jobs=-1
    )
    stacking_regressor.fit(X_train, y_train)
    print("Stacking Ensemble trained")
    
    return voting_regressor, stacking_regressor

def perform_cross_validation(model, X, y, model_name="Model", cv_folds=10):
    """Perform k-fold cross-validation"""
    
    print(f"Performing {cv_folds}-Fold Cross-Validation for {model_name}...")
    
    kfold = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    
    r2_scores = cross_val_score(model, X, y, cv=kfold, scoring='r2', n_jobs=-1)
    mae_scores = -cross_val_score(model, X, y, cv=kfold, scoring='neg_mean_absolute_error', n_jobs=-1)
    rmse_scores = np.sqrt(-cross_val_score(model, X, y, cv=kfold, scoring='neg_mean_squared_error', n_jobs=-1))
    
    print(f"R² Score: {r2_scores.mean():.4f} (+/- {r2_scores.std():.4f})")
    print(f"MAE: {mae_scores.mean():.4f} (+/- {mae_scores.std():.4f})")
    print(f"RMSE: {rmse_scores.mean():.4f} (+/- {rmse_scores.std():.4f})")
    
    return {
        'r2_mean': r2_scores.mean(),
        'r2_std': r2_scores.std(),
        'mae_mean': mae_scores.mean(),
        'mae_std': mae_scores.std(),
        'rmse_mean': rmse_scores.mean(),
        'rmse_std': rmse_scores.std()
    }

def plot_feature_importance(model, feature_names, top_n=20):
    """Plot feature importance"""
    
    if hasattr(model, 'feature_importances_'):
        print(f"Plotting Feature Importance (Top {top_n})...")
        
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1][:top_n]
        
        plt.figure(figsize=(12, 8))
        plt.title(f'Top {top_n} Feature Importances - Academic Impact', fontsize=16, fontweight='bold')
        plt.bar(range(top_n), importances[indices], color='steelblue', alpha=0.8)
        plt.xticks(range(top_n), [feature_names[i] for i in indices], rotation=45, ha='right')
        plt.xlabel('Features', fontsize=12)
        plt.ylabel('Importance Score', fontsize=12)
        plt.tight_layout()
        
        os.makedirs("ai/models/academic/visualizations", exist_ok=True)
        plt.savefig("ai/models/academic/visualizations/feature_importance.png", dpi=300, bbox_inches='tight')
        print("Feature importance plot saved")
        plt.close()
        
        print("\nTop 10 Most Important Features:")
        for i, idx in enumerate(indices[:10], 1):
            print(f"{i}. {feature_names[idx]}: {importances[idx]:.4f}")

def plot_predictions(y_test, y_pred, model_name="Model"):
    """Plot actual vs predicted values"""
    
    print(f"Plotting Predictions for {model_name}...")
    
    plt.figure(figsize=(10, 8))
    plt.scatter(y_test, y_pred, alpha=0.6, color='steelblue', edgecolors='k', s=50)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2, label='Perfect Prediction')
    plt.xlabel('Actual Addiction Score', fontsize=12)
    plt.ylabel('Predicted Addiction Score', fontsize=12)
    plt.title(f'{model_name}: Actual vs Predicted', fontsize=16, fontweight='bold')
    plt.legend(fontsize=10)
    plt.grid(alpha=0.3)
    plt.tight_layout()
    
    os.makedirs("ai/models/academic/visualizations", exist_ok=True)
    filename = f"ai/models/academic/visualizations/{model_name.lower().replace(' ', '_')}_predictions.png"
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"Prediction plot saved: {filename}")
    plt.close()

def plot_residuals(y_test, y_pred, model_name="Model"):
    """Plot residuals distribution"""
    
    print(f"Plotting Residuals for {model_name}...")
    
    residuals = y_test - y_pred
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Residual plot
    axes[0].scatter(y_pred, residuals, alpha=0.6, color='steelblue', edgecolors='k', s=50)
    axes[0].axhline(y=0, color='r', linestyle='--', lw=2)
    axes[0].set_xlabel('Predicted Values', fontsize=12)
    axes[0].set_ylabel('Residuals', fontsize=12)
    axes[0].set_title('Residual Plot', fontsize=14, fontweight='bold')
    axes[0].grid(alpha=0.3)
    
    # Residual distribution
    axes[1].hist(residuals, bins=30, color='steelblue', alpha=0.7, edgecolor='black')
    axes[1].set_xlabel('Residuals', fontsize=12)
    axes[1].set_ylabel('Frequency', fontsize=12)
    axes[1].set_title('Residual Distribution', fontsize=14, fontweight='bold')
    axes[1].grid(alpha=0.3, axis='y')
    
    plt.suptitle(f'{model_name}: Residual Analysis', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    
    filename = f"ai/models/academic/visualizations/{model_name.lower().replace(' ', '_')}_residuals.png"
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"Residual plot saved: {filename}")
    plt.close()

def save_model_report(results_df, best_model_results, cv_results, feature_names):
    """Save comprehensive training report"""
    
    print("Generating Model Training Report...")
    
    os.makedirs("ai/models/academic/reports", exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = f"ai/models/academic/reports/training_report_{timestamp}.txt"
    
    with open(report_path, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("ACADEMIC IMPACT ANALYZER - TRAINING REPORT\n")
        f.write("=" * 80 + "\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("ALL MODELS COMPARISON\n")
        f.write("=" * 80 + "\n")
        f.write(results_df.to_string(index=False) + "\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("BEST MODEL PERFORMANCE\n")
        f.write("=" * 80 + "\n")
        for key, value in best_model_results.items():
            f.write(f"{key}: {value}\n")
        f.write("\n")
        
        f.write("=" * 80 + "\n")
        f.write("CROSS-VALIDATION RESULTS\n")
        f.write("=" * 80 + "\n")
        for key, value in cv_results.items():
            f.write(f"{key}: {value:.4f}\n")
        f.write("\n")
        
        f.write("=" * 80 + "\n")
        f.write(f"TOTAL FEATURES: {len(feature_names)}\n")
        f.write("=" * 80 + "\n")
        f.write(", ".join(feature_names) + "\n")
    
    print(f"Report saved: {report_path}")

def train_model():
    """Main training pipeline for Academic Impact Analyzer"""
    
    print("\nAcademic Impact Analyzer - Advanced ML Training Pipeline")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Set data path
    csv_path = "ai/data/Students_Social_Media_Addiction.csv"
    
    # Step 1: Preprocessing
    print("\nStep 1: Data Preprocessing & Feature Engineering")
    
    X_train, X_test, y_train, y_test, feature_names, preprocessors = preprocess_data(csv_path)
    
    # Step 2: Baseline models
    print("\nStep 2: Baseline Model Training & Comparison")
    
    results_df, models_dict, predictions_dict = train_multiple_models(X_train, X_test, y_train, y_test)
    
    # Step 3: Hyperparameter tuning
    print("\nStep 3: Hyperparameter Tuning")
    
    best_rf, best_gb, best_et = hyperparameter_tuning(X_train, y_train, X_test, y_test)
    
    # Step 4: Ensemble models
    print("\nStep 4: Ensemble Model Creation")
    
    voting_model, stacking_model = create_ensemble_model(best_rf, best_gb, best_et, X_train, y_train)
    
    # Evaluate ensemble models
    print("Evaluating Ensemble Models...")
    voting_results, voting_pred = evaluate_model(voting_model, X_train, X_test, y_train, y_test, "Voting Ensemble")
    stacking_results, stacking_pred = evaluate_model(stacking_model, X_train, X_test, y_train, y_test, "Stacking Ensemble")
    
    print(f"Voting Ensemble - Test R²: {voting_results['test_r2']:.4f} | Test MAE: {voting_results['test_mae']:.4f}")
    print(f"Stacking Ensemble - Test R²: {stacking_results['test_r2']:.4f} | Test MAE: {stacking_results['test_mae']:.4f}")
    
    # Step 5: Final model selection
    print("\nStep 5: Final Model Selection")
    
    all_results = [
        ('Tuned Random Forest', best_rf),
        ('Tuned Gradient Boosting', best_gb),
        ('Tuned Extra Trees', best_et),
        ('Voting Ensemble', voting_model),
        ('Stacking Ensemble', stacking_model)
    ]
    
    best_score = -np.inf
    best_model = None
    best_name = None
    
    for name, model in all_results:
        result, _ = evaluate_model(model, X_train, X_test, y_train, y_test, name)
        if result['test_r2'] > best_score:
            best_score = result['test_r2']
            best_model = model
            best_name = name
            best_model_results = result
    
    print(f"\nBest Model: {best_name}")
    print(f"Test R²: {best_model_results['test_r2']:.4f}")
    print(f"Test MAE: {best_model_results['test_mae']:.4f}")
    print(f"Test RMSE: {best_model_results['test_rmse']:.4f}")
    
    # Step 6: Cross-validation
    print("\nStep 6: Cross-Validation")
    
    X_full = pd.concat([X_train, X_test])
    y_full = pd.concat([y_train, y_test])
    
    cv_results = perform_cross_validation(best_model, X_full, y_full, best_name, cv_folds=10)
    
    # Step 7: Visualizations
    print("\nStep 7: Generating Visualizations")
    
    plot_feature_importance(best_model, feature_names, top_n=20)
    plot_predictions(y_test, best_model.predict(X_test), best_name)
    plot_residuals(y_test, best_model.predict(X_test), best_name)
    
    # Step 8: Save models
    print("\nStep 8: Saving Models & Artifacts")
    
    os.makedirs("ai/models/academic", exist_ok=True)
    
    joblib.dump(best_model, "ai/models/academic/best_model.pkl")
    print("Best model saved: best_model.pkl")
    
    joblib.dump(best_rf, "ai/models/academic/tuned_random_forest.pkl")
    joblib.dump(best_gb, "ai/models/academic/tuned_gradient_boosting.pkl")
    joblib.dump(best_et, "ai/models/academic/tuned_extra_trees.pkl")
    joblib.dump(voting_model, "ai/models/academic/voting_ensemble.pkl")
    joblib.dump(stacking_model, "ai/models/academic/stacking_ensemble.pkl")
    print("All tuned models saved")
    
    joblib.dump(feature_names, "ai/models/academic/feature_names.pkl")
    print("Feature names saved")
    
    metadata = {
        'best_model_name': best_name,
        'best_model_results': best_model_results,
        'cv_results': cv_results,
        'feature_count': len(feature_names),
        'training_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'dataset_size': len(X_full)
    }
    joblib.dump(metadata, "ai/models/academic/model_metadata.pkl")
    print("Model metadata saved")
    
    # Step 9: Generate report
    save_model_report(results_df, best_model_results, cv_results, feature_names)
    
    # Final summary
    print("\nTraining Pipeline Completed Successfully!")
    print(f"\nSummary:")
    print(f"Best Model: {best_name}")
    print(f"Test R² Score: {best_model_results['test_r2']:.4f}")
    print(f"Test MAE: {best_model_results['test_mae']:.4f}")
    print(f"Cross-Validation R²: {cv_results['r2_mean']:.4f} (+/- {cv_results['r2_std']:.4f})")
    print(f"Total Features: {len(feature_names)}")
    print(f"\nSaved Artifacts:")
    print(f"Models: ai/models/academic/")
    print(f"Visualizations: ai/models/academic/visualizations/")
    print(f"Reports: ai/models/academic/reports/")
    print(f"\nCompleted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

if __name__ == "__main__":
    train_model()
