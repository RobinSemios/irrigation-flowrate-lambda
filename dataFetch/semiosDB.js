'use strict';

const { pool } = require('../util/pg');
const sql = require('../sql');

// eslint-disable-next-line no-unused-vars
const semiosDB = async (event, context) => {
  let client;
  try {
    client = await pool.connect();
  } catch (error) {
    console.error({
      issue: 'Issue connecting to pool',
      error,
    });
    return 'Issue connecting to pool';
  }
  /*

    Obtain readings

  */

    let irrigationZonesInfo;
    const uniqueEntries = {};
    
    try {
      irrigationZonesInfo = await client.query(sql.integrations.irrigationProperties, []).then((r) => r.rows);
    } catch (error) {
      console.error({
        issue: 'Issue',
        error,
      });
    }
    
    client.release();
    
    irrigationZonesInfo.forEach(row => {
      const externalPropertyId = row.externalPropertyId;
      const apiKey = row.apiKey;
      const apiSecret = row.apiSecret;
    
      // If the external property id is not in the uniqueEntries object, add it along with its corresponding API key and API secret
      if (!uniqueEntries[externalPropertyId]) {
          uniqueEntries[externalPropertyId] = { apiKey, apiSecret };
      }
    });
    
    return irrigationZonesInfo,uniqueEntries;
    
};
  
module.exports = semiosDB;
