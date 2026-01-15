"""
Stress Level Prediction - Evaluation Script
Evaluate the trained stress prediction model on test data
"""

import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, mean_absolute_percentage_error
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os
import warnings
warnings.filterwarnings('ignore')

# Import preprocessing function
from preprocess_stress import preprocess_stress_data

def evaluate_stress_model(csv_path="../../../ai/data/ScreenTime_MentalWellness.csv", 
                          model_path="../../../ai/models/mental_health/stress_model.pkl"):
    """
    Evaluate the trained stress prediction model.
    
    Args:
        csv_path: Path to the dataset
        model_path: Path to the trained model
        
    Returns:
        evaluation_metrics: Dictionary of evaluation metrics
    """
    
    print("=" * 80)
    print("🧠 STRESS LEVEL PREDICTION - EVALUATION PIPELINE")
    print("=" * 80)
    
    # ============= STEP 1: LOAD MODEL =============
    print("\n📌 STEP 1: Loading Trained Model")
    print("-" * 80)
    
    if not os.path.exists(model_path):
        print(f"❌ Error: Model not found at {model_path}")
        print("   Please run training first: python ai/src/mental_health/train_stress.py")
        return None
    
    model = joblib.load(model_path)
    print(f"✅ Model loaded successfully from: {model_path}")
    print(f"   Model type: {type(model).__name__}")
    
    # ============= STEP 2: LOAD AND PREPROCESS DATA =============
    print("\n📌 STEP 2: Loading and Preprocessing Data")
    print("-" * 80)
    
    X_train, X_test, y_train, y_test, feature_names, preprocessors = preprocess_stress_data(
        csv_path, save_preprocessors=False
    )
    
    print(f"\n📊 Dataset Summary:")
    print(f"   Training samples: {X_train.shape[0]}")
    print(f"   Testing samples: {X_test.shape[0]}")
    print(f"   Number of features: {X_test.shape[1]}")
    
    # ============= STEP 3: GENERATE PREDICTIONS =============
    print("\n📌 STEP 3: Generating Predictions")
    print("-" * 80)
    
    print("\n🔄 Predicting on training set...")
    y_pred_train = model.predict(X_train)
    
    print("🔄 Predicting on test set...")
    y_pred_test = model.predict(X_test)
    
    print("✅ Predictions generated successfully")
    
    # ============= STEP 4: CALCULATE METRICS =============
    print("\n📌 STEP 4: Calculating Evaluation Metrics")
    print("-" * 80)
    
    # Training metrics
    train_r2 = r2_score(y_train, y_pred_train)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
    train_mae = mean_absolute_error(y_train, y_pred_train)
    train_mape = mean_absolute_percentage_error(y_train, y_pred_train) * 100
    
    # Test metrics
    test_r2 = r2_score(y_test, y_pred_test)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_mape = mean_absolute_percentage_error(y_test, y_pred_test) * 100
    
    # Additional metrics
    residuals = y_test.values - y_pred_test
    mean_residual = np.mean(residuals)
    std_residual = np.std(residuals)
    
    print("\n📊 TRAINING SET METRICS:")
    print(f"   R² Score:  {train_r2:.4f}")
    print(f"   RMSE:      {train_rmse:.4f}")
    print(f"   MAE:       {train_mae:.4f}")
    print(f"   MAPE:      {train_mape:.2f}%")
    
    print("\n📊 TEST SET METRICS:")
    print(f"   R² Score:  {test_r2:.4f}")
    print(f"   RMSE:      {test_rmse:.4f}")
    print(f"   MAE:       {test_mae:.4f}")
    print(f"   MAPE:      {test_mape:.2f}%")
    
    print("\n📊 RESIDUAL ANALYSIS:")
    print(f"   Mean Residual: {mean_residual:.4f}")
    print(f"   Std Residual:  {std_residual:.4f}")
    
    # Check for overfitting
    overfit_gap = train_r2 - test_r2
    if overfit_gap > 0.1:
        print(f"\n⚠️  WARNING: Possible overfitting detected (gap = {overfit_gap:.4f})")
    else:
        print(f"\n✅ Model generalization is good (gap = {overfit_gap:.4f})")
    
    # ============= STEP 5: STRESS LEVEL ANALYSIS =============
    print("\n📌 STEP 5: Stress Level Distribution Analysis")
    print("-" * 80)
    
    # Define stress categories
    def categorize_stress(level):
        if level <= 3:
            return "Low"
        elif level <= 6:
            return "Moderate"
        elif level <= 8:
            return "High"
        else:
            return "Very High"
    
    y_test_categories = pd.Series(y_test.values).apply(categorize_stress)
    y_pred_categories = pd.Series(y_pred_test).apply(categorize_stress)
    
    print("\n📊 Actual Stress Distribution:")
    print(y_test_categories.value_counts().sort_index())
    
    print("\n📊 Predicted Stress Distribution:")
    print(y_pred_categories.value_counts().sort_index())
    
    # Accuracy by category
    category_accuracy = (y_test_categories == y_pred_categories).mean()
    print(f"\n✅ Category Prediction Accuracy: {category_accuracy:.2%}")
    
    # ============= STEP 6: FEATURE IMPORTANCE =============
    print("\n📌 STEP 6: Feature Importance Analysis")
    print("-" * 80)
    
    # Get feature importance (if available)
    if hasattr(model, 'feature_importances_'):
        feature_importance = model.feature_importances_
    elif hasattr(model, 'estimators_'):
        # For voting ensemble, average the importances
        importances = []
        for est_name, estimator in model.estimators_:
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
        
        print(f"\n📊 Top 10 Most Important Features for Stress Prediction:")
        for idx, row in importance_df.head(10).iterrows():
            print(f"   {row['Feature']:<40} {row['Importance']:.4f}")
    else:
        importance_df = None
        print("\n⚠️  Feature importance not available for this model type")
    
    # ============= STEP 7: VISUALIZATIONS =============
    print("\n📌 STEP 7: Generating Evaluation Visualizations")
    print("-" * 80)
    
    viz_dir = "../../../ai/models/mental_health/visualizations"
    os.makedirs(viz_dir, exist_ok=True)
    
    # 1. Predictions vs Actual (Enhanced)
    plt.figure(figsize=(12, 6))
    
    # Scatter plot
    plt.subplot(1, 2, 1)
    plt.scatter(y_test, y_pred_test, alpha=0.6, edgecolors='k', s=50)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 
             'r--', lw=2, label='Perfect Prediction')
    plt.xlabel('Actual Stress Level', fontsize=12)
    plt.ylabel('Predicted Stress Level', fontsize=12)
    plt.title(f'Predictions vs Actual\nR² = {test_r2:.4f}', fontsize=12, fontweight='bold')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Error distribution
    plt.subplot(1, 2, 2)
    errors = y_test.values - y_pred_test
    plt.hist(errors, bins=30, edgecolor='black', alpha=0.7)
    plt.axvline(x=0, color='r', linestyle='--', lw=2, label='Zero Error')
    plt.xlabel('Prediction Error', fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.title(f'Error Distribution\nMean = {mean_residual:.4f}', fontsize=12, fontweight='bold')
    plt.legend()
    plt.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig(f"{viz_dir}/stress_evaluation_predictions.png", dpi=300, bbox_inches='tight')
    plt.close()
    print(f"   ✅ Saved: stress_evaluation_predictions.png")
    
    # 2. Residuals Analysis
    plt.figure(figsize=(12, 6))
    
    # Residuals vs Predicted
    plt.subplot(1, 2, 1)
    plt.scatter(y_pred_test, residuals, alpha=0.6, edgecolors='k', s=50)
    plt.axhline(y=0, color='r', linestyle='--', lw=2)
    plt.xlabel('Predicted Stress Level', fontsize=12)
    plt.ylabel('Residuals', fontsize=12)
    plt.title('Residual Plot', fontsize=12, fontweight='bold')
    plt.grid(True, alpha=0.3)
    
    # Q-Q plot
    plt.subplot(1, 2, 2)
    from scipy import stats
    stats.probplot(residuals, dist="norm", plot=plt)
    plt.title('Q-Q Plot', fontsize=12, fontweight='bold')
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(f"{viz_dir}/stress_evaluation_residuals.png", dpi=300, bbox_inches='tight')
    plt.close()
    print(f"   ✅ Saved: stress_evaluation_residuals.png")
    
    # 3. Stress Category Comparison
    plt.figure(figsize=(10, 6))
    
    category_counts = pd.DataFrame({
        'Actual': y_test_categories.value_counts().sort_index(),
        'Predicted': y_pred_categories.value_counts().sort_index()
    })
    
    category_counts.plot(kind='bar', width=0.8, edgecolor='black')
    plt.xlabel('Stress Category', fontsize=12)
    plt.ylabel('Count', fontsize=12)
    plt.title('Stress Category Distribution: Actual vs Predicted', fontsize=14, fontweight='bold')
    plt.legend(title='Type', fontsize=10)
    plt.xticks(rotation=0)
    plt.grid(True, alpha=0.3, axis='y')
    plt.tight_layout()
    plt.savefig(f"{viz_dir}/stress_evaluation_categories.png", dpi=300, bbox_inches='tight')
    plt.close()
    print(f"   ✅ Saved: stress_evaluation_categories.png")
    
    # 4. Feature Importance (if available)
    if importance_df is not None:
        plt.figure(figsize=(12, 8))
        top_features = importance_df.head(15)
        colors = plt.cm.viridis(np.linspace(0, 1, len(top_features)))
        
        plt.barh(range(len(top_features)), top_features['Importance'], color=colors, edgecolor='black')
        plt.yticks(range(len(top_features)), top_features['Feature'])
        plt.xlabel('Importance Score', fontsize=12)
        plt.ylabel('Feature', fontsize=12)
        plt.title('Top 15 Feature Importances for Stress Prediction', fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3, axis='x')
        plt.tight_layout()
        plt.savefig(f"{viz_dir}/stress_evaluation_feature_importance.png", dpi=300, bbox_inches='tight')
        plt.close()
        print(f"   ✅ Saved: stress_evaluation_feature_importance.png")
    
    # 5. Performance by Stress Level
    plt.figure(figsize=(10, 6))
    
    # Bin the actual stress levels
    stress_bins = pd.cut(y_test, bins=[0, 3, 6, 8, 11], labels=['Low', 'Moderate', 'High', 'Very High'])
    
    errors_by_level = []
    labels = []
    for level in ['Low', 'Moderate', 'High', 'Very High']:
        mask = stress_bins == level
        if mask.sum() > 0:
            level_errors = np.abs(y_test.values[mask] - y_pred_test[mask])
            errors_by_level.append(level_errors)
            labels.append(f"{level}\n(n={mask.sum()})")
    
    plt.boxplot(errors_by_level, labels=labels, patch_artist=True,
                boxprops=dict(facecolor='lightblue', edgecolor='black'),
                medianprops=dict(color='red', linewidth=2))
    plt.ylabel('Absolute Error', fontsize=12)
    plt.xlabel('Stress Category', fontsize=12)
    plt.title('Prediction Error by Stress Category', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3, axis='y')
    plt.tight_layout()
    plt.savefig(f"{viz_dir}/stress_evaluation_error_by_level.png", dpi=300, bbox_inches='tight')
    plt.close()
    print(f"   ✅ Saved: stress_evaluation_error_by_level.png")
    
    # ============= STEP 8: GENERATE REPORT =============
    print("\n📌 STEP 8: Generating Evaluation Report")
    print("-" * 80)
    
    report_dir = "../../../ai/models/mental_health/reports"
    os.makedirs(report_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = f"{report_dir}/stress_evaluation_report_{timestamp}.txt"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("STRESS LEVEL PREDICTION - EVALUATION REPORT\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Dataset: {csv_path}\n")
        f.write(f"Model: {model_path}\n")
        f.write(f"Model Type: {type(model).__name__}\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("DATASET SUMMARY\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Training samples: {X_train.shape[0]}\n")
        f.write(f"Testing samples: {X_test.shape[0]}\n")
        f.write(f"Number of features: {X_test.shape[1]}\n")
        f.write(f"Stress level range: [{y_test.min():.2f}, {y_test.max():.2f}]\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("PERFORMANCE METRICS\n")
        f.write("=" * 80 + "\n\n")
        
        f.write("Training Set:\n")
        f.write(f"  R² Score:  {train_r2:.4f}\n")
        f.write(f"  RMSE:      {train_rmse:.4f}\n")
        f.write(f"  MAE:       {train_mae:.4f}\n")
        f.write(f"  MAPE:      {train_mape:.2f}%\n\n")
        
        f.write("Test Set:\n")
        f.write(f"  R² Score:  {test_r2:.4f}\n")
        f.write(f"  RMSE:      {test_rmse:.4f}\n")
        f.write(f"  MAE:       {test_mae:.4f}\n")
        f.write(f"  MAPE:      {test_mape:.2f}%\n\n")
        
        f.write("Generalization:\n")
        f.write(f"  Train-Test Gap: {overfit_gap:.4f}\n")
        if overfit_gap > 0.1:
            f.write("  Status: ⚠️  Possible overfitting\n\n")
        else:
            f.write("  Status: ✅ Good generalization\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("RESIDUAL ANALYSIS\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Mean Residual: {mean_residual:.4f}\n")
        f.write(f"Std Residual:  {std_residual:.4f}\n")
        f.write(f"Min Residual:  {residuals.min():.4f}\n")
        f.write(f"Max Residual:  {residuals.max():.4f}\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("STRESS CATEGORY ANALYSIS\n")
        f.write("=" * 80 + "\n\n")
        
        f.write("Actual Distribution:\n")
        for cat, count in y_test_categories.value_counts().sort_index().items():
            f.write(f"  {cat:<12} {count:>3} ({count/len(y_test)*100:.1f}%)\n")
        
        f.write("\nPredicted Distribution:\n")
        for cat, count in y_pred_categories.value_counts().sort_index().items():
            f.write(f"  {cat:<12} {count:>3} ({count/len(y_pred_test)*100:.1f}%)\n")
        
        f.write(f"\nCategory Accuracy: {category_accuracy:.2%}\n\n")
        
        if importance_df is not None:
            f.write("=" * 80 + "\n")
            f.write("TOP 15 FEATURE IMPORTANCES\n")
            f.write("=" * 80 + "\n\n")
            for idx, row in importance_df.head(15).iterrows():
                f.write(f"{row['Feature']:<45} {row['Importance']:.6f}\n")
            f.write("\n")
        
        f.write("=" * 80 + "\n")
        f.write("INTERPRETATION GUIDE\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"• R² Score ({test_r2:.4f}): Explains {test_r2*100:.1f}% of stress variance\n")
        f.write(f"• RMSE ({test_rmse:.4f}): Average prediction error of ±{test_rmse:.2f} stress points\n")
        f.write(f"• MAE ({test_mae:.4f}): Typical error is {test_mae:.2f} stress points\n")
        f.write(f"• MAPE ({test_mape:.2f}%): Average percentage error\n\n")
        
        f.write("Stress Categories:\n")
        f.write("  Low (0-3):       Minimal stress, good mental health\n")
        f.write("  Moderate (3-6):  Normal stress levels\n")
        f.write("  High (6-8):      Elevated stress, needs attention\n")
        f.write("  Very High (8-10): Critical stress, intervention recommended\n\n")
    
    print(f"\n✅ Report saved: {report_path}")
    
    # ============= SUMMARY =============
    print("\n" + "=" * 80)
    print("🎉 EVALUATION COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print(f"\n📊 Model Performance Summary:")
    print(f"   R² Score:  {test_r2:.4f} ({test_r2*100:.1f}% variance explained)")
    print(f"   RMSE:      {test_rmse:.4f} stress points")
    print(f"   MAE:       {test_mae:.4f} stress points")
    print(f"   MAPE:      {test_mape:.2f}%")
    print(f"   Category Accuracy: {category_accuracy:.2%}")
    print(f"\n💾 Generated Files:")
    print(f"   - Report: {report_path}")
    print(f"   - Visualizations: {viz_dir}/stress_evaluation_*.png")
    print("\n" + "=" * 80)
    
    # Store metrics for return
    evaluation_metrics = {
        'test_r2': test_r2,
        'test_rmse': test_rmse,
        'test_mae': test_mae,
        'test_mape': test_mape,
        'train_r2': train_r2,
        'category_accuracy': category_accuracy,
        'mean_residual': mean_residual,
        'std_residual': std_residual
    }
    
    return evaluation_metrics


if __name__ == "__main__":
    # Evaluate the stress prediction model
    metrics = evaluate_stress_model()
    
    if metrics:
        print("\n✅ Stress prediction model evaluation complete!")
    else:
        print("\n❌ Evaluation failed. Please check the error messages above.")
