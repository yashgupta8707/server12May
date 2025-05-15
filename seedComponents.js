// backend/seedComponents.js
const mongoose = require('mongoose');
const Component = require('./models/component');
require('dotenv').config();

const components = [
  {
    category: 'Processor',
    brand: 'Intel',
    models: [
      {
        model: 'Core i5-12400F',
        HSN_SAC: '84733099',
        warranty: '3 Years',
        purchase_with_GST: 16000,
        sale_with_GST: 18500,
      },
      {
        model: 'Core i7-12700K',
        HSN_SAC: '84733099',
        warranty: '3 Years',
        purchase_with_GST: 28000,
        sale_with_GST: 31500,
      },
      {
        model: 'Core i9-13900K',
        HSN_SAC: '84733099',
        warranty: '3 Years',
        purchase_with_GST: 50000,
        sale_with_GST: 56500,
      },
    ],
  },
  {
    category: 'Graphics Card',
    brand: 'NVIDIA',
    models: [
      {
        model: 'RTX 3060',
        HSN_SAC: '84733099',
        warranty: '3 Years',
        purchase_with_GST: 30000,
        sale_with_GST: 34000,
      },
      {
        model: 'RTX 4070',
        HSN_SAC: '84733099',
        warranty: '3 Years',
        purchase_with_GST: 55000,
        sale_with_GST: 61000,
      },
      {
        model: 'RTX 4090',
        HSN_SAC: '84733099',
        warranty: '3 Years',
        purchase_with_GST: 140000,
        sale_with_GST: 152000,
      },
    ],
  },
  // Add more categories from your mockComponentsData if needed...
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Component.deleteMany();
    console.log('🗑️ Old components cleared');

    await Component.insertMany(components);
    console.log('🌱 Components seeded successfully!');

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
