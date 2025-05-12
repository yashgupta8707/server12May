const express = require('express');
const router = express.Router();

// Mock data for PC components based on your provided JSON
const pcComponents = {
  "PC_Components": [
    {
      "category": "Processor",
      "brand": "Intel",
      "models": [
        {
          "model": "Core i5-12400F",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 16000,
          "sale_with_GST": 18500
        },
        {
          "model": "Core i7-12700K",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 28000,
          "sale_with_GST": 31500
        },
        {
          "model": "Core i9-13900K",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 50000,
          "sale_with_GST": 56500
        }
      ]
    },
    {
      "category": "Graphics Card",
      "brand": "NVIDIA",
      "models": [
        {
          "model": "RTX 3060",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 30000,
          "sale_with_GST": 34000
        },
        {
          "model": "RTX 4070",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 55000,
          "sale_with_GST": 61000
        },
        {
          "model": "RTX 4090",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 140000,
          "sale_with_GST": 152000
        }
      ]
    },
    {
      "category": "Motherboard",
      "brand": "ASUS",
      "models": [
        {
          "model": "ROG Strix B660-F",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 17500,
          "sale_with_GST": 19500
        },
        {
          "model": "TUF Gaming X670E",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 29500,
          "sale_with_GST": 32500
        },
        {
          "model": "PRIME Z790-P",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 21500,
          "sale_with_GST": 23800
        }
      ]
    },
    {
      "category": "RAM",
      "brand": "Corsair",
      "models": [
        {
          "model": "Vengeance LPX 16GB DDR4",
          "HSN/SAC": "84733092",
          "warranty": "10 Years",
          "purchase_with_GST": 4000,
          "sale_with_GST": 4600
        },
        {
          "model": "Vengeance RGB Pro 32GB DDR4",
          "HSN/SAC": "84733092",
          "warranty": "10 Years",
          "purchase_with_GST": 8200,
          "sale_with_GST": 9100
        },
        {
          "model": "Dominator Platinum RGB 32GB DDR5",
          "HSN/SAC": "84733092",
          "warranty": "10 Years",
          "purchase_with_GST": 15500,
          "sale_with_GST": 17200
        }
      ]
    },
    {
      "category": "SSD",
      "brand": "Samsung",
      "models": [
        {
          "model": "970 EVO Plus 500GB NVMe",
          "HSN/SAC": "84717020",
          "warranty": "5 Years",
          "purchase_with_GST": 3300,
          "sale_with_GST": 3900
        },
        {
          "model": "980 PRO 1TB NVMe",
          "HSN/SAC": "84717020",
          "warranty": "5 Years",
          "purchase_with_GST": 7500,
          "sale_with_GST": 8500
        },
        {
          "model": "990 PRO 2TB NVMe",
          "HSN/SAC": "84717020",
          "warranty": "5 Years",
          "purchase_with_GST": 15800,
          "sale_with_GST": 17400
        }
      ]
    },
    {
      "category": "Power Supply",
      "brand": "Cooler Master",
      "models": [
        {
          "model": "MWE 550 Bronze V2",
          "HSN/SAC": "85044010",
          "warranty": "5 Years",
          "purchase_with_GST": 3300,
          "sale_with_GST": 3800
        },
        {
          "model": "MWE 750 White V2",
          "HSN/SAC": "85044010",
          "warranty": "5 Years",
          "purchase_with_GST": 4300,
          "sale_with_GST": 4900
        },
        {
          "model": "V850 Gold V2 Full Modular",
          "HSN/SAC": "85044010",
          "warranty": "10 Years",
          "purchase_with_GST": 9900,
          "sale_with_GST": 10800
        }
      ]
    },
    {
      "category": "Cabinet",
      "brand": "NZXT",
      "models": [
        {
          "model": "H510",
          "HSN/SAC": "84733099",
          "warranty": "2 Years",
          "purchase_with_GST": 5200,
          "sale_with_GST": 5900
        },
        {
          "model": "H7 Flow RGB",
          "HSN/SAC": "84733099",
          "warranty": "2 Years",
          "purchase_with_GST": 8800,
          "sale_with_GST": 9800
        },
        {
          "model": "H9 Elite",
          "HSN/SAC": "84733099",
          "warranty": "2 Years",
          "purchase_with_GST": 13200,
          "sale_with_GST": 14500
        }
      ]
    }
  ]
};

// Get all PC components
router.get('/', (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    res.json(pcComponents);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get components by category
router.get('/category/:category', (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const { category } = req.params;
    const components = pcComponents.PC_Components.filter(
      comp => comp.category.toLowerCase() === category.toLowerCase()
    );
    
    if (components.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ PC_Components: components });
  } catch (error) {
    console.error('Error fetching components by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get components by brand
router.get('/brand/:brand', (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const { brand } = req.params;
    const components = pcComponents.PC_Components.filter(
      comp => comp.brand.toLowerCase() === brand.toLowerCase()
    );
    
    if (components.length === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    res.json({ PC_Components: components });
  } catch (error) {
    console.error('Error fetching components by brand:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search components
router.get('/search', (req, res) => {
  try {
    // Set the content type explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = query.toLowerCase();
    
    // Search through components
    const results = pcComponents.PC_Components.filter(component => {
      // Check if category or brand matches
      if (
        component.category.toLowerCase().includes(searchTerm) ||
        component.brand.toLowerCase().includes(searchTerm)
      ) {
        return true;
      }
      
      // Check if any model matches
      return component.models.some(model => 
        model.model.toLowerCase().includes(searchTerm)
      );
    });
    
    res.json({ PC_Components: results });
  } catch (error) {
    console.error('Error searching components:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;