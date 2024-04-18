'use strict';
require('dotenv').config({ path: '.env.production' });

const { AltracClient } = require('../util/altracApiClient');
const AltracApiHelper = require('../util/altrac');
const { decryptAES } = require('../util/encryptionHelper');
const semiosDB = require('./semiosDB');
const fs = require('fs');

const getAltracClient = async (apiKey, apiSecret) => {
  const credentials = AltracApiHelper.altracClient;
  credentials.clientId = decryptAES(apiKey, process.env.EXT_INTEGRATION_AES_KEY);
  credentials.secretKey = decryptAES(apiSecret, process.env.EXT_INTEGRATION_AES_KEY);
  const altracClient = await new AltracClient(credentials);
  return altracClient;
};

const altrac = async () => {
  AltracApiHelper.init({
    apiHost: process.env.ALTRAC_API_HOST,
    apiVersion: process.env.ALTRAC_API_VERSION,
  });

  const uniqueEntries = await semiosDB();
  const allResults = [];

  for (const [externalCustomerId, { apiKey, apiSecret }] of Object.entries(uniqueEntries)) {
    try {
      const altracClient = await getAltracClient(apiKey, apiSecret);
      const results = await altracClient.get(`zones/${externalCustomerId}`);
      allResults.push({ externalCustomerId, results });
      console.log(results);
    } catch (error) {
      console.error({
        issue: `Issue getting data for ID: ${externalCustomerId}`,
        error,
      });
    }
  }

  // Print the results table
  console.log("All Results:");
  console.table(allResults);
  allResults.forEach(({ externalCustomerId, results }) => {
    console.log(`externalCustomerId: ${externalCustomerId}`);
    console.table(results);
  });
  /*allResults.forEach(({ externalCustomerId, results }) => {
    console.log(`externalCustomerId: ${externalCustomerId}`);
    results.forEach((result, index) => {
      console.log(`Index: ${index}`);
      console.log(JSON.stringify(result.geom, null, 2));
    });
  });*/
    // Write results to a JSON file
  fs.writeFileSync('all_results.json', JSON.stringify(allResults, null, 2));

  console.log("All Results have been written to all_results.json");
};
altrac();
