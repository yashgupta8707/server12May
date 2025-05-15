// backend/controllers/componentController.js
const Component = require('../models/component');

// GET /api/components
const getAllComponents = async (req, res) => {
  try {
    const components = await Component.find();
    res.json({ PC_Components: components });
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ message: 'Failed to fetch components.' });
  }
};

// POST /api/components (for adding mock/test data)
const createComponent = async (req, res) => {
  try {
    const { category, brand, models } = req.body;
    const newComponent = new Component({ category, brand, models });
    await newComponent.save();
    res.status(201).json(newComponent);
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ message: 'Failed to create component.' });
  }
};

module.exports = {
  getAllComponents,
  createComponent,
};
