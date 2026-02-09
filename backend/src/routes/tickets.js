import express from 'express';
import multer from 'multer';
import { createTicket, getTickets, getTicketById, updateTicketStatus, deleteTicket } from '../controllers/ticketController.js';

const router = express.Router();

// Configure multer for image upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/tickets - Create new ticket with image
router.post('/', upload.array('images', 5), createTicket);

// GET /api/tickets - Get all tickets (with optional filters)
router.get('/', getTickets);

// GET /api/tickets/:id - Get specific ticket
router.get('/:id', getTicketById);

// DELETE /api/tickets/:id - Delete ticket
router.delete('/:id', deleteTicket);

// PATCH /api/tickets/:id/status - Update ticket status
router.patch('/:id/status', updateTicketStatus);

// PATCH /api/tickets/:id/resolve - Mark ticket as resolved with after photo
router.patch('/:id/resolve', upload.array('afterImages', 5), async (req, res, next) => {
  req.body.status = 'RESOLVED';
  next();
}, updateTicketStatus);

export default router;
