/**
 * Normalize price from API response
 * Handles formats like "Rp 88,000" or number
 * @param {string|number} priceValue - Price value from API
 * @returns {number} Normalized price as number
 */
export const normalizePrice = (priceValue) => {
  if (!priceValue && priceValue !== 0) return 0;
  
  if (typeof priceValue === 'string') {
    // Remove "Rp", spaces, and commas, then parse
    const cleanPrice = priceValue.replace(/[^\d]/g, '');
    return parseFloat(cleanPrice) || 0;
  }
  
  return Number(priceValue) || 0;
};

/**
 * Format price for display in Rupiah
 * @param {string|number} priceValue - Price value
 * @returns {string} Formatted price string (e.g., "88,000")
 */
export const formatPrice = (priceValue) => {
  const numPrice = normalizePrice(priceValue);
  if (isNaN(numPrice)) return '0';
  return numPrice.toLocaleString('id-ID');
};

/**
 * Extract price from book object
 * Checks details.price, price, or cost fields
 * @param {object} book - Book object
 * @returns {number} Normalized price
 */
export const extractBookPrice = (book) => {
  if (!book) return 0;
  
  if (book.details?.price) {
    return normalizePrice(book.details.price);
  }
  
  if (book.price !== undefined && book.price !== null) {
    return normalizePrice(book.price);
  }
  
  if (book.cost !== undefined) {
    return normalizePrice(book.cost);
  }
  
  return 0;
};

