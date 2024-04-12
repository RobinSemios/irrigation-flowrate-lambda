'use strict';

/**
 * function to group the array into object by key
 */
const groupBy = (items, key) => items
  .reduce((a, b) => {
    a[b[key]] = a[b[key]] || [];

    a[b[key]].push(b);

    return a;
  }, {});

module.exports = groupBy;
