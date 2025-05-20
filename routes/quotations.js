// backend/routes/quotations.js
const express = require('express');
const router = express.Router();
const {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  getQuotationsByParty,
  updateQuotation,
  deleteQuotation,
  createQuotationRevision,
  getQuotationRevisions
} = require('../controllers/quotationController');

// GET /api/quotations - Get all quotations
router.get('/', getAllQuotations);

// GET /api/quotations/:id - Get quotation by ID
router.get('/:id', getQuotationById);

// GET /api/quotations/party/:partyId - Get quotations by party ID
router.get('/party/:partyId', getQuotationsByParty);

// POST /api/quotations - Create a new quotation
router.post('/', createQuotation);

// PUT /api/quotations/:id - Update a quotation
router.put('/:id', updateQuotation);

// DELETE /api/quotations/:id - Delete a quotation
router.delete('/:id', deleteQuotation);

// POST /api/quotations/:id/revisions - Create a revision of a quotation
router.post('/:id/revisions', createQuotationRevision);

// GET /api/quotations/:id/revisions - Get all revisions of a quotation
router.get('/:id/revisions', getQuotationRevisions);

module.exports = router;