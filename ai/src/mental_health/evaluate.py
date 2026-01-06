"""
Advanced Model Evaluation Module for Mental Wellness Prediction
Provides comprehensive evaluation, visualization, and analysis tools
"""

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    mean_absolute_percentage_error
)
from ai.src.mental_health.preprocess import preprocess_data

def evaluate_saved_model(model_path="ai/models/mental_health/best_model.pkl"):
    """
    Evaluate a saved model with comprehensive metrics and visualizations
    """
    
    print("\n" + "=" * 80)
    print("🔍 MODEL EVALUATION & ANALYSIS")
    print("=" * 80)
    
    # Load dataset
    csv_path = "ai/data/ScreenTime_MentalWellness.csv"
    print(f"\n📂 Loading dataset from: {csv_path}")
    
    X_train, X_test, y_train, y_test, feature_names, _ = preprocess_data(csv_path, save_preprocessors=False)
    
    # Load model
    print(f"📂 Loading model from: {model_path}")
    model = joblib.load(model_path)
    
    # Load metadata if available
    metadata_path = "ai/models/mental_health/model_metadata.pkl"
    if os.path.exists(metadata_path):
        metadata = joblib.load(metadata_path)
        print(f"\n📋 Model Information:")
        print(f"   • Model Type: {metadata.get('best_model_name', 'N/A')}")
        print(f"   • Training Date: {metadata.get('training_date', 'N/A')}")
        print(f"   • Number of Features: {metadata.get('feature_count', 'N/A')}")
        print(f"   • Dataset Size: {metadata.get('dataset_size', 'N/A')}")
    
    # Make predictions
    print("\n🔄 Making predictions...")
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Calculate comprehensive metrics
    print("\n" + "=" * 80)
    print("📊 PERFORMANCE METRICS")
    print("=" * 80)
    
    # Training metrics
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_mse = mean_squared_error(y_train, y_train_pred)
    train_rmse = np.sqrt(train_mse)
    train_r2 = r2_score(y_train, y_train_pred)
    train_mape = mean_absolute_percentage_error(y_train, y_train_pred)
    
    # Test metrics
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_mse = mean_squared_error(y_test, y_test_pred)
    test_rmse = np.sqrt(test_mse)
    test_r2 = r2_score(y_test, y_test_pred)
    test_mape = mean_absolute_percentage_error(y_test, y_test_pred)
    
    print("\n🎯 Training Set Performance:")
    print(f"   • R² Score: {train_r2:.4f}")
    print(f"   • MAE: {train_mae:.4f}")
    print(f"   • RMSE: {train_rmse:.4f}")
    print(f"   • MAPE: {train_mape:.4f}%")
    
    print("\n🎯 Test Set Performance:")
    print(f"   • R² Score: {test_r2:.4f}")
    print(f"   • MAE: {test_mae:.4f}")
    print(f"   • RMSE: {test_rmse:.4f}")
    print(f"   • MAPE: {test_mape:.4f}%")
    
    # Overfitting analysis
    r2_diff = train_r2 - test_r2
    mae_diff = test_mae - train_mae
    
    print("\n🔍 Overfitting Analysis:")
    print(f"   • R² Difference (Train - Test): {r2_diff:.4f}")
    print(f"   • MAE Difference (Test - Train): {mae_diff:.4f}")
    
    if r2_diff < 0.05 and mae_diff < 2:
        print("   ✅ Model generalizes well - No significant overfitting")
    elif r2_diff < 0.10:
        print("   ⚠️  Slight overfitting detected - Model is acceptable")
    else:
        print("   ❌ Significant overfitting detected - Consider regularization")
    
    # Prediction quality analysis
    print("\n📈 Prediction Quality Analysis:")
    residuals = y_test - y_test_pred
    
    print(f"   • Mean Residual: {np.mean(residuals):.4f}")
    print(f"   • Std Residual: {np.std(residuals):.4f}")
    print(f"   • Min Residual: {np.min(residuals):.4f}")
    print(f"   • Max Residual: {np.max(residuals):.4f}")
    
    # Prediction range analysis
    print("\n📊 Prediction Range Analysis:")
    print(f"   • Actual Range: [{y_test.min():.2f}, {y_test.max():.2f}]")
    print(f"   • Predicted Range: [{y_test_pred.min():.2f}, {y_test_pred.max():.2f}]")
    
    # Create visualizations
    print("\n" + "=" * 80)
    print("📊 GENERATING VISUALIZATIONS")
    print("=" * 80)
    
    create_evaluation_visualizations(y_test, y_test_pred, model, feature_names)
    
    # Feature importance (if available)
    if hasattr(model, 'feature_importances_'):
        print("\n🏆 Top 15 Most Important Features:")
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1][:15]
        
        for i, idx in enumerate(indices, 1):
            print(f"   {i:2d}. {feature_names[idx]:30s} : {importances[idx]:.4f}")
    
    # Save evaluation report
    save_evaluation_report(train_r2, test_r2, train_mae, test_mae, train_rmse, test_rmse, 
                          train_mape, test_mape, residuals, model_path)
    
    print("\n" + "=" * 80)
    print("✅ EVALUATION COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print(f"\n📁 Evaluation artifacts saved in: ai/models/mental_health/visualizations/")
    print("=" * 80 + "\n")
    
    return {
        'train_r2': train_r2,
        'test_r2': test_r2,
        'train_mae': train_mae,
        'test_mae': test_mae,
        'train_rmse': train_rmse,
        'test_rmse': test_rmse
    }

def create_evaluation_visualizations(y_test, y_pred, model, feature_names):
    """Create comprehensive evaluation visualizations"""
    
    os.makedirs("ai/models/mental_health/visualizations", exist_ok=True)
    
    # 1. Actual vs Predicted scatter plot
    print("\n📊 Creating Actual vs Predicted plot...")
    plt.figure(figsize=(10, 8))
    plt.scatter(y_test, y_pred, alpha=0.6, color='steelblue', edgecolors='k', s=60)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 
             'r--', lw=2, label='Perfect Prediction')
    
    # Add metrics to plot
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    plt.text(0.05, 0.95, f'R² = {r2:.4f}\nMAE = {mae:.4f}', 
             transform=plt.gca().transAxes, fontsize=12, verticalalignment='top',
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.xlabel('Actual Mental Wellness Index', fontsize=13, fontweight='bold')
    plt.ylabel('Predicted Mental Wellness Index', fontsize=13, fontweight='bold')
    plt.title('Model Performance: Actual vs Predicted Values', fontsize=15, fontweight='bold')
    plt.legend(fontsize=11)
    plt.grid(alpha=0.3, linestyle='--')
    plt.tight_layout()
    plt.savefig("ai/models/mental_health/visualizations/evaluation_predictions.png", dpi=300, bbox_inches='tight')
    print("   ✅ Saved: evaluation_predictions.png")
    plt.close()
    
    # 2. Residual analysis (2 subplots)
    print("\n📊 Creating Residual analysis plots...")
    residuals = y_test - y_pred
    
    fig, axes = plt.subplots(1, 2, figsize=(15, 6))
    
    # Residual plot
    axes[0].scatter(y_pred, residuals, alpha=0.6, color='steelblue', edgecolors='k', s=60)
    axes[0].axhline(y=0, color='red', linestyle='--', lw=2, label='Zero Error')
    axes[0].set_xlabel('Predicted Values', fontsize=12, fontweight='bold')
    axes[0].set_ylabel('Residuals (Actual - Predicted)', fontsize=12, fontweight='bold')
    axes[0].set_title('Residual Plot', fontsize=14, fontweight='bold')
    axes[0].legend(fontsize=10)
    axes[0].grid(alpha=0.3, linestyle='--')
    
    # Residual distribution
    axes[1].hist(residuals, bins=30, color='steelblue', alpha=0.7, edgecolor='black')
    axes[1].axvline(x=0, color='red', linestyle='--', lw=2, label='Zero Error')
    axes[1].set_xlabel('Residuals', fontsize=12, fontweight='bold')
    axes[1].set_ylabel('Frequency', fontsize=12, fontweight='bold')
    axes[1].set_title('Residual Distribution', fontsize=14, fontweight='bold')
    axes[1].legend(fontsize=10)
    axes[1].grid(alpha=0.3, axis='y', linestyle='--')
    
    plt.suptitle('Residual Analysis', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig("ai/models/mental_health/visualizations/evaluation_residuals.png", dpi=300, bbox_inches='tight')
    print("   ✅ Saved: evaluation_residuals.png")
    plt.close()
    
    # 3. Error distribution by prediction range
    print("\n📊 Creating Error distribution plot...")
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Bin predictions and calculate errors
    bins = [0, 20, 40, 60, 80, 100]
    bin_labels = ['0-20', '20-40', '40-60', '60-80', '80-100']
    
    y_test_array = np.array(y_test)
    abs_errors = np.abs(residuals)
    
    errors_by_bin = []
    for i in range(len(bins)-1):
        mask = (y_test_array >= bins[i]) & (y_test_array < bins[i+1])
        if mask.sum() > 0:
            errors_by_bin.append(abs_errors[mask])
        else:
            errors_by_bin.append([])
    
    bp = ax.boxplot(errors_by_bin, labels=bin_labels, patch_artist=True,
                    showmeans=True, meanline=True)
    
    for patch in bp['boxes']:
        patch.set_facecolor('steelblue')
        patch.set_alpha(0.7)
    
    ax.set_xlabel('Mental Wellness Index Range', fontsize=12, fontweight='bold')
    ax.set_ylabel('Absolute Error', fontsize=12, fontweight='bold')
    ax.set_title('Prediction Error Distribution by Wellness Range', fontsize=14, fontweight='bold')
    ax.grid(alpha=0.3, axis='y', linestyle='--')
    plt.tight_layout()
    plt.savefig("ai/models/mental_health/visualizations/evaluation_error_distribution.png", dpi=300, bbox_inches='tight')
    print("   ✅ Saved: evaluation_error_distribution.png")
    plt.close()
    
    # 4. Feature importance (if available)
    if hasattr(model, 'feature_importances_'):
        print("\n📊 Creating Feature importance plot...")
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1][:20]
        
        plt.figure(figsize=(12, 8))
        colors = plt.cm.viridis(np.linspace(0, 1, 20))
        bars = plt.barh(range(20), importances[indices], color=colors, alpha=0.8, edgecolor='black')
        plt.yticks(range(20), [feature_names[i] for i in indices])
        plt.xlabel('Importance Score', fontsize=12, fontweight='bold')
        plt.ylabel('Features', fontsize=12, fontweight='bold')
        plt.title('Top 20 Feature Importances', fontsize=15, fontweight='bold')
        plt.gca().invert_yaxis()
        plt.grid(alpha=0.3, axis='x', linestyle='--')
        plt.tight_layout()
        plt.savefig("ai/models/mental_health/visualizations/evaluation_feature_importance.png", dpi=300, bbox_inches='tight')
        print("   ✅ Saved: evaluation_feature_importance.png")
        plt.close()

def save_evaluation_report(train_r2, test_r2, train_mae, test_mae, train_rmse, test_rmse,
                           train_mape, test_mape, residuals, model_path):
    """Save detailed evaluation report"""
    
    from datetime import datetime
    
    os.makedirs("ai/models/mental_health/reports", exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = f"ai/models/mental_health/reports/evaluation_report_{timestamp}.txt"
    
    with open(report_path, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("MENTAL WELLNESS PREDICTION MODEL - EVALUATION REPORT\n")
        f.write("=" * 80 + "\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Model: {model_path}\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("PERFORMANCE METRICS\n")
        f.write("=" * 80 + "\n\n")
        
        f.write("Training Set:\n")
        f.write(f"  R² Score: {train_r2:.6f}\n")
        f.write(f"  MAE: {train_mae:.6f}\n")
        f.write(f"  RMSE: {train_rmse:.6f}\n")
        f.write(f"  MAPE: {train_mape:.6f}%\n\n")
        
        f.write("Test Set:\n")
        f.write(f"  R² Score: {test_r2:.6f}\n")
        f.write(f"  MAE: {test_mae:.6f}\n")
        f.write(f"  RMSE: {test_rmse:.6f}\n")
        f.write(f"  MAPE: {test_mape:.6f}%\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("RESIDUAL STATISTICS\n")
        f.write("=" * 80 + "\n")
        f.write(f"  Mean: {np.mean(residuals):.6f}\n")
        f.write(f"  Std Dev: {np.std(residuals):.6f}\n")
        f.write(f"  Min: {np.min(residuals):.6f}\n")
        f.write(f"  Max: {np.max(residuals):.6f}\n")
        f.write(f"  Median: {np.median(residuals):.6f}\n")
        f.write(f"  25th Percentile: {np.percentile(residuals, 25):.6f}\n")
        f.write(f"  75th Percentile: {np.percentile(residuals, 75):.6f}\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("MODEL QUALITY ASSESSMENT\n")
        f.write("=" * 80 + "\n")
        
        if test_r2 > 0.90:
            f.write("  Overall Grade: EXCELLENT (A+)\n")
        elif test_r2 > 0.85:
            f.write("  Overall Grade: VERY GOOD (A)\n")
        elif test_r2 > 0.80:
            f.write("  Overall Grade: GOOD (B+)\n")
        elif test_r2 > 0.75:
            f.write("  Overall Grade: SATISFACTORY (B)\n")
        else:
            f.write("  Overall Grade: NEEDS IMPROVEMENT (C)\n")
        
        f.write(f"\n  Explanation: The model explains {test_r2*100:.2f}% of variance in the test data.\n")
        
        if abs(train_r2 - test_r2) < 0.05:
            f.write("  Generalization: Excellent - No overfitting detected\n")
        elif abs(train_r2 - test_r2) < 0.10:
            f.write("  Generalization: Good - Minimal overfitting\n")
        else:
            f.write("  Generalization: Fair - Some overfitting detected\n")
        
        f.write("\n" + "=" * 80 + "\n")
        f.write("END OF REPORT\n")
        f.write("=" * 80 + "\n")
    
    print(f"\n   ✅ Evaluation report saved: {report_path}")

def evaluate_model():
    """Main evaluation function"""
    evaluate_saved_model()

if __name__ == "__main__":
    evaluate_model()
