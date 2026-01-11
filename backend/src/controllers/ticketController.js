import Ticket from '../models/Ticket.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { analyzeTicketWithGemini } from '../services/gemini.js';

export const createTicket = async (req, res) => {
  try {
    const { building, room, locationNotes, userNote, reporterName } = req.body;
    
    // Validate required fields
    if (!building || !room) {
      return res.status(400).json({ 
        error: { message: 'Building and room are required' } 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: { message: 'At least one image is required' } 
      });
    }

    // Upload images to Cloudinary
    console.log('📤 Uploading images to Cloudinary...');
    const imageUrls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer);
      imageUrls.push(url);
    }
    console.log('✅ Images uploaded:', imageUrls.length);

    // Create initial ticket
    const ticket = new Ticket({
      building,
      room,
      locationNotes,
      userNote,
      reporterName,
      imageUrls,
      status: 'NEW',
      statusHistory: [{
        status: 'NEW',
        timestamp: new Date(),
        note: 'Ticket created'
      }]
    });

    // Analyze with Gemini AI (async, don't block)
    console.log('🤖 Analyzing ticket with Gemini AI...');
    try {
      const aiAnalysis = await analyzeTicketWithGemini({
        imageUrl: imageUrls[0],
        building,
        room,
        userNote
      });
      
      // Update ticket with AI analysis
      ticket.category = aiAnalysis.category || 'Other';
      ticket.severity = aiAnalysis.severity || 'Low';
      ticket.aiSummary = aiAnalysis.summary;
      ticket.facilitiesDescription = aiAnalysis.facilitiesDescription;
      ticket.followUpQuestions = aiAnalysis.followUpQuestions || [];
      ticket.safetyNotes = aiAnalysis.safetyNotes || [];
      
      console.log('✅ AI analysis complete');
    } catch (aiError) {
      console.error('⚠️ Gemini AI error (proceeding with ticket):', aiError.message);
      // Continue with ticket creation even if AI fails
    }

    await ticket.save();

    res.status(201).json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ 
      error: { message: 'Failed to create ticket', details: error.message } 
    });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { status, building, category } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (building) filter.building = building;
    if (category) filter.category = category;

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch tickets' } 
    });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ 
        error: { message: 'Ticket not found' } 
      });
    }

    res.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch ticket' } 
    });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ 
        error: { message: 'Ticket not found' } 
      });
    }

    // Upload after images if provided (for resolve)
    if (req.files && req.files.length > 0) {
      const afterImageUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        afterImageUrls.push(url);
      }
      ticket.afterImageUrls = afterImageUrls;
    }

    // Update status
    if (status && ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      ticket.status = status;
      ticket.statusHistory.push({
        status,
        timestamp: new Date(),
        note
      });
    }

    await ticket.save();

    res.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update ticket' } 
    });
  }
};
