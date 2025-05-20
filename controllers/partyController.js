// backend/controllers/partyController.js
const Party = require("../models/party");

// Helper function for consistent error handling
const handleError = (res, error, message) => {
  console.error(`Error: ${message}`, error);
  return res.status(500).json({ 
    message: message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// GET /api/parties
const getAllParties = async (req, res) => {
  try {
    const parties = await Party.find().sort({ createdAt: -1 });
    res.json(parties);
  } catch (error) {
    return handleError(res, error, "Failed to fetch parties");
  }
};

// GET /api/parties/:id
const getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ message: "Party not found" });
    res.json(party);
  } catch (error) {
    return handleError(res, error, "Failed to fetch party");
  }
};

// POST /api/parties
const createParty = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.phone) {
      return res.status(400).json({ 
        message: "Name and phone are required fields" 
      });
    }
    
    // Generate the next party ID
    const latest = await Party.findOne().sort({ createdAt: -1 });
    let nextId = "P001"; // Default to P001 if no parties exist
    
    if (latest && latest.partyId) {
      // Extract the numeric part and increment
      const match = latest.partyId.match(/P(\d+)$/);
      if (match && match[1]) {
        const currentNumber = parseInt(match[1], 10);
        if (!isNaN(currentNumber)) {
          const nextNumber = currentNumber + 1;
          nextId = `P${nextNumber.toString().padStart(3, "0")}`;
        }
      }
    }
    
    console.log("Creating new party with ID:", nextId);
    
    // Create new party document
    const newParty = new Party({
      partyId: nextId,
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address || "",
      email: req.body.email || ""
    });
    
    // Save to database
    const savedParty = await newParty.save();
    console.log("Party created successfully:", savedParty);
    res.status(201).json(savedParty);
    
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A party with this ID already exists",
        error: error.message
      });
    }
    
    return handleError(res, error, "Failed to create party");
  }
};

// PUT /api/parties/:id
const updateParty = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.phone) {
      return res.status(400).json({ message: "Name and phone are required fields" });
    }
    
    const updatedParty = await Party.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address || "",
        email: req.body.email || "",
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedParty) {
      return res.status(404).json({ message: "Party not found" });
    }
    
    res.json(updatedParty);
  } catch (error) {
    return handleError(res, error, "Failed to update party");
  }
};

// DELETE /api/parties/:id
const deleteParty = async (req, res) => {
  try {
    const deletedParty = await Party.findByIdAndDelete(req.params.id);
    
    if (!deletedParty) {
      return res.status(404).json({ message: "Party not found" });
    }
    
    res.json({ message: "Party deleted successfully", party: deletedParty });
  } catch (error) {
    return handleError(res, error, "Failed to delete party");
  }
};

module.exports = {
  getAllParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty
};