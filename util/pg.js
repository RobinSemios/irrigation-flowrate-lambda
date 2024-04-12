'use strict';

// Require dotenv and configure it to load your environment variables
require('dotenv').config({ path: '.env.production' }
);
const pg = require('pg');

// instantiate a new client
// the client will read connection information from
// the same environment variables used by postgres cli tools
const pgConfig = {
  user: process.env.PGUSER_SEMIOS,
  password: process.env.PGPASSWORD_SEMIOS,
  database: process.env.PGDATABASE_SEMIOS,
  host: process.env.PGHOST_SEMIOS,
  port: process.env.PGPORT_SEMIOS,
  max: 2, // max number of clients in the pool
  idleTimeoutMillis: 2000, // how long a client is allowed to remain idle before being closed
};
module.exports = { pool: new pg.Pool(pgConfig) };
