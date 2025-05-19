// backend/routes/quotations.js - Make sure this route is defined

const express = require('express');
const router = express.Router();
const {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  getQuotationsByParty,
  updateQuotation,
  deleteQuotation
} = require('../controllers/quotationController');

router.post('/', createQuotation);
router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.get('/party/:partyId', getQuotationsByParty); // This route is needed for party quotations
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);

// routes/quotationRoutes.js (continued)

// Create a revision of an existing quotation
router.post('/:id/revisions', auth, async (req, res) => {
  try {
    const originalQuotationId = req.params.id;
    
    // Find the original quotation
    const originalQuotation = await Quotation.findById(originalQuotationId);
    
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
    const partyId = originalQuotation.party_id?.toString() || '';
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
      items: originalQuotation.items,
      subtotal: originalQuotation.subtotal,
      tax_amount: originalQuotation.tax_amount,
      total_amount: originalQuotation.total_amount,
      notes: notes || originalQuotation.notes,
      terms: originalQuotation.terms,
      status: 'draft', // New revision always starts as draft
      created_by: req.user.id,
      revision_of: originalQuotationId,
      revision_number: revisionNumber
    });
    
    const savedRevision = await newQuotation.save();
    res.json(savedRevision);
  } catch (err) {
    console.error('Error creating revision:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all revisions of a quotation
router.get('/:id/revisions', auth, async (req, res) => {
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
    }).sort({ revision_number: 1, date: 1 });
    
    res.json(revisions);
  } catch (err) {
    console.error('Error fetching revisions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;