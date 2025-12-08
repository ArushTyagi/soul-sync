// 1. Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5001;

// 2. CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 3. MongoDB Atlas Connection - USE THIS EXACT STRING
const MONGODB_URI = 'mongodb+srv://arusht_db_user:Arush%40Db1@cluster0.vbpnk1n.mongodb.net/diary-app?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔗 Attempting to connect to MongoDB...');
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => {
  console.log('❌ MongoDB connection error:', err.message);
  console.log('💡 Check your:');
  console.log('   - Username and password');
  console.log('   - Network Access in MongoDB Atlas');
  console.log('   - Database name in connection string');
});

// 4. User Model
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  console.log('🔐 Hashing password...');
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Check password method
userSchema.methods.correctPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// 5. Diary Model
const diarySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 5000
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

const Diary = mongoose.model('Diary', diarySchema);

// 6. Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, 'diary-app-secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// 7. Routes

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 Diary App Server is Working!',
    status: 'SUCCESS', 
    database: 'MongoDB Atlas Connected',
    features: ['User Registration', 'User Login', 'Diary Entries', 'Edit/Delete']
  });
});

// Register new user - WITH DEBUG LOGGING
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('='.repeat(50));
    console.log('📝 REGISTRATION ATTEMPT RECEIVED');
    console.log('Request body:', req.body);
    
    const { username, email, password } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password) {
      console.log('❌ MISSING FIELDS:', { 
        username: !!username, 
        email: !!email, 
        password: !!password 
      });
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required: username, email, password' 
      });
    }

    console.log('✅ All fields present');
    console.log('🔍 Checking for existing user...');

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      console.log('❌ USER ALREADY EXISTS');
      console.log('Existing user:', {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email
      });
      return res.status(400).json({ 
        success: false,
        message: 'User with this email or username already exists' 
      });
    }

    console.log('✅ No existing user found');
    console.log('👤 Creating new user...');

    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    
    console.log('✅ USER CREATED SUCCESSFULLY');
    console.log('User ID:', user._id);
    console.log('Username:', user.username);

    // Create JWT token
    const token = jwt.sign({ id: user._id }, 'diary-app-secret', {
      expiresIn: '7d'
    });

    console.log('🔑 JWT Token created');
    console.log('✅ REGISTRATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(50));

    res.status(201).json({
      success: true,
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });

  } catch (error) {
    console.log('❌ REGISTRATION ERROR:', error.message);
    console.log('Error stack:', error.stack);
    console.log('='.repeat(50));
    
    res.status(400).json({ 
      success: false,
      message: 'Error creating account',
      error: error.message 
    });
  }
});

// Login user - WITH DEBUG LOGGING
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('='.repeat(50));
    console.log('🔐 LOGIN ATTEMPT RECEIVED');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;

    // Find user by email
    console.log('🔍 Searching for user by email:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ USER NOT FOUND with email:', email);
      console.log('='.repeat(50));
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('✅ USER FOUND:', user.username);
    console.log('🔐 Checking password...');

    // Check password
    const isPasswordCorrect = await user.correctPassword(password);
    if (!isPasswordCorrect) {
      console.log('❌ WRONG PASSWORD for user:', user.username);
      console.log('='.repeat(50));
      return res.status(400).json({ 
        success: false,
        message: 'Wrong password' 
      });
    }

    console.log('✅ PASSWORD CORRECT');

    // Create JWT token
    const token = jwt.sign({ id: user._id }, 'diary-app-secret', {
      expiresIn: '7d'
    });

    console.log('🔑 JWT Token created');
    console.log('✅ LOGIN SUCCESSFUL for:', user.username);
    console.log('='.repeat(50));

    res.json({
      success: true,
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });

  } catch (error) {
    console.log('❌ LOGIN ERROR:', error.message);
    console.log('='.repeat(50));
    
    res.status(400).json({ 
      success: false,
      message: 'Login failed',
      error: error.message 
    });
  }
});

// Get current user profile
app.get('/api/auth/me', auth, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// DIARY ROUTES

// Get all diary entries for logged-in user
app.get('/api/diary', auth, async (req, res) => {
  try {
    console.log('📖 Fetching diary entries for user:', req.user.username);
    
    const entries = await Diary.find({ author: req.user._id })
      .sort({ createdAt: -1 });

    console.log('✅ Found', entries.length, 'entries');
    res.json({
      success: true,
      entries: entries
    });

  } catch (error) {
    console.log('❌ Error fetching entries:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching entries',
      error: error.message 
    });
  }
});

// Get single diary entry
app.get('/api/diary/:id', auth, async (req, res) => {
  try {
    const entry = await Diary.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Entry not found' 
      });
    }

    res.json({
      success: true,
      entry: entry
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching entry',
      error: error.message 
    });
  }
});

// Create new diary entry
app.post('/api/diary', auth, async (req, res) => {
  try {
    console.log('📝 Creating diary entry for user:', req.user.username);
    console.log('Entry data:', req.body);
    
    const { title, content } = req.body;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const entry = new Diary({
      title,
      content,
      author: req.user._id
    });

    await entry.save();

    console.log('✅ Diary entry created:', entry._id);
    res.status(201).json({
      success: true,
      message: 'Diary entry saved successfully!',
      entry: entry
    });

  } catch (error) {
    console.log('❌ Error saving entry:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Error saving entry',
      error: error.message 
    });
  }
});

// Update diary entry
app.put('/api/diary/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Validate input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const entry = await Diary.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Entry not found' 
      });
    }

    entry.title = title;
    entry.content = content;
    await entry.save();

    res.json({
      success: true,
      message: 'Entry updated successfully!',
      entry: entry
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating entry',
      error: error.message 
    });
  }
});

// Delete diary entry
app.delete('/api/diary/:id', auth, async (req, res) => {
  try {
    const entry = await Diary.findOneAndDelete({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Entry not found' 
      });
    }

    res.json({
      success: true,
      message: 'Entry deleted successfully!'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting entry',
      error: error.message 
    });
  }
});

// 8. Handle 404 routes
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.originalUrl
  });
});

// 9. Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 DIARY APP SERVER RUNNING!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('📊 Database: MongoDB Atlas (Cloud)');
  console.log('🔐 Features: User Auth + Diary CRUD + Edit/Delete');
  console.log('='.repeat(60));
});