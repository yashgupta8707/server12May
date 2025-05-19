// models/Quotation.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a schema for individual quotation items
const QuotationItemSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit_price: {
    type: Number,
    required: true
  },
  tax_rate: {
    type: Number,
    default: 18 // Default GST rate in percentage
  },
  tax_amount: Number,
  total: Number
});

// Define the main quotation schema
const QuotationSchema = new Schema({
  // Party/Customer reference
  party_id: {
    type: Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  
  // Quotation identifiers
  quotation_number: {
    type: String,
    required: true
  },
  title: String, // Optional title for the quotation
  
  // Dates
  date: {
    type: Date,
    default: Date.now
  },
  valid_until: {
    type: Date,
    required: true
  },
  
  // Revision tracking
  revision_of: {
    type: Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  revision_number: {
    type: Number,
    default: 1
  },
  
  // Quotation items
  items: [QuotationItemSchema],
  
  // Financial details
  subtotal: {
    type: Number,
    required: true
  },
  tax_amount: {
    type: Number,
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  
  // Additional information
  notes: String,
  terms: String,
  
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  
  // User references
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  last_updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to format quotation number if not already in the correct format
QuotationSchema.pre('save', async function(next) {
  // Only run this logic for new quotations that don't have a properly formatted number
  if (this.isNew && (!this.quotation_number || !this.quotation_number.startsWith('quote-'))) {
    try {
      // Get the party ID
      const partyId = this.party_id.toString();
      const shortPartyId = partyId.substring(0, 8);
      
      // Determine the version number
      let versionNumber = 1;
      
      // If this is a revision, use the revision number
      if (this.revision_number) {
        versionNumber = this.revision_number;
      } 
      // Otherwise check if there are existing quotations for this party
      else {
        const existingQuotations = await this.constructor.find({ party_id: this.party_id })
          .sort({ revision_number: -1 })
          .limit(1);
        
        if (existingQuotations.length > 0) {
          const latestQuotation = existingQuotations[0];
          
          // Check if it has a revision number
          if (latestQuotation.revision_number) {
            versionNumber = latestQuotation.revision_number + 1;
          } 
          // Or try to extract from title format
          else if (latestQuotation.title) {
            const versionMatch = latestQuotation.title.match(/quote-.*?-(\d+)$/);
            if (versionMatch) {
              versionNumber = parseInt(versionMatch[1], 10) + 1;
            }
          }
        }
      }
      
      // Format the quotation number
      const formattedNumber = `quote-${shortPartyId}-${versionNumber}`;
      this.quotation_number = formattedNumber;
      
      // Also set the title if it's not set
      if (!this.title) {
        this.title = formattedNumber;
      }
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Pre-save hook to calculate financial values
QuotationSchema.pre('save', function(next) {
  // Only recalculate if items have been modified
  if (this.isModified('items')) {
    // Calculate each item's tax and total
    this.items.forEach(item => {
      item.tax_amount = (item.unit_price * item.quantity * item.tax_rate) / 100;
      item.total = item.unit_price * item.quantity + item.tax_amount;
    });
    
    // Calculate quotation subtotal (sum of items before tax)
    this.subtotal = this.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    // Calculate total tax
    this.tax_amount = this.items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
    
    // Calculate total amount
    this.total_amount = this.subtotal + this.tax_amount;
  }
  
  next();
});

module.exports = mongoose.model('Quotation', QuotationSchema);