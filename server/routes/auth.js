const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const db = require('../config/db');
require('dotenv').config();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Enhanced registration validation
const registerValidation = [
  check('username')
    .not().isEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

  check('email')
    .not().isEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please include a valid email')
    .normalizeEmail(),

  check('password')
    .not().isEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
];

// Login validation
const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Register endpoint
router.post('/register', registerValidation, validate, async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if user exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?', 
      [email, username]
    );
    
    if (existingUser.length > 0) {
      const errorField = existingUser[0].email === email ? 'email' : 'username';
      return res.status(400).json({ 
        errors: [{ 
          msg: `User with this ${errorField} already exists`,
          param: errorField
        }] 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    // Create token
    const payload = {
      user: {
        id: result.insertId,
        username: username
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err); // Log error for debugging
          return res.status(500).json({
            errors: [{ 
              msg: 'Error generating token',
              param: 'server'
            }]
          });
        }
        res.json({ 
          token,
          user: {
            id: result.insertId,
            username,
            email
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error:', err); // Log error for debugging
    res.status(500).json({ 
      errors: [{ 
        msg: 'Server error during registration',
        param: 'server'
      }] 
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, validate, async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    const [user] = await db.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (user.length === 0) {
      return res.status(400).json({ 
        errors: [{ 
          msg: 'Invalid credentials',
          param: 'email'
        }] 
      });
    }
    
    // Check if account is locked
    if (user[0].login_attempts >= 5 && 
        new Date(user[0].last_attempt) > new Date(Date.now() - 30 * 60 * 1000)) {
      return res.status(403).json({ 
        errors: [{ 
          msg: 'Account temporarily locked. Try again in 30 minutes.',
          param: 'email'
        }] 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user[0].password);
    
    if (!isMatch) {
      // Increment failed attempts
      await db.query(
        'UPDATE users SET login_attempts = login_attempts + 1, last_attempt = NOW() WHERE id = ?',
        [user[0].id]
      );
      
      // Check if account should be locked
      const [updatedUser] = await db.query(
        'SELECT login_attempts FROM users WHERE id = ?',
        [user[0].id]
      );
      
      if (updatedUser[0].login_attempts >= 5) {
        return res.status(400).json({ 
          errors: [{ 
            msg: 'Too many failed attempts. Account locked for 30 minutes.',
            param: 'email'
          }] 
        });
      }
      
      return res.status(400).json({ 
        errors: [{ 
          msg: 'Invalid credentials',
          param: 'password'
        }] 
      });
    }
    
    // Reset login attempts on successful login
    await db.query(
      'UPDATE users SET login_attempts = 0, last_attempt = NULL WHERE id = ?',
      [user[0].id]
    );
    
    // Create token
    const payload = {
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err); // Log error for debugging
          return res.status(500).json({
            errors: [{ 
              msg: 'Error generating token',
              param: 'server'
            }]
          });
        }
        res.json({ 
          token,
          user: {
            id: user[0].id,
            username: user[0].username,
            email: user[0].email
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err); // Log error for debugging
    res.status(500).json({ 
      errors: [{ 
        msg: 'Server error during login',
        param: 'server'
      }] 
    });
  }
});

module.exports = router;
