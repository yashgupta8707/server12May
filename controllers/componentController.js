// backend/controllers/componentController.js
const Component = require('../models/component');

// Helper function for consistent error handling
const handleError = (res, error, message) => {
  console.error(`Error: ${message}`, error);
  return res.status(500).json({ 
    message: message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// GET /api/components
const getAllComponents = async (req, res) => {
  try {
    const components = await Component.find();
    res.json({ PC_Components: components });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch components');
  }
};

// GET /api/components/:id
const getComponentById = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.json(component);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch component');
  }
};

// POST /api/components
const createComponent = async (req, res) => {
  try {
    const { category, brand, models } = req.body;
    
    if (!category || !brand || !models || !Array.isArray(models)) {
      return res.status(400).json({ 
        message: 'Invalid component data. Category, brand, and models array are required.'
      });
    }
    
    const newComponent = new Component({ category, brand, models });
    await newComponent.save();
    res.status(201).json(newComponent);
  } catch (error) {
    return handleError(res, error, 'Failed to create component');
  }
};

// PUT /api/components/:id
const updateComponent = async (req, res) => {
  try {
    const { category, brand, models } = req.body;
    
    if (!category || !brand || !models || !Array.isArray(models)) {
      return res.status(400).json({ 
        message: 'Invalid component data. Category, brand, and models array are required.'
      });
    }
    
    const updatedComponent = await Component.findByIdAndUpdate(
      req.params.id,
      { category, brand, models },
      { new: true, runValidators: true }
    );
    
    if (!updatedComponent) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    res.json(updatedComponent);
  } catch (error) {
    return handleError(res, error, 'Failed to update component');
  }
};

// DELETE /api/components/:id
const deleteComponent = async (req, res) => {
  try {
    const deletedComponent = await Component.findByIdAndDelete(req.params.id);
    
    if (!deletedComponent) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    res.json({ 
      message: 'Component deleted successfully',
      component: deletedComponent
    });
  } catch (error) {
    return handleError(res, error, 'Failed to delete component');
  }
};

module.exports = {
  getAllComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent
};