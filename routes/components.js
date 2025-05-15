// backend/models/Component.js
const mongoose = require('mongoose');

const componentModelSchema = new mongoose.Schema({
  model: String,
  HSN_SAC: String,
  warranty: String,
  purchase_with_GST: Number,
  sale_with_GST: Number,
});

const componentSchema = new mongoose.Schema({
  category: String,
  brand: String,
  models: [componentModelSchema],
});

module.exports = mongoose.model('Component', componentSchema);
