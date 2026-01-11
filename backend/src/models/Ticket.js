import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: String
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  // Reporter info (optional for MVP)
  reporterName: {
    type: String,
    trim: true
  },
  
  // Location details
  building: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  locationNotes: {
    type: String,
    trim: true
  },
  
  // Images
  imageUrls: [{
    type: String,
    required: true
  }],
  afterImageUrls: [{
    type: String
  }],
  
  // User-provided info
  userNote: {
    type: String,
    trim: true
  },
  
  // AI-generated fields
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Pest', 'Furniture', 'Safety', 'Other'],
    default: 'Other'
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  aiSummary: {
    type: String
  },
  facilitiesDescription: {
    type: String
  },
  followUpQuestions: [{
    type: String
  }],
  safetyNotes: [{
    type: String
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED'],
    default: 'NEW'
  },
  statusHistory: [statusHistorySchema],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ building: 1, room: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
