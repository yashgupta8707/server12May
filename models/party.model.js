const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true // Add index for faster queries
  },
  name: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true // Remove leading/trailing whitespace
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  // Include virtual properties when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Instead of using mongoose-sequence which might be causing issues,
// let's implement our own auto-increment logic
partySchema.pre('save', async function(next) {
  if (this.isNew && !this.id) {
    try {
      // Find the highest ID in the collection
      const highestParty = await mongoose.model('Party').findOne().sort('-id');
      // Set the new ID to be highest + 1, or start at 1000 if no parties exist
      this.id = highestParty ? highestParty.id + 1 : 1000;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Add error handling for the model
partySchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Party ID must be unique'));
  } else {
    next(error);
  }
});

const Party = mongoose.model('Party', partySchema);

module.exports = Party;