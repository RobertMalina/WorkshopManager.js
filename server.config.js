const assert = require('assert');

require('dotenv').config();

const {
  DEFAULT_SRV_PORT,
  DEFAULT_SRV_DATA_FORMAT,

  DEV_SQLSERVER_USERNAME,
  DEV_SQLSERVER_USERPSWD,
  DEV_SQLSERVER_IP_ADDR,
  DEV_DB_NAME,

  TEST_SQLSERVER_USERNAME,
  TEST_SQLSERVER_USERPSWD,
  TEST_SQLSERVER_IP_ADDR,
  TEST_DB_NAME,

  DEV_DB_NAME___NEW,
  DEV_SQLSERVER_IP_ADDR___NEW,

  JWT_SECRET,
} = process.env;

assert(
  DEV_SQLSERVER_USERNAME,
  'You must set DEV_SQLSERVER_USERNAME in your local .env file.',
);
assert(
  DEV_SQLSERVER_USERPSWD,
  'You must set DEV_SQLSERVER_USERPSWD in your local .env file.',
);
assert(
  DEV_SQLSERVER_IP_ADDR,
  'You must set DEV_SQLSERVER_IP_ADDR in your local .env file.',
);
assert(DEV_DB_NAME, 'You must set DEV_DB_NAME in your local .env file.');

//assert( JWT_SECRET, "You must set JWT_SECRET in your local .env file (authorization purposes)." );

if (process.env.DEV_DB_NAME___NEW) {
  console.log('db name was changed');
  DEV_DB_NAME = process.env.DEV_DB_NAME___NEW;
}

const dbModes = {
  DEVELOPMENT: '-dev',
  TEST: '-test',
  PRODUCTION: '-prod',
};
Object.freeze(dbModes);

const dbSection = {
  defaultPool: {
    max: 15,
    min: 10,
    idleTimeoutMillis: 3000,
  },
};

function getDbSettings(dbMode) {
  switch (dbMode) {
    case dbModes.DEVELOPMENT:
      const newDbName = process.env.DEV_DB_NAME___NEW,
        newServerName = process.env.DEV_SQLSERVER_IP_ADDR___NEW;
      return {
        user: DEV_SQLSERVER_USERNAME,
        password: DEV_SQLSERVER_USERPSWD,
        server: newServerName ? newServerName : DEV_SQLSERVER_IP_ADDR,
        database: newDbName ? newDbName : DEV_DB_NAME,
        pool: dbSection.defaultPool,
      };
    case dbModes.TEST:
      return {
        user: TEST_SQLSERVER_USERNAME,
        password: TEST_SQLSERVER_USERPSWD,
        server: TEST_SQLSERVER_IP_ADDR,
        database: TEST_DB_NAME,
        pool: dbSection.defaultPool,
      };
    case dbModes['-prod']:
      break;

    default:
      break;
  }
}

// for the sake of CORS-aware communication
const allowedClients = Object.keys(process.env)
  .filter(k => k.indexOf('CLIENT_APP_ALLOWED_ORIGIN') !== -1)
  .map(originKey => process.env[originKey]);

module.exports = {
  getDbSettings: getDbSettings,
  dbModes: dbModes,
  CORS: {
    allowedClients: allowedClients,
  },
  jwtSecret: JWT_SECRET,
};
