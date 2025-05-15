// backend/routes/parties.js
const express = require('express');
const router = express.Router();
const {
  getAllParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty
} = require('../controllers/partyController');

// Routes
router.get('/', getAllParties);
router.get('/:id', getPartyById);
router.post('/', createParty);
router.put('/:id', updateParty);
router.delete('/:id', deleteParty);

module.exports = router;