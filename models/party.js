// backend/models/party.js
const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  partyId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    default: ""
  }
}, { timestamps: true });

// Make id field index sparse to allow multiple null values
partySchema.index({ id: 1 }, { unique: true, sparse: true });

const Party = mongoose.model('Party', partySchema);
module.exports = Party;