# DormFix Mobile App

Expo React Native app for submitting maintenance tickets with photos.

## Setup Instructions

### 1. Install Expo CLI (if you don't have it)
```bash
npm install -g expo-cli
```

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Configure Backend URL

The app is configured to connect to `http://localhost:3000` by default.

**For testing on a physical device:**
1. Find your computer's local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr` (look for inet)
2. Edit `mobile/app.json`:
   ```json
   "extra": {
     "apiUrl": "http://YOUR_LOCAL_IP:3000"
   }
   ```
   Example: `"apiUrl": "http://192.168.1.100:3000"`

### 4. Start the App

```bash
npm start
```

This opens Expo DevTools. You can:
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)
- Scan QR code with Expo Go app on your phone

### 5. Install Expo Go on Your Phone (Recommended)

- iOS: Download from App Store
- Android: Download from Play Store

Scan the QR code from the terminal to run the app on your device.

## Project Structure

```
mobile/
├── src/
│   ├── screens/           # App screens
│   │   ├── HomeScreen.js         # Ticket list
│   │   ├── CreateTicketScreen.js # Submit ticket
│   │   └── TicketDetailScreen.js # View ticket details
│   └── services/
│       └── api.js         # API client
├── App.js                 # Navigation setup
├── app.json              # Expo configuration
└── package.json
```

## Features

### Home Screen
- View all submitted tickets
- Color-coded status badges
- Pull to refresh
- Tap ticket to view details
- FAB button to create new ticket

### Create Ticket Screen
- Take photo with camera
- Choose from gallery
- Enter building and room
- Optional location notes
- Optional user description
- Submit in ~30 seconds

### Ticket Detail Screen
- View all ticket details
- See AI-generated analysis
- View status timeline
- Demo status update buttons
- Before/after photos

## Development Tips

### Testing on Physical Device
1. Make sure your phone and computer are on the same Wi-Fi network
2. Update the `apiUrl` in `app.json` with your local IP
3. Make sure backend is running on port 3000
4. Scan QR code with Expo Go app

### Common Issues

**Camera not working:**
- Grant camera permissions in phone settings
- Restart the app after granting permissions

**Cannot connect to backend:**
- Check that backend is running: `curl http://localhost:3000/health`
- Verify your local IP address is correct in `app.json`
- Check firewall settings (backend port 3000 must be accessible)

**Images not uploading:**
- Check Cloudinary credentials in backend `.env`
- Check console logs in terminal for upload errors

### Hot Reload
Expo supports hot reload - just save your files and the app updates automatically!

## Next Steps

1. Test camera capture flow
2. Test ticket submission
3. Verify images appear in Cloudinary
4. Test status updates
5. Polish UI based on feedback
