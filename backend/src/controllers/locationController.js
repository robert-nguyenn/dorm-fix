import Location from '../models/Location.js';

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      count: locations.length,
      locations
    });

  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch locations' } 
    });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { name, type, address } = req.body;

    if (!name) {
      return res.status(400).json({ 
        error: { message: 'Location name is required' } 
      });
    }

    const location = new Location({
      name,
      type: type || 'dorm',
      address
    });

    await location.save();

    res.status(201).json({
      success: true,
      location
    });

  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ 
      error: { message: 'Failed to create location' } 
    });
  }
};
