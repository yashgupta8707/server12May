// backend/utils/generateQuotationTitle.js
const Quotation = require('../models/quotation');

// Generate next available title with versioning
const generateUniqueTitle = async (baseTitle) => {
  const existing = await Quotation.find({ title: new RegExp(`^${baseTitle}(_v\\d+)?$`) });

  if (existing.length === 0) return baseTitle;

  let maxVersion = 0;
  existing.forEach((quote) => {
    const match = quote.title.match(/_v(\d+)$/);
    if (match) {
      const version = parseInt(match[1]);
      if (version > maxVersion) maxVersion = version;
    }
  });

  return `${baseTitle}_v${maxVersion + 1}`;
};

module.exports = generateUniqueTitle;
