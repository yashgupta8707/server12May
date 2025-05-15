// backend/routes/quotations.js
const express = require('express');
const router = express.Router();
const {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  getQuotationsByParty,
} = require('../controllers/quotationController');

router.post('/', createQuotation);
router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.get('/party/:partyId', getQuotationsByParty);

module.exports = router;
