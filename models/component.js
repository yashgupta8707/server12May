// backend/models/component.js
const mongoose = require('mongoose');

const componentModelSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
    trim: true
  },
  HSN_SAC: {
    type: String,
    default: "84733099",
    trim: true
  },
  warranty: String,
  purchase_with_GST: {
    type: Number,
    default: 0
  },
  sale_with_GST: {
    type: Number,
    default: 0
  }
});

const componentSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  models: [componentModelSchema]
}, { timestamps: true });

module.exports = mongoose.model('Component', componentSchema);