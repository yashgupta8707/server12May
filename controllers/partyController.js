// backend/controllers/partyController.js
const Party = require("../models/party");

// GET /api/parties
const getAllParties = async (req, res) => {
  try {
    const parties = await Party.find().sort({ createdAt: -1 });
    res.json(parties);
  } catch (error) {
    console.error("Error fetching parties:", error);
    res.status(500).json({ message: "Failed to fetch parties." });
  }
};

// GET /api/parties/:id
const getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ message: "Party not found" });
    res.json(party);
  } catch (error) {
    console.error("Error fetching party by ID:", error);
    res.status(500).json({ message: "Failed to fetch party." });
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
    
    // Generate the next party ID - Using 'P' format as shown in screenshots
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
    });
    
    // Save to database
    const savedParty = await newParty.save();
    console.log("Party created successfully:", savedParty);
    res.status(201).json(savedParty);
    
  } catch (error) {
    console.error("Error creating party:", error);
    // Send detailed error for debugging
    res.status(500).json({ 
      message: "Failed to create party",
      error: error.message,
      code: error.code,
      name: error.name,
      keyPattern: error.keyPattern || undefined,
      keyValue: error.keyValue || undefined
    });
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
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedParty) {
      return res.status(404).json({ message: "Party not found" });
    }
    
    res.json(updatedParty);
  } catch (error) {
    console.error("Error updating party:", error);
    res.status(500).json({ 
      message: "Failed to update party",
      error: error.message
    });
  }
};

// DELETE /api/parties/:id
const deleteParty = async (req, res) => {
  try {
    const deletedParty = await Party.findByIdAndDelete(req.params.id);
    
    if (!deletedParty) {
      return res.status(404).json({ message: "Party not found" });
    }
    
    res.json({ message: "Party deleted successfully" });
  } catch (error) {
    console.error("Error deleting party:", error);
    res.status(500).json({ message: "Failed to delete party" });
  }
};

module.exports = {
  getAllParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty
};