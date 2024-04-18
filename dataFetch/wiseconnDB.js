'use strict';
const axios = require('axios');
require('dotenv').config({ path: '.env.production' });

const WISECONN_API_HOST = process.env.WISECONN_API_HOST;
const WISECONN_API_KEY = process.env.WISECONN_API_KEY;
const farmId = 1100;

async function getFarmZones() {
  try {
    const getFarmZonesConfig = {
      method: 'get',
      url: `${WISECONN_API_HOST}/farms/${farmId}/zones`,
      headers: {
        api_key: WISECONN_API_KEY,
        Accept: 'application/json'
      }
    };

    const response = await axios(getFarmZonesConfig);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching farm zones:', error);
    throw error;
  }
}
getFarmZones()
  .then(data => {
  })
  .catch(error => {
  });
