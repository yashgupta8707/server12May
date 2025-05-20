// backend/utils/generateQuotationTitle.js
const Quotation = require('../models/quotation');

/**
 * Generates a unique quotation title by appending a number if necessary
 * @param {string} baseTitle - The base title to use
 * @returns {Promise<string>} - A unique title
 */
async function generateUniqueTitle(baseTitle) {
  // Count existing quotations with similar title
  const count = await Quotation.countDocuments({
    title: new RegExp(`^${baseTitle}`, 'i')  // Case-insensitive match at start of string
  });
  
  // If no similar titles exist, use the base title
  if (count === 0) {
    return baseTitle;
  }
  
  // Otherwise, append a number
  return `${baseTitle}_${count + 1}`;
}

module.exports = generateUniqueTitle;