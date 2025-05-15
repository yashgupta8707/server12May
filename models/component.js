// models/Component.js
const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
  category: String,
  brand: String,
  model: String,
  HSN_SAC: String,
  warranty: String,
  purchase_with_GST: Number,
  sale_with_GST: Number
});

const Component = mongoose.model('Component', ComponentSchema);
module.exports = Component;
