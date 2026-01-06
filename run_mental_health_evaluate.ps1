# Run Mental Wellness Evaluation Script
# Automatically sets PYTHONPATH and runs evaluation

Write-Host ""
Write-Host "Starting Mental Wellness Model Evaluation..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Set Python path to current directory
$env:PYTHONPATH = $PWD

# Run evaluation
python ai/src/mental_health/evaluate.py

Write-Host ""
Write-Host "Evaluation complete!" -ForegroundColor Green
Write-Host ""
