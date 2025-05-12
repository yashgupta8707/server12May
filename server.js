const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Import routes
const partyRoutes = require('./routes/party.routes');
const quotationRoutes = require('./routes/quotationRoutes')
const componentRoutes = require('./routes/componentRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
// Enable CORS with specific options for local development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'yashgupta.engineer', 'https://12-may-frontend.vercel.app'],  // Allow both Create React App and Vite defaults
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/empresspc')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Please make sure MongoDB is running and the connection string is correct.');
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// API Routes with proper prefixing
app.use('/api/parties', partyRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/components', componentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message 
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));