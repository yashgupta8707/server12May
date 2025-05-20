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

// GET /api/parties - Get all parties
router.get('/', getAllParties);

// GET /api/parties/:id - Get party by ID
router.get('/:id', getPartyById);

// POST /api/parties - Create a new party
router.post('/', createParty);

// PUT /api/parties/:id - Update a party
router.put('/:id', updateParty);

// DELETE /api/parties/:id - Delete a party
router.delete('/:id', deleteParty);

module.exports = router;