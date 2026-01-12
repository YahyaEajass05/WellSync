# Run FastAPI Server
# Starts the WellSync AI API server

Write-Host ""
Write-Host "Starting WellSync AI API Server..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Set Python path
$env:PYTHONPATH = $PWD

# Run API server
python ai/api/main.py

Write-Host ""
Write-Host "Server stopped!" -ForegroundColor Yellow
Write-Host ""
