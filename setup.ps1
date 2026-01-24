#!/usr/bin/env pwsh
# DormFix Quick Setup & Test Script
# Run this after cloning the repository

Write-Host "🏗️  DormFix - Quick Setup & Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if in correct directory
if (!(Test-Path "backend") -or !(Test-Path "mobile")) {
    Write-Host "❌ Error: Run this script from the dorm-fix root directory!" -ForegroundColor Red
    exit 1
}

# Step 1: Install Backend Dependencies
Write-Host "`n📦 Step 1: Installing backend dependencies..." -ForegroundColor Yellow
cd backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Step 2: Setup .env
Write-Host "`n⚙️  Step 2: Setting up environment..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit backend/.env with your API keys!" -ForegroundColor Red
    Write-Host "   Required:" -ForegroundColor Yellow
    Write-Host "   - MONGODB_URI (from MongoDB Atlas)" -ForegroundColor Yellow
    Write-Host "   - CLOUDINARY_* (from Cloudinary)" -ForegroundColor Yellow
    Write-Host "   - GEMINI_API_KEY (from Google)" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET (generate random string)" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  .env already exists, skipping..." -ForegroundColor Yellow
}

# Step 3: Install Mobile Dependencies
Write-Host "`n📦 Step 3: Installing mobile dependencies..." -ForegroundColor Yellow
cd ../mobile
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Mobile installation failed!" -ForegroundColor Red
    exit 1
}

npm install @react-native-async-storage/async-storage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AsyncStorage installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Mobile dependencies installed" -ForegroundColor Green

# Step 4: Get Local IP
Write-Host "`n🌐 Step 4: Getting your local IP address..." -ForegroundColor Yellow
$localIP = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1
if ($localIP) {
    Write-Host "✅ Your local IP: $($localIP.IPAddress)" -ForegroundColor Green
    Write-Host "⚠️  Update mobile/app.json with this IP!" -ForegroundColor Red
    Write-Host "   Edit: mobile/app.json" -ForegroundColor Yellow
    Write-Host "   Set: extra.apiUrl = `"http://$($localIP.IPAddress):3000`"" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Could not detect local IP. Find it manually with: ipconfig" -ForegroundColor Yellow
}

# Step 5: Summary
cd ..
Write-Host "`n✅ Installation Complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your API credentials" -ForegroundColor White
Write-Host "2. Edit mobile/app.json with your IP address" -ForegroundColor White
Write-Host "3. Start backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "4. Start mobile: cd mobile && npx expo start" -ForegroundColor White
Write-Host "5. Scan QR code with Expo Go app" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "• INSTALL.md - Detailed installation guide" -ForegroundColor White
Write-Host "• SETUP.md - Configuration guide" -ForegroundColor White
Write-Host "• API-TESTING.md - Test your backend" -ForegroundColor White
Write-Host "• DEMO-GUIDE.md - Prepare for demo" -ForegroundColor White

Write-Host "`n🎯 Quick Test:" -ForegroundColor Cyan
Write-Host "After configuring .env, run:" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "  # In another terminal:" -ForegroundColor Yellow
Write-Host "  curl http://localhost:3000/health" -ForegroundColor Yellow

Write-Host "`n🚀 Good luck with your hackathon!" -ForegroundColor Green
