// backend/models/quotation.js
const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  party_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Party', 
    required: true 
  },
  title: String,
  quotation_number: String,
  date: { 
    type: Date, 
    default: Date.now 
  },
  valid_until: Date,
  business_details: {
    name: String,
    address: String,
    phone: String,
    email: String,
    gstin: String,
    logo: String
  },
  items: [{
    category: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    hsn_sac: { type: String, default: "84733099" },
    warranty: String,
    quantity: { type: Number, default: 1 },
    purchase_with_gst: { type: Number, default: 0 },
    sale_with_gst: { type: Number, default: 0 },
    gst_percentage: { type: Number, default: 18 }
  }],
  total_amount: { type: Number, default: 0 },
  total_purchase: { type: Number, default: 0 },
  total_tax: { type: Number, default: 0 },
  notes: String,
  terms_conditions: String,
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'], 
    default: 'draft' 
  },
  revision_of: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quotation' 
  },
  revision_number: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add a virtual property for margin calculations
quotationSchema.virtual('margin').get(function() {
  return (this.total_amount || 0) - (this.total_purchase || 0);
});

quotationSchema.virtual('margin_percentage').get(function() {
  if (!this.total_amount || this.total_amount === 0) return 0;
  return (this.margin / this.total_amount) * 100;
});

// Ensure virtuals are included in JSON output
quotationSchema.set('toJSON', { virtuals: true });
quotationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Quotation', quotationSchema);