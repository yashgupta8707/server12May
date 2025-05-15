// backend/models/Quotation.js
const mongoose = require('mongoose');

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
    title: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    valid_until: { type: Date },
    business_details: {
      name: String,
      address: String,
      phone: String,
      email: String,
      gstin: String,
      logo: String,
    },
    items: [itemSchema],
    total_amount: Number,
    total_purchase: Number,
    total_tax: Number,
    notes: String,
    terms_conditions: String,
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
      default: 'draft',
    },
    revision_number: { type: Number, default: 0 },
    revision_of: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quotation', quotationSchema);
