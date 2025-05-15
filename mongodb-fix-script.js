// simpler-mongodb-fix.js
// A simplified script to fix the MongoDB index issue

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quotev2';
console.log('Connecting to MongoDB:', MONGO_URI);

// Create a schema that matches your collection
const partySchema = new mongoose.Schema({
  partyId: String,
  name: String,
  phone: String,
  address: String
});

// Fix the id index by making it sparse
partySchema.index({ id: 1 }, { unique: true, sparse: true });

// Create the model
const Party = mongoose.model('Party', partySchema);

async function fixDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get raw collection to work with indexes directly
    const collection = mongoose.connection.collection('parties');
    
    // Check for existing indexes
    console.log('Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Look for the problematic index
    const problematicIndex = indexes.find(idx => idx.name === 'id_1');
    
    if (problematicIndex) {
      console.log('Found problematic index, dropping it...');
      await collection.dropIndex('id_1');
      console.log('Index dropped successfully');
    } else {
      console.log('No problematic index found, nothing to drop');
    }
    
    // Create new sparse index
    console.log('Creating new sparse index...');
    await collection.createIndex(
      { id: 1 },
      { unique: true, sparse: true, name: 'id_1_sparse' }
    );
    console.log('New sparse index created');
    
    // Verify the fix
    const updatedIndexes = await collection.indexes();
    console.log('Updated indexes:', updatedIndexes);
    
    console.log('Database fix completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the fix
fixDatabase();