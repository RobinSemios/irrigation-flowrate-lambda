'use strict';

/**
 * function to flatten array of objects
 */
const flatten = (a) => (Array.isArray(a) ? [].concat(...a.map(flatten)) : a);

module.exports = flatten;
