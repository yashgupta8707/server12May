// backend/controllers/quotationController.js - Complete implementation

const Quotation = require('../models/Quotation');
const Party = require('../models/party');
const generateUniqueTitle = require('../utils/generateQuotationTitle');

// Create a new quotation
exports.createQuotation = async (req, res) => {
  try {
    const { party_id, ...quotationData } = req.body;
    
    // Verify that the party exists
    const party = await Party.findById(party_id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    // Generate a unique title if not provided
    if (!quotationData.title) {
      const baseTitle = `${party.name}_Quotation`;
      quotationData.title = await generateUniqueTitle(baseTitle);
    }
    
    const newQuotation = new Quotation({
      party_id,
      ...quotationData
    });
    
    const savedQuotation = await newQuotation.save();
    
    // Populate the party information for the response
    const populatedQuotation = await Quotation.findById(savedQuotation._id);
    await populatedQuotation.populate('party_id');
    
    res.status(201).json(populatedQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ message: 'Failed to create quotation', error: error.message });
  }
};

// Get all quotations with populated party data
exports.getAllQuotations = async (req, res) => {
   try {
    const quotations = await Quotation.find()
      .sort({ date: -1 }) // Sort by date, newest first
      .populate('items.component', 'category brand')
      .populate('customer', 'name email phone address');
    
    // Transform the data to make it easier to work with in the frontend
    const transformedQuotations = quotations.map(quotation => {
      return {
        _id: quotation._id,
        quotationNumber: quotation.quotationNumber,
        date: quotation.date,
        customerName: quotation.customer?.name || quotation.customerName,
        customerEmail: quotation.customer?.email || quotation.customerEmail,
        customerPhone: quotation.customer?.phone || quotation.customerPhone,
        totalAmount: quotation.totalAmount,
        status: quotation.status,
        validUntil: quotation.validUntil,
        items: quotation.items,
        notes: quotation.notes
      };
    });
    
    res.json(transformedQuotations);
  } catch (err) {
    console.error('Error fetching quotations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('party_id');
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Transform to match frontend expectations
    const quotationObj = quotation.toObject();
    const totalPurchase = quotationObj.total_purchase || 0;
    const totalAmount = quotationObj.total_amount || 0;
    const margin = totalAmount - totalPurchase;
    
    const transformed = {
      ...quotationObj,
      party: quotationObj.party_id,
      party_id: quotationObj.party_id?._id,
      margin: margin,
      margin_percentage: totalAmount > 0 ? (margin / totalAmount) * 100 : 0
    };
    
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ message: 'Failed to fetch quotation', error: error.message });
  }
};

// Get quotations by party
exports.getQuotationsByParty = async (req, res) => {
  try {
    const { partyId } = req.params;
    
    // Log incoming request for debugging
    console.log(`Fetching quotations for party ID: ${partyId}`);
    
    // Find quotations for this party
    const quotations = await Quotation.find({ party_id: partyId }).populate('party_id');
    
    console.log(`Found ${quotations.length} quotations for party ID: ${partyId}`);
    
    // Transform to match frontend expectations
    const transformedQuotations = quotations.map(quotation => {
      const quotationObj = quotation.toObject();
      const totalPurchase = quotationObj.total_purchase || 0;
      const totalAmount = quotationObj.total_amount || 0;
      const margin = totalAmount - totalPurchase;
      
      return {
        ...quotationObj,
        party: quotationObj.party_id,
        party_id: quotationObj.party_id?._id,
        margin: margin,
        margin_percentage: totalAmount > 0 ? (margin / totalAmount) * 100 : 0
      };
    });
    
    res.json(transformedQuotations);
  } catch (error) {
    console.error('Error fetching quotations by party:', error);
    res.status(500).json({ message: 'Failed to fetch quotations by party', error: error.message });
  }
};

// Update a quotation
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('party_id');
    
    if (!updatedQuotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Transform for response
    const quotationObj = updatedQuotation.toObject();
    const totalPurchase = quotationObj.total_purchase || 0;
    const totalAmount = quotationObj.total_amount || 0;
    const margin = totalAmount - totalPurchase;
    
    const transformed = {
      ...quotationObj,
      party: quotationObj.party_id,
      party_id: quotationObj.party_id?._id,
      margin: margin,
      margin_percentage: totalAmount > 0 ? (margin / totalAmount) * 100 : 0
    };
    
    res.json(transformed);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ message: 'Failed to update quotation', error: error.message });
  }
};

// Delete a quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Check if the user is authorized
    if (quotation.created_by.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this quotation' });
    }
    
    await quotation.remove();
    res.json({ message: 'Quotation removed' });
  } catch (err) {
    console.error('Error deleting quotation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};