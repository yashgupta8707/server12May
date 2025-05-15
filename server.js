// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const partyRoutes = require('./routes/parties');
const quotationRoutes = require('./routes/quotations');
const componentRoutes = require('./routes/components');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/parties', partyRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/components', componentRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
