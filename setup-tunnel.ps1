# Quick setup script for ngrok
Write-Host "=== DormFix Tunnel Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Sign up at: https://dashboard.ngrok.com/signup" -ForegroundColor Yellow
Write-Host "2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Yellow
Write-Host ""
$token = Read-Host "Paste your ngrok authtoken here"

if ($token) {
    Write-Host "`nSetting up ngrok..." -ForegroundColor Green
    ngrok config add-authtoken $token
    
    Write-Host "`nStarting tunnel on port 3000..." -ForegroundColor Green
    Write-Host "Keep this window open!" -ForegroundColor Red
    Write-Host ""
    ngrok http 3000
} else {
    Write-Host "No token provided. Exiting." -ForegroundColor Red
}
