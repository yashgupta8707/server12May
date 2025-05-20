// backend/controllers/quotationController.js
const Quotation = require('../models/quotation');
const Party = require('../models/party');

// Helper function for consistent error handling
const handleError = (res, error, message) => {
  console.error(`Error: ${message}`, error);
  return res.status(500).json({ 
    message: message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Helper function to transform quotation data for consistent frontend response
const transformQuotation = (quotation) => {
  if (!quotation) return null;
  
  const quotationObj = quotation.toObject ? quotation.toObject() : quotation;
  const totalPurchase = quotationObj.total_purchase || 0;
  const totalAmount = quotationObj.total_amount || 0;
  const margin = totalAmount - totalPurchase;
  
  return {
    ...quotationObj,
    // Ensure party data is available in both .party and .party_id for compatibility
    party: quotationObj.party_id,
    margin: margin,
    margin_percentage: totalAmount > 0 ? (margin / totalAmount) * 100 : 0
  };
};

// Generate a unique title if not provided
const generateUniqueTitle = async (baseTitle) => {
  const count = await Quotation.countDocuments({ title: new RegExp(`^${baseTitle}`, 'i') });
  return count > 0 ? `${baseTitle}_${count + 1}` : baseTitle;
};

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
    await savedQuotation.populate('party_id');
    
    res.status(201).json(transformQuotation(savedQuotation));
  } catch (error) {
    return handleError(res, error, 'Failed to create quotation');
  }
};

// Get all quotations with populated party data
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .sort({ date: -1 }) // Sort by date, newest first
      .populate('party_id');
    
    // Transform the data for frontend consistency
    const transformedQuotations = quotations.map(transformQuotation);
    
    res.json(transformedQuotations);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch quotations');
  }
};

// Get quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('party_id');
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json(transformQuotation(quotation));
  } catch (error) {
    return handleError(res, error, 'Failed to fetch quotation');
  }
};

// Get quotations by party
exports.getQuotationsByParty = async (req, res) => {
  try {
    const { partyId } = req.params;
    
    console.log(`Fetching quotations for party ID: ${partyId}`);
    
    // Find quotations for this party
    const quotations = await Quotation.find({ party_id: partyId }).populate('party_id');
    
    console.log(`Found ${quotations.length} quotations for party ID: ${partyId}`);
    
    // Transform for frontend consistency
    const transformedQuotations = quotations.map(transformQuotation);
    
    res.json(transformedQuotations);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch quotations by party');
  }
};

// Update a quotation
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('party_id');
    
    if (!updatedQuotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json(transformQuotation(updatedQuotation));
  } catch (error) {
    return handleError(res, error, 'Failed to update quotation');
  }
};

// Delete a quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // Remove authentication check since we don't have auth implemented
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ 
      message: 'Quotation removed successfully',
      quotation: transformQuotation(quotation)
    });
  } catch (error) {
    return handleError(res, error, 'Failed to delete quotation');
  }
};

// Create a revision of an existing quotation
exports.createQuotationRevision = async (req, res) => {
  try {
    const originalQuotationId = req.params.id;
    
    // Find the original quotation
    const originalQuotation = await Quotation.findById(originalQuotationId).populate('party_id');
    
    if (!originalQuotation) {
      return res.status(404).json({ message: 'Original quotation not found' });
    }
    
    // Determine the revision number
    let revisionNumber = 1;
    
    // If we already have a revision_number, increment it
    if (originalQuotation.revision_number) {
      revisionNumber = parseInt(originalQuotation.revision_number, 10) + 1;
    } 
    // Otherwise check if there's a version in the title with our format
    else if (originalQuotation.title) {
      const versionMatch = originalQuotation.title.match(/quote-.*?-(\d+)$/);
      if (versionMatch) {
        revisionNumber = parseInt(versionMatch[1], 10) + 1;
      }
    }
    
    // Generate the new quotation number in our format
    const partyId = originalQuotation.party_id?._id?.toString() || '';
    const shortPartyId = partyId.substring(0, 8);
    const newQuotationNumber = `quote-${shortPartyId}-${revisionNumber}`;
    
    // Custom fields from request body
    const { title, notes } = req.body;
    
    // Create a new quotation based on the original
    const newQuotation = new Quotation({
      party_id: originalQuotation.party_id,
      title: title || newQuotationNumber,
      quotation_number: newQuotationNumber,
      date: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      business_details: originalQuotation.business_details,
      items: originalQuotation.items,
      total_amount: originalQuotation.total_amount,
      total_purchase: originalQuotation.total_purchase,
      total_tax: originalQuotation.total_tax,
      notes: notes || originalQuotation.notes,
      terms_conditions: originalQuotation.terms_conditions,
      status: 'draft', // New revision always starts as draft
      revision_of: originalQuotationId,
      revision_number: revisionNumber
    });
    
    const savedRevision = await newQuotation.save();
    
    // Populate for response
    await savedRevision.populate('party_id');
    
    res.json(transformQuotation(savedRevision));
  } catch (error) {
    return handleError(res, error, 'Failed to create quotation revision');
  }
};

// Get all revisions of a quotation
exports.getQuotationRevisions = async (req, res) => {
  try {
    const originalId = req.params.id;
    
    // First, check if the quotation exists
    const quotation = await Quotation.findById(originalId);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    // If this is already a revision, find the original
    const rootId = quotation.revision_of || originalId;
    
    // Find all revisions related to this quotation
    const revisions = await Quotation.find({
      $or: [
        { _id: rootId },
        { revision_of: rootId }
      ]
    }).populate('party_id').sort({ revision_number: 1, date: 1 });
    
    // Transform for frontend consistency
    const transformedRevisions = revisions.map(transformQuotation);
    
    res.json(transformedRevisions);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch quotation revisions');
  }
};