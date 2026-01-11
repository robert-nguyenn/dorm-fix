# DormFix Backend API

Node.js + Express backend for DormFix maintenance ticket system.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required Services:**

**MongoDB Atlas:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string → add to `MONGODB_URI`

**Cloudinary:**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Dashboard → Account Details
3. Copy Cloud Name, API Key, API Secret → add to `.env`

**Google Gemini API:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `GEMINI_API_KEY`

### 3. Run Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Test the API
```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok","message":"DormFix API is running"}
```

## API Endpoints

### Tickets

**POST /api/tickets**
- Create new maintenance ticket
- Body: `multipart/form-data`
  - `images`: Image files (1-5)
  - `building`: Building name
  - `room`: Room number
  - `locationNotes`: Optional location details
  - `userNote`: Optional description
  - `reporterName`: Optional name

**GET /api/tickets**
- Get all tickets
- Query params:
  - `status`: Filter by status (NEW, IN_REVIEW, IN_PROGRESS, RESOLVED)
  - `building`: Filter by building
  - `category`: Filter by category

**GET /api/tickets/:id**
- Get specific ticket

**PATCH /api/tickets/:id/status**
- Update ticket status
- Body: `{ "status": "IN_PROGRESS", "note": "Optional note" }`

**PATCH /api/tickets/:id/resolve**
- Mark ticket as resolved
- Body: `multipart/form-data`
  - `afterImages`: After photos
  - `note`: Optional completion note

### Locations

**GET /api/locations**
- Get all active locations/buildings

**POST /api/locations**
- Add new location (for seeding)
- Body: `{ "name": "Building Name", "type": "dorm" }`

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # External services (Cloudinary, Gemini)
│   └── server.js        # Entry point
├── .env                 # Environment variables (create this)
├── .env.example         # Template
└── package.json
```

## Development Tips

- Use Postman or Thunder Client to test API endpoints
- Check terminal logs for Gemini AI analysis results
- Images are automatically optimized by Cloudinary
- Gemini fallback ensures tickets work even if AI fails

## Next Steps

After backend is running:
1. Test ticket creation with Postman
2. Verify images upload to Cloudinary
3. Check MongoDB Atlas to see ticket data
4. Test Gemini AI analysis (check console logs)
