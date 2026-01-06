# Run Academic Impact Training Script
# Automatically sets PYTHONPATH and runs training

Write-Host ""
Write-Host "Starting Academic Impact Model Training..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Set Python path to current directory
$env:PYTHONPATH = $PWD

# Run training
python ai/src/academic/train.py

Write-Host ""
Write-Host "Training complete!" -ForegroundColor Green
Write-Host ""
