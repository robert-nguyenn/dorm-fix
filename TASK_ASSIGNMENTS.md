# DormFix - Task Assignments & Next Steps

## 🎯 Where We Are Now

✅ **Complete:**
- Full backend API with Express, MongoDB, Cloudinary, Gemini AI
- Complete mobile app with Expo React Native
- All 3 screens: Home (ticket list), Create Ticket, Ticket Detail
- Camera capture, image upload, AI analysis
- Status tracking and timeline
- Project documentation

## 👥 Task Division

### 🔧 Person 1: Backend + AI Lead (YOU)

**Immediate Setup (Next 2 hours):**
1. ✅ Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. ✅ Create accounts & get credentials:
   - **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
     - Create free cluster
     - Get connection string
   - **Cloudinary**: https://cloudinary.com/
     - Sign up
     - Get cloud name, API key, API secret from Dashboard
   - **Google Gemini**: https://makersuite.google.com/app/apikey
     - Create API key

3. ✅ Setup environment:
   ```bash
   cp .env.example .env
   # Edit .env file with your credentials
   ```

4. ✅ Start backend:
   ```bash
   npm run dev
   ```

5. ✅ Test backend:
   ```bash
   curl http://localhost:3000/health
   ```

**Your Focus Areas:**

**Week 1 (Jan 10-18):**
- [ ] Test API endpoints with Postman/Thunder Client
- [ ] Seed demo locations (buildings/dorms)
- [ ] Test image upload to Cloudinary
- [ ] Test Gemini AI analysis
- [ ] Monitor console logs for AI responses
- [ ] Document API behavior

**Week 2 (Jan 19-25):**
- [ ] Refine Gemini prompts for better accuracy
- [ ] Handle edge cases (AI timeout, invalid images)
- [ ] Add fallback responses
- [ ] Optimize image size before Gemini
- [ ] Test various maintenance issue types

**Week 3 (Jan 26-Feb 1):**
- [ ] Add "resolve ticket" endpoint with after photos
- [ ] Implement ticket filtering/search
- [ ] Add demo data seeding script
- [ ] Performance testing

**Week 4 (Feb 2-6):**
- [ ] Final API testing
- [ ] Write Devpost technical description
- [ ] Create architecture diagram
- [ ] Prepare demo script
- [ ] Help with deployment if time

---

### 📱 Person 2: Mobile + UX Lead (YOUR PARTNER)

**Immediate Setup (Next 2 hours):**
1. ✅ Install Expo CLI:
   ```bash
   npm install -g expo-cli
   ```

2. ✅ Install mobile dependencies:
   ```bash
   cd mobile
   npm install
   ```

3. ✅ Install Expo Go on phone:
   - iOS: App Store
   - Android: Play Store

4. ✅ Start mobile app:
   ```bash
   npm start
   ```

5. ✅ Update backend URL in `mobile/app.json`:
   - Get Person 1's local IP address
   - Update `extra.apiUrl` to `http://THEIR_IP:3000`

**Your Focus Areas:**

**Week 1 (Jan 10-18):**
- [ ] Test camera capture flow
- [ ] Test ticket submission end-to-end
- [ ] Verify images upload correctly
- [ ] Test on physical device
- [ ] Fix any layout issues
- [ ] Test ticket list refresh

**Week 2 (Jan 19-25):**
- [ ] Polish UI animations and transitions
- [ ] Add loading states everywhere
- [ ] Add error handling (network errors, camera errors)
- [ ] Improve form validation
- [ ] Add confirmation dialogs
- [ ] Test user flow from start to finish

**Week 3 (Jan 26-Feb 1):**
- [ ] Implement before/after photo comparison UI
- [ ] Add image zoom/preview
- [ ] Improve ticket detail screen
- [ ] Add pull-to-refresh indicators
- [ ] Polish colors and spacing
- [ ] Test on different screen sizes

**Week 4 (Feb 2-6):**
- [ ] Final UI polish
- [ ] Record demo video (screen recording)
- [ ] Test on multiple devices
- [ ] Create app screenshots for Devpost
- [ ] User flow documentation

---

## 🚀 Immediate Next Steps (Both)

### Today (Jan 10):
1. **Person 1**: Get backend running with all credentials
2. **Person 2**: Get mobile app running on your phone
3. **Together**: Test end-to-end ticket creation
4. **Together**: Verify AI analysis works
5. **Together**: Check images appear in Cloudinary

### Tomorrow (Jan 11):
1. Create 3-5 test tickets together
2. Document any bugs or issues
3. Verify database stores tickets correctly
4. Test on both iOS and Android if possible

### This Week:
- Daily sync: 15-minute standup
- Share screen to debug together
- Push code to GitHub regularly
- Test each other's changes

---

## 📋 Testing Checklist

### Backend Testing (Person 1):
```bash
# Health check
curl http://localhost:3000/health

# Get all tickets
curl http://localhost:3000/api/tickets

# Get locations
curl http://localhost:3000/api/locations

# Create ticket (use Postman for multipart/form-data)
```

### Mobile Testing (Person 2):
- [ ] Camera permissions granted
- [ ] Can take photo
- [ ] Can enter building/room
- [ ] Submit button works
- [ ] Success message appears
- [ ] Ticket appears in list
- [ ] Can tap ticket to see details
- [ ] Status badges show correctly
- [ ] Timeline displays properly

---

## 🐛 Common Issues & Solutions

### Backend Issues:

**MongoDB connection error:**
- Check connection string in `.env`
- Make sure IP is whitelisted in MongoDB Atlas
- Use `0.0.0.0/0` for testing (allow all IPs)

**Cloudinary upload fails:**
- Check credentials in `.env`
- Verify account is active
- Check upload limits (free tier)

**Gemini AI timeout:**
- Check API key is valid
- Check API quota limits
- Add fallback in code (already included)

### Mobile Issues:

**Can't connect to backend:**
- Verify backend is running
- Check IP address in `app.json`
- Both devices on same Wi-Fi?
- Try `ipconfig` or `ifconfig` to get correct IP

**Camera not working:**
- Grant permissions in phone settings
- Restart app after granting permissions
- Check Expo Camera plugin installed

**Images not uploading:**
- Check network connection
- Check backend logs for errors
- Verify image file size < 5MB

---

## 📊 Demo Day Preparation

### What to Show (3 minutes):

1. **Problem Statement** (30 sec)
   - Show vague ticket example
   - Explain pain points

2. **Demo Flow** (90 sec)
   - Take photo of issue
   - Enter location
   - Submit (show speed)
   - Show AI-generated ticket
   - Highlight category, severity, description

3. **Status Tracking** (30 sec)
   - Show timeline
   - Change status
   - Before/after photos

4. **Impact** (30 sec)
   - Faster resolution
   - Better communication
   - Accountability

### Materials Needed:
- [ ] Demo script (written)
- [ ] Demo video (backup)
- [ ] Architecture diagram
- [ ] Screenshots
- [ ] Devpost writeup
- [ ] GitHub repo link

---

## 🎓 Learning Resources

### For Person 1 (Backend):
- Express.js Docs: https://expressjs.com/
- MongoDB Docs: https://docs.mongodb.com/
- Gemini API Docs: https://ai.google.dev/docs

### For Person 2 (Mobile):
- Expo Docs: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
- React Native Docs: https://reactnative.dev/

---

## 💬 Communication

**Daily Standup Questions:**
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers?

**When to Sync:**
- After completing each major feature
- When stuck on a bug (>30 min)
- Before pushing breaking changes
- End of day: commit and push

---

## 🎯 Success Metrics

By Feb 6, we should have:
- [ ] Working end-to-end ticket creation
- [ ] 10+ test tickets in database
- [ ] AI analysis accuracy >80%
- [ ] App works on 2+ devices
- [ ] Demo video recorded
- [ ] Devpost submission complete

---

## 📞 Need Help?

- Check README files in `/backend` and `/mobile`
- Read error messages carefully
- Google the error
- Check Stack Overflow
- Ask each other!

**Good luck! You've got this! 🚀**
