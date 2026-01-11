import express from 'express';
import { getLocations, createLocation } from '../controllers/locationController.js';

const router = express.Router();

// GET /api/locations - Get all locations
router.get('/', getLocations);

// POST /api/locations - Create new location (for seeding)
router.post('/', createLocation);

export default router;
