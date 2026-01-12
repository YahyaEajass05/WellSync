"""
Exploratory Data Analysis (EDA) for Mental Wellness Dataset
Comprehensive analysis with visualizations and statistical insights
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
from scipy import stats
from sklearn.preprocessing import LabelEncoder

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)

def load_data():
    """Load the mental wellness dataset"""
    csv_path = "ai/data/ScreenTime_MentalWellness.csv"
    df = pd.read_csv(csv_path)
    print(f"✅ Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    return df

def basic_info(df):
    """Display basic dataset information"""
    print("\n" + "="*80)
    print("📊 DATASET BASIC INFORMATION")
    print("="*80)
    
    print(f"\nDataset Shape: {df.shape}")
    print(f"Total Samples: {df.shape[0]}")
    print(f"Total Features: {df.shape[1]}")
    
    print("\n📋 Column Names and Types:")
    print(df.dtypes)
    
    print("\n🔍 Missing Values:")
    missing = df.isnull().sum()
    if missing.sum() == 0:
        print("   ✅ No missing values found!")
    else:
        print(missing[missing > 0])
    
    print("\n📊 Duplicate Rows:")
    duplicates = df.duplicated().sum()
    print(f"   Total duplicates: {duplicates}")
    
    print("\n💾 Memory Usage:")
    print(f"   {df.memory_usage(deep=True).sum() / 1024:.2f} KB")

def statistical_summary(df):
    """Display statistical summary"""
    print("\n" + "="*80)
    print("📈 STATISTICAL SUMMARY")
    print("="*80)
    
    print("\n📊 Numerical Features Summary:")
    print(df.describe())
    
    print("\n📊 Categorical Features Summary:")
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if col != 'user_id':
            print(f"\n{col}:")
            print(df[col].value_counts())

def target_analysis(df):
    """Analyze target variable (mental wellness index)"""
    print("\n" + "="*80)
    print("🎯 TARGET VARIABLE ANALYSIS: Mental Wellness Index")
    print("="*80)
    
    target = df['mental_wellness_index_0_100']
    
    print(f"\n📊 Statistics:")
    print(f"   Mean: {target.mean():.2f}")
    print(f"   Median: {target.median():.2f}")
    print(f"   Std Dev: {target.std():.2f}")
    print(f"   Min: {target.min():.2f}")
    print(f"   Max: {target.max():.2f}")
    print(f"   25th Percentile: {target.quantile(0.25):.2f}")
    print(f"   75th Percentile: {target.quantile(0.75):.2f}")
    
    # Create visualization directory
    os.makedirs("ai/src/mental_health/eda_visualizations", exist_ok=True)
    
    # Plot distribution
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Histogram
    axes[0].hist(target, bins=30, color='steelblue', edgecolor='black', alpha=0.7)
    axes[0].axvline(target.mean(), color='red', linestyle='--', linewidth=2, label=f'Mean: {target.mean():.2f}')
    axes[0].axvline(target.median(), color='green', linestyle='--', linewidth=2, label=f'Median: {target.median():.2f}')
    axes[0].set_xlabel('Mental Wellness Index', fontsize=12)
    axes[0].set_ylabel('Frequency', fontsize=12)
    axes[0].set_title('Distribution of Mental Wellness Index', fontsize=14, fontweight='bold')
    axes[0].legend()
    axes[0].grid(alpha=0.3)
    
    # Box plot
    axes[1].boxplot(target, vert=True)
    axes[1].set_ylabel('Mental Wellness Index', fontsize=12)
    axes[1].set_title('Box Plot of Mental Wellness Index', fontsize=14, fontweight='bold')
    axes[1].grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig("ai/src/mental_health/eda_visualizations/target_distribution.png", dpi=300, bbox_inches='tight')
    print("\n   ✅ Saved: target_distribution.png")
    plt.close()

def correlation_analysis(df):
    """Analyze correlations between features"""
    print("\n" + "="*80)
    print("🔗 CORRELATION ANALYSIS")
    print("="*80)
    
    # Select numeric columns
    numeric_df = df.select_dtypes(include=[np.number])
    if 'user_id' in numeric_df.columns:
        numeric_df = numeric_df.drop(columns=['user_id'])
    
    # Calculate correlation matrix
    correlation_matrix = numeric_df.corr()
    
    # Top correlations with target
    target_corr = correlation_matrix['mental_wellness_index_0_100'].sort_values(ascending=False)
    print("\n📊 Top Correlations with Mental Wellness Index:")
    print(target_corr)
    
    # Create heatmap
    plt.figure(figsize=(14, 10))
    sns.heatmap(correlation_matrix, annot=True, fmt='.2f', cmap='coolwarm', 
                center=0, square=True, linewidths=1, cbar_kws={"shrink": 0.8})
    plt.title('Feature Correlation Heatmap', fontsize=16, fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig("ai/src/mental_health/eda_visualizations/correlation_heatmap.png", dpi=300, bbox_inches='tight')
    print("\n   ✅ Saved: correlation_heatmap.png")
    plt.close()

def feature_distributions(df):
    """Analyze distributions of key features"""
    print("\n" + "="*80)
    print("📊 KEY FEATURE DISTRIBUTIONS")
    print("="*80)
    
    key_features = ['screen_time_hours', 'sleep_hours', 'stress_level_0_10', 
                   'productivity_0_100', 'exercise_minutes_per_week', 'social_hours_per_week']
    
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    axes = axes.ravel()
    
    for idx, feature in enumerate(key_features):
        if feature in df.columns:
            axes[idx].hist(df[feature], bins=25, color='steelblue', edgecolor='black', alpha=0.7)
            axes[idx].axvline(df[feature].mean(), color='red', linestyle='--', linewidth=2, 
                            label=f'Mean: {df[feature].mean():.2f}')
            axes[idx].set_xlabel(feature.replace('_', ' ').title(), fontsize=10)
            axes[idx].set_ylabel('Frequency', fontsize=10)
            axes[idx].set_title(f'Distribution: {feature.replace("_", " ").title()}', 
                              fontsize=11, fontweight='bold')
            axes[idx].legend()
            axes[idx].grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig("ai/src/mental_health/eda_visualizations/feature_distributions.png", dpi=300, bbox_inches='tight')
    print("\n   ✅ Saved: feature_distributions.png")
    plt.close()

def categorical_analysis(df):
    """Analyze categorical variables"""
    print("\n" + "="*80)
    print("📊 CATEGORICAL FEATURES ANALYSIS")
    print("="*80)
    
    categorical_cols = ['gender', 'occupation', 'work_mode']
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    for idx, col in enumerate(categorical_cols):
        if col in df.columns:
            value_counts = df[col].value_counts()
            axes[idx].bar(value_counts.index, value_counts.values, color='steelblue', edgecolor='black', alpha=0.7)
            axes[idx].set_xlabel(col.replace('_', ' ').title(), fontsize=11)
            axes[idx].set_ylabel('Count', fontsize=11)
            axes[idx].set_title(f'{col.replace("_", " ").title()} Distribution', fontsize=12, fontweight='bold')
            axes[idx].tick_params(axis='x', rotation=45)
            axes[idx].grid(alpha=0.3, axis='y')
            
            print(f"\n{col.upper()}:")
            print(value_counts)
    
    plt.tight_layout()
    plt.savefig("ai/src/mental_health/eda_visualizations/categorical_distributions.png", dpi=300, bbox_inches='tight')
    print("\n   ✅ Saved: categorical_distributions.png")
    plt.close()

def wellness_by_category(df):
    """Analyze mental wellness by categorical variables"""
    print("\n" + "="*80)
    print("📊 MENTAL WELLNESS BY CATEGORIES")
    print("="*80)
    
    categorical_cols = ['gender', 'occupation', 'work_mode']
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    for idx, col in enumerate(categorical_cols):
        if col in df.columns:
            df.boxplot(column='mental_wellness_index_0_100', by=col, ax=axes[idx])
            axes[idx].set_xlabel(col.replace('_', ' ').title(), fontsize=11)
            axes[idx].set_ylabel('Mental Wellness Index', fontsize=11)
            axes[idx].set_title(f'Mental Wellness by {col.replace("_", " ").title()}', fontsize=12, fontweight='bold')
            axes[idx].get_figure().suptitle('')  # Remove default title
            
            # Print statistics
            print(f"\n{col.upper()} - Mental Wellness Statistics:")
            print(df.groupby(col)['mental_wellness_index_0_100'].describe())
    
    plt.tight_layout()
    plt.savefig("ai/src/mental_health/eda_visualizations/wellness_by_category.png", dpi=300, bbox_inches='tight')
    print("\n   ✅ Saved: wellness_by_category.png")
    plt.close()

def scatter_plots(df):
    """Create scatter plots for key relationships"""
    print("\n" + "="*80)
    print("📊 SCATTER PLOTS: Key Relationships")
    print("="*80)
    
    relationships = [
        ('screen_time_hours', 'mental_wellness_index_0_100'),
        ('sleep_hours', 'mental_wellness_index_0_100'),
        ('stress_level_0_10', 'mental_wellness_index_0_100'),
        ('productivity_0_100', 'mental_wellness_index_0_100')
    ]
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    axes = axes.ravel()
    
    for idx, (x_col, y_col) in enumerate(relationships):
        if x_col in df.columns and y_col in df.columns:
            axes[idx].scatter(df[x_col], df[y_col], alpha=0.6, color='steelblue', edgecolors='black', s=50)
            
            # Add trend line
            z = np.polyfit(df[x_col], df[y_col], 1)
            p = np.poly1d(z)
            axes[idx].plot(df[x_col], p(df[x_col]), "r--", linewidth=2, label='Trend')
            
            # Calculate correlation
            corr = df[x_col].corr(df[y_col])
            
            axes[idx].set_xlabel(x_col.replace('_', ' ').title(), fontsize=11)
            axes[idx].set_ylabel('Mental Wellness Index', fontsize=11)
            axes[idx].set_title(f'{x_col.replace("_", " ").title()} vs Mental Wellness\nCorr: {corr:.3f}', 
                              fontsize=12, fontweight='bold')
            axes[idx].legend()
            axes[idx].grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig("ai/src/mental_health/eda_visualizations/scatter_plots.png", dpi=300, bbox_inches='tight')
    print("\n   ✅ Saved: scatter_plots.png")
    plt.close()

def outlier_detection(df):
    """Detect and visualize outliers"""
    print("\n" + "="*80)
    print("🔍 OUTLIER DETECTION")
    print("="*80)
    
    numeric_cols = ['screen_time_hours', 'sleep_hours', 'stress_level_0_10', 
                   'mental_wellness_index_0_100']
    
    print("\n📊 Outliers using IQR method:")
    for col in numeric_cols:
        if col in df.columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
            print(f"\n{col}:")
            print(f"   Lower bound: {lower_bound:.2f}")
            print(f"   Upper bound: {upper_bound:.2f}")
            print(f"   Number of outliers: {len(outliers)} ({len(outliers)/len(df)*100:.2f}%)")

def generate_eda_report(df):
    """Generate comprehensive EDA report"""
    print("\n" + "="*80)
    print("📝 GENERATING EDA REPORT")
    print("="*80)
    
    os.makedirs("ai/src/mental_health/eda_visualizations", exist_ok=True)
    
    report_path = "ai/src/mental_health/eda_visualizations/EDA_REPORT.txt"
    
    with open(report_path, 'w') as f:
        f.write("="*80 + "\n")
        f.write("MENTAL WELLNESS DATASET - EXPLORATORY DATA ANALYSIS REPORT\n")
        f.write("="*80 + "\n\n")
        
        f.write(f"Dataset Shape: {df.shape}\n")
        f.write(f"Total Samples: {df.shape[0]}\n")
        f.write(f"Total Features: {df.shape[1]}\n\n")
        
        f.write("="*80 + "\n")
        f.write("MISSING VALUES\n")
        f.write("="*80 + "\n")
        f.write(str(df.isnull().sum()) + "\n\n")
        
        f.write("="*80 + "\n")
        f.write("STATISTICAL SUMMARY\n")
        f.write("="*80 + "\n")
        f.write(str(df.describe()) + "\n\n")
        
        f.write("="*80 + "\n")
        f.write("TARGET VARIABLE STATISTICS\n")
        f.write("="*80 + "\n")
        target = df['mental_wellness_index_0_100']
        f.write(f"Mean: {target.mean():.2f}\n")
        f.write(f"Median: {target.median():.2f}\n")
        f.write(f"Std Dev: {target.std():.2f}\n")
        f.write(f"Min: {target.min():.2f}\n")
        f.write(f"Max: {target.max():.2f}\n\n")
        
        f.write("="*80 + "\n")
        f.write("CORRELATIONS WITH TARGET\n")
        f.write("="*80 + "\n")
        numeric_df = df.select_dtypes(include=[np.number])
        if 'user_id' in numeric_df.columns:
            numeric_df = numeric_df.drop(columns=['user_id'])
        correlations = numeric_df.corr()['mental_wellness_index_0_100'].sort_values(ascending=False)
        f.write(str(correlations) + "\n")
    
    print(f"   ✅ Report saved: {report_path}")

def run_complete_eda():
    """Run complete EDA analysis"""
    print("\n" + "="*80)
    print("🚀 MENTAL WELLNESS DATASET - COMPREHENSIVE EDA")
    print("="*80)
    
    # Load data
    df = load_data()
    
    # Run all analyses
    basic_info(df)
    statistical_summary(df)
    target_analysis(df)
    correlation_analysis(df)
    feature_distributions(df)
    categorical_analysis(df)
    wellness_by_category(df)
    scatter_plots(df)
    outlier_detection(df)
    generate_eda_report(df)
    
    print("\n" + "="*80)
    print("✅ EDA COMPLETE!")
    print("="*80)
    print("\n📁 All visualizations saved in: ai/src/mental_health/eda_visualizations/")
    print("\n📊 Generated Files:")
    print("   • target_distribution.png")
    print("   • correlation_heatmap.png")
    print("   • feature_distributions.png")
    print("   • categorical_distributions.png")
    print("   • wellness_by_category.png")
    print("   • scatter_plots.png")
    print("   • EDA_REPORT.txt")
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    run_complete_eda()
