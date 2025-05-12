const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true 
  },
  brand: { 
    type: String, 
    required: true 
  },
  model: { 
    type: String, 
    required: true 
  },
  hsn_sac: { 
    type: String, 
    required: true 
  },
  warranty: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 1,
    min: 1 
  },
  purchase_with_gst: { 
    type: Number, 
    required: true 
  },
  sale_with_gst: { 
    type: Number, 
    required: true 
  },
  gst_percentage: { 
    type: Number, 
    required: true, 
    default: 18 
  }
});

const quotationSchema = new mongoose.Schema({
  quotation_number: {
    type: String,
    unique: true
  },
  // NEW: Title for the quotation (helps identify revisions)
  title: {
    type: String
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  valid_until: {
    type: Date
  },
  // Reference to Party model
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  // Business details
  business_details: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    gstin: { type: String },
    logo: { type: String } // URL to logo image
  },
  // Customer details included from party reference
  items: [quotationItemSchema],
  // Calculated totals
  total_amount: { type: Number, required: true },
  total_purchase: { type: Number, required: true },
  total_tax: { type: Number, required: true },
  // Additional fields
  notes: { type: String },
  terms_conditions: { type: String },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  // NEW: Revision tracking fields
  revision_number: {
    type: Number,
    default: 0
  },
  revision_of: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties for calculated fields
quotationSchema.virtual('total_purchase_without_gst').get(function() {
  return this.items.reduce((sum, item) => {
    const withoutGst = item.purchase_with_gst / (1 + (item.gst_percentage / 100));
    return sum + (withoutGst * item.quantity);
  }, 0);
});

quotationSchema.virtual('total_sale_without_gst').get(function() {
  return this.items.reduce((sum, item) => {
    const withoutGst = item.sale_with_gst / (1 + (item.gst_percentage / 100));
    return sum + (withoutGst * item.quantity);
  }, 0);
});

quotationSchema.virtual('total_purchase_with_gst').get(function() {
  return this.items.reduce((sum, item) => sum + (item.purchase_with_gst * item.quantity), 0);
});

quotationSchema.virtual('total_sale_with_gst').get(function() {
  return this.items.reduce((sum, item) => sum + (item.sale_with_gst * item.quantity), 0);
});

quotationSchema.virtual('total_margin').get(function() {
  return this.total_sale_with_gst - this.total_purchase_with_gst;
});

quotationSchema.virtual('margin_percentage').get(function() {
  if (this.total_sale_with_gst === 0) return 0;
  return (this.total_margin / this.total_sale_with_gst) * 100;
});

// Pre-save hook to generate quotation number if not provided
quotationSchema.pre('save', async function(next) {
  if (!this.quotation_number) {
    try {
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      
      // Find the highest quotation number with the same year/month prefix
      const prefix = `QT${year}${month}-`;
      const lastQuotation = await this.constructor.findOne(
        { quotation_number: new RegExp(`^${prefix}`) },
        { quotation_number: 1 },
        { sort: { quotation_number: -1 } }
      );
      
      let nextNumber = 1;
      if (lastQuotation) {
        const lastNumber = parseInt(lastQuotation.quotation_number.split('-')[1], 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      
      this.quotation_number = `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // NEW: Generate title if none provided
  if (!this.title && this.party) {
    try {
      // Look up the party name to use in the title
      const Party = mongoose.model('Party');
      const party = await Party.findById(this.party);
      if (party) {
        this.title = `Quotation for ${party.name}`;
      }
    } catch (error) {
      // Continue even if title generation fails
      console.error('Error generating quotation title:', error);
    }
  }
  
  next();
});

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;