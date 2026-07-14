/**
 * Shared utility functions for the recommendation engine.
 */

/**
 * Removes duplicates from an array of objects based on a specific key.
 * @param {Array} array 
 * @param {string} key 
 * @returns {Array} Unique array
 */
function uniqueBy(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

module.exports = {
  uniqueBy
};
