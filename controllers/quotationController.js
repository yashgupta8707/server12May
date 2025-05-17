// backend/controllers/quotationController.js
const Quotation = require('../models/quotation');
const Party = require('../models/party');
const generateUniqueTitle = require('../utils/generateQuotationTitle');

// POST /api/quotations
const createQuotation = async (req, res) => {
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
const getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().populate('party_id');
    
    // Transform the data to match the frontend expectations
    const transformedQuotations = quotations.map(quotation => {
      const quotationObj = quotation.toObject();
      
      // Calculate margin
      const totalPurchase = quotationObj.total_purchase || 0;
      const totalAmount = quotationObj.total_amount || 0;
      const margin = totalAmount - totalPurchase;
      
      // Rename party_id to party for frontend compatibility
      return {
        ...quotationObj,
        party: quotationObj.party_id, // This will be the populated party object
        party_id: quotationObj.party_id?._id, // Keep original ID separately
        margin: margin,
        margin_percentage: totalAmount > 0 ? (margin / totalAmount) * 100 : 0
      };
    });
    
    res.json(transformedQuotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Failed to fetch quotations', error: error.message });
  }
};

// Get quotation by ID
const getQuotationById = async (req, res) => {
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
    
    const quotations = await Quotation.find({ party_id: partyId }).populate('party_id');
    
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
module.exports = {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  getQuotationsByParty,
};
