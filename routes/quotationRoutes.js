const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Party = require('../models/party.model');

// Debug middleware for quotation routes
router.use((req, res, next) => {
  console.log(`[Quotation API] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Get all quotations
router.get('/', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const quotations = await Quotation.find()
      .populate('party', 'id name phone address')
      .populate('revision_of', 'quotation_number title') // NEW: Populate revision reference
      .sort({ createdAt: -1 });
    
    console.log(`Retrieved ${quotations.length} quotations`);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quotations for a specific party
router.get('/party/:partyId', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    console.log(`Fetching quotations for party ID: ${req.params.partyId}`);
    const quotations = await Quotation.find({ party: req.params.partyId })
      .populate('party', 'id name phone address')
      .populate('revision_of', 'quotation_number title') // NEW: Populate revision reference
      .sort({ createdAt: -1 });
    
    console.log(`Retrieved ${quotations.length} quotations for party ${req.params.partyId}`);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching party quotations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific quotation
router.get('/:id', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    console.log(`Fetching quotation by ID: ${req.params.id}`);
    const quotation = await Quotation.findById(req.params.id)
      .populate('party', 'id name phone address')
      .populate('revision_of', 'quotation_number title'); // NEW: Populate revision reference
    
    if (!quotation) {
      console.log(`Quotation not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    console.log(`Retrieved quotation ${quotation._id}`);
    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new quotation
router.post('/', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    // Log the incoming request
    console.log('Creating new quotation with data:', JSON.stringify(req.body, null, 2));
    
    // Extract main data from request body
    const { 
      party_id,
      title,                // NEW: Added title field
      business_details,
      items,
      notes,
      terms_conditions,
      valid_until,
      status = 'draft',
      total_amount,
      total_purchase,
      total_tax,
      revision_number,      // NEW: Added revision tracking
      revision_of          // NEW: Added revision tracking
    } = req.body;
    
    // Validate required fields
    if (!party_id) {
      console.log('Missing party_id in request');
      return res.status(400).json({ message: 'Party ID is required' });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Missing or invalid items in request');
      return res.status(400).json({ message: 'At least one item is required' });
    }
    
    // Check if party exists
    const party = await Party.findById(party_id);
    if (!party) {
      console.log(`Party not found with ID: ${party_id}`);
      return res.status(404).json({ message: 'Party not found' });
    }
    
    // Validate items data
    for (const item of items) {
      if (!item.category || !item.brand || !item.model) {
        console.log('Invalid item data:', item);
        return res.status(400).json({ 
          message: 'Each item must have category, brand, and model' 
        });
      }
      
      // Ensure numeric values are valid
      if (isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
        console.log('Invalid quantity:', item.quantity);
        return res.status(400).json({ message: 'Quantity must be a positive number' });
      }
      
      if (isNaN(Number(item.purchase_with_gst)) || Number(item.purchase_with_gst) < 0) {
        console.log('Invalid purchase price:', item.purchase_with_gst);
        return res.status(400).json({ message: 'Purchase price must be a non-negative number' });
      }
      
      if (isNaN(Number(item.sale_with_gst)) || Number(item.sale_with_gst) < 0) {
        console.log('Invalid sale price:', item.sale_with_gst);
        return res.status(400).json({ message: 'Sale price must be a non-negative number' });
      }
    }
    
    // Create new quotation with validated data
    const newQuotation = new Quotation({
      party: party_id,
      title: title || `Quotation for ${party.name}`, // NEW: Set title using party name if not provided
      business_details: {
        name: business_details?.name || "EmpressPC",
        address: business_details?.address || "123 Tech Street, Lucknow, UP 226001",
        phone: business_details?.phone || "+91 9876543210",
        email: business_details?.email || "contact@empresspc.in",
        gstin: business_details?.gstin || "GSTIN1234567890",
        logo: business_details?.logo || "/logo.png"
      },
      items: items.map(item => ({
        category: item.category,
        brand: item.brand,
        model: item.model,
        hsn_sac: item.hsn_sac || '',
        warranty: item.warranty || '',
        quantity: Number(item.quantity) || 1,
        purchase_with_gst: Number(item.purchase_with_gst) || 0,
        sale_with_gst: Number(item.sale_with_gst) || 0,
        gst_percentage: Number(item.gst_percentage) || 18
      })),
      total_amount: Number(total_amount) || 0,
      total_purchase: Number(total_purchase) || 0,
      total_tax: Number(total_tax) || 0,
      notes: notes || '',
      terms_conditions: terms_conditions || '',
      valid_until: valid_until ? new Date(valid_until) : null,
      status: status || 'draft',
      // NEW: Add revision tracking fields if provided
      revision_number: revision_number || 0,
      revision_of: revision_of || null
    });
    
    const savedQuotation = await newQuotation.save();
    console.log(`Quotation created with ID: ${savedQuotation._id}`);
    
    // Return the newly created quotation with the party details
    const populatedQuotation = await Quotation.findById(savedQuotation._id)
      .populate('party', 'id name phone address')
      .populate('revision_of', 'quotation_number title'); // NEW: Populate revision reference
    
    res.status(201).json(populatedQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// Update a quotation
router.put('/:id', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    console.log(`Updating quotation ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const { 
      party_id,
      title,                // NEW: Added title field
      business_details,
      items,
      notes,
      terms_conditions,
      valid_until,
      status,
      total_amount,
      total_purchase,
      total_tax,
      revision_number,      // NEW: Added revision tracking
      revision_of          // NEW: Added revision tracking
    } = req.body;
    
    // Find the quotation
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      console.log(`Quotation not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Check if party exists if party_id is provided
    if (party_id && party_id !== quotation.party.toString()) {
      const party = await Party.findById(party_id);
      if (!party) {
        console.log(`Party not found with ID: ${party_id}`);
        return res.status(404).json({ message: 'Party not found' });
      }
      quotation.party = party_id;
    }
    
    // Update fields if provided
    if (title) quotation.title = title; // NEW: Update title
    if (business_details) quotation.business_details = business_details;
    if (notes !== undefined) quotation.notes = notes;
    if (terms_conditions !== undefined) quotation.terms_conditions = terms_conditions;
    if (valid_until) quotation.valid_until = new Date(valid_until);
    if (status) quotation.status = status;
    
    // NEW: Update revision tracking fields if provided
    if (revision_number !== undefined) quotation.revision_number = revision_number;
    if (revision_of !== undefined) quotation.revision_of = revision_of;
    
    // Update items and recalculate totals if provided
    if (items && Array.isArray(items)) {
      // Validate items
      for (const item of items) {
        if (!item.category || !item.brand || !item.model) {
          console.log('Invalid item data:', item);
          return res.status(400).json({ 
            message: 'Each item must have category, brand, and model' 
          });
        }
      }
      
      quotation.items = items.map(item => ({
        category: item.category,
        brand: item.brand,
        model: item.model,
        hsn_sac: item.hsn_sac || '',
        warranty: item.warranty || '',
        quantity: Number(item.quantity) || 1,
        purchase_with_gst: Number(item.purchase_with_gst) || 0,
        sale_with_gst: Number(item.sale_with_gst) || 0,
        gst_percentage: Number(item.gst_percentage) || 18
      }));
      
      // Update totals if provided, otherwise use the existing values
      quotation.total_amount = Number(total_amount) || quotation.total_amount;
      quotation.total_purchase = Number(total_purchase) || quotation.total_purchase;
      quotation.total_tax = Number(total_tax) || quotation.total_tax;
    }
    
    const updatedQuotation = await quotation.save();
    console.log(`Quotation ${updatedQuotation._id} updated successfully`);
    
    // Return the updated quotation with the party details
    const populatedQuotation = await Quotation.findById(updatedQuotation._id)
      .populate('party', 'id name phone address')
      .populate('revision_of', 'quotation_number title'); // NEW: Populate revision reference
    
    res.json(populatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// Delete a quotation
router.delete('/:id', async (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    console.log(`Deleting quotation: ${req.params.id}`);
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      console.log(`Quotation not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    console.log(`Quotation ${req.params.id} deleted successfully`);
    res.json({ message: 'Quotation deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;