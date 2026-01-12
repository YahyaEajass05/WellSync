# Run EDA for Mental Wellness Dataset

Write-Host ""
Write-Host "Running EDA for Mental Wellness Dataset..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Set Python path
$env:PYTHONPATH = $PWD

# Run EDA
python ai/src/mental_health/eda.py

Write-Host ""
Write-Host "EDA Complete! Check ai/src/mental_health/eda_visualizations/" -ForegroundColor Green
Write-Host ""
