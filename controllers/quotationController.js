// backend/controllers/quotationController.js
const Quotation = require('../models/quotation');
const Party = require('../models/party');
const generateUniqueTitle = require('../utils/generateQuotationTitle');

// POST /api/quotations
const createQuotation = async (req, res) => {
  try {
    const {
      party_id,
      title,
      business_details,
      items,
      total_amount,
      total_purchase,
      total_tax,
      date,
      valid_until,
      notes,
      terms_conditions,
      status,
      createRevision,
      sourceQuotationId,
    } = req.body;

    if (!party_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Party ID and items are required.' });
    }

    const party = await Party.findById(party_id);
    if (!party) return res.status(404).json({ message: 'Party not found.' });

    const baseTitle = title || `Quote_${party_id}`;
    const uniqueTitle = await generateUniqueTitle(baseTitle);

    const quotationData = {
      party_id,
      title: uniqueTitle,
      business_details,
      items,
      total_amount,
      total_purchase,
      total_tax,
      date: date || new Date(),
      valid_until,
      notes,
      terms_conditions,
      status: status || 'draft',
    };

    if (createRevision && sourceQuotationId) {
      quotationData.revision_of = sourceQuotationId;
      const original = await Quotation.findById(sourceQuotationId);
      quotationData.revision_number = original?.revision_number + 1 || 1;
    }

    const newQuotation = new Quotation(quotationData);
    await newQuotation.save();

    res.status(201).json(newQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ message: 'Server error while saving quotation.' });
  }
};

// GET /api/quotations
const getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().populate('party_id');
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Failed to fetch quotations.' });
  }
};

// GET /api/quotations/:id
const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('party_id');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation by ID:', error);
    res.status(500).json({ message: 'Failed to fetch quotation.' });
  }
};

// GET /api/quotations/party/:partyId
const getQuotationsByParty = async (req, res) => {
  try {
    const quotations = await Quotation.find({ party_id: req.params.partyId }).sort({ date: -1 });
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations for party:', error);
    res.status(500).json({ message: 'Failed to fetch party quotations.' });
  }
};

module.exports = {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  getQuotationsByParty,
};
