// models/quotation.js - Fix for the OverwriteModelError

const mongoose = require('mongoose');

// Define schemas
const itemSchema = new mongoose.Schema({
  category: String,
  brand: String,
  model: String,
  hsn_sac: String,
  warranty: String,
  quantity: Number,
  purchase_with_gst: Number,
  sale_with_gst: Number,
  gst_percentage: Number,
});

const quotationSchema = new mongoose.Schema(
  {
    party_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      required: true,
    },
    quotation_number: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: { 
      type: String,
      required: true
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    valid_until: { 
      type: Date 
    },
    business_details: {
      name: String,
      address: String,
      phone: String,
      email: String,
      gstin: String,
      logo: String,
    },
    items: [itemSchema],
    total_amount: {
      type: Number,
      default: 0
    },
    total_purchase: {
      type: Number,
      default: 0
    },
    total_tax: {
      type: Number,
      default: 0
    },
    notes: String,
    terms_conditions: String,
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
      default: 'draft',
    },
    revision_number: { 
      type: Number, 
      default: 0 
    },
    revision_of: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Quotation',
      sparse: true
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating margin
quotationSchema.virtual('margin').get(function() {
  return (this.total_amount || 0) - (this.total_purchase || 0);
});

quotationSchema.virtual('margin_percentage').get(function() {
  if (!this.total_amount || this.total_amount === 0) return 0;
  return (this.margin / this.total_amount) * 100;
});

// Check if the model exists before creating a new one
// This prevents the "OverwriteModelError: Cannot overwrite 'Quotation' model once compiled" error
module.exports = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);