const express = require('express');
const router = express.Router();
const Party = require('../models/party.model');

// Get all parties
router.get('/', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const parties = await Party.find().sort({ id: 1 });
    // Always return an array, even if empty
    res.json(parties || []);
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get party by ID
router.get('/:id', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    res.json(party);
  } catch (error) {
    console.error('Error fetching party:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new party
router.post('/', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const { name, phone, address } = req.body;
    
    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required fields' });
    }
    
    // Create new party
    const newParty = new Party({
      name,
      phone,
      address
    });
    
    const savedParty = await newParty.save();
    res.status(201).json(savedParty);
  } catch (error) {
    console.error('Error creating party:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// Update party
router.put('/:id', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const { name, phone, address, id } = req.body;
    
    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required fields' });
    }
    
    // Find the party by MongoDB ID
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    // Update party details
    party.name = name;
    party.phone = phone;
    party.address = address;
    
    // If ID is being changed, update it
    if (id !== undefined && id !== party.id) {
      // Check if ID is already in use
      const existingParty = await Party.findOne({ id });
      if (existingParty && existingParty._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'ID already in use by another party' });
      }
      party.id = id;
    }
    
    const updatedParty = await party.save();
    res.json(updatedParty);
  } catch (error) {
    console.error('Error updating party:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// Delete party
router.delete('/:id', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    res.json({ message: 'Party deleted successfully' });
  } catch (error) {
    console.error('Error deleting party:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;