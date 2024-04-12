'use strict';

const { pool } = require('../util/pg');
const sql = require('../sql');

// eslint-disable-next-line no-unused-vars
const semiosDB = async (event, context) => {
  let client;
  try {
    client = await pool.connect();
    console.log("connected to semios db")
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

  let irrigation;
  try {
    // eslint-disable-next-line max-len
    irrigation = await client.query(sql.integrations.irrigationProperties, []).then((r) => r.rows);
  } catch (error) {
    console.error({
      issue: 'Issue',
      error,
    });
  }
  client.release();

  return irrigation;
};

/*semiosDB()
  .then(() => pool.end()) // Close the pool after execution
  .catch(error => console.error('Error in semiosDB:', error));*/
  
module.exports = semiosDB;
