# Run EDA for Academic Impact Dataset

Write-Host ""
Write-Host "Running EDA for Academic Impact Dataset..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Set Python path
$env:PYTHONPATH = $PWD

# Run EDA
python ai/src/academic/eda.py

Write-Host ""
Write-Host "EDA Complete! Check ai/src/academic/eda_visualizations/" -ForegroundColor Green
Write-Host ""
