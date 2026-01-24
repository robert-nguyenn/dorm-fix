import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, building, room } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: { message: 'Name, email, and password are required' } 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: { message: 'Passwords do not match' } 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: { message: 'Password must be at least 6 characters' } 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: { message: 'Email already registered' } 
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      building,
      room
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      user,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to create account', details: error.message } 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: { message: 'Email and password are required' } 
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        error: { message: 'Invalid email or password' } 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: { message: 'Invalid email or password' } 
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to login', details: error.message } 
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'User not found' } 
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch user data' } 
    });
  }
};
