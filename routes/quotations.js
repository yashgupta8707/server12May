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

module.exports = router;