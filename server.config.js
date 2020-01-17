const assert = require('assert');

require('dotenv').config();

const { 
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

} = process.env;

assert( DEV_SQLSERVER_USERNAME, "You must set DEV_SQLSERVER_USERNAME in your local .env file." );
assert( DEV_SQLSERVER_USERPSWD, "You must set DEV_SQLSERVER_USERPSWD in your local .env file." );
assert( DEV_SQLSERVER_IP_ADDR, "You must set DEV_SQLSERVER_IP_ADDR in your local .env file." );
assert( DEV_DB_NAME, "You must set DEV_DB_NAME in your local .env file." );

if(process.env.DEV_DB_NAME___NEW){
  console.log('db name was changed');
  DEV_DB_NAME = process.env.DEV_DB_NAME___NEW;
}
else{
  console.log('not changed');
}

function getConnectionSettings (/*string [-dev || -test]*/ dbDest) {
    const newDbName = process.env.DEV_DB_NAME___NEW,
      newServerName = process.env.DEV_SQLSERVER_IP_ADDR___NEW;
    return {
      user: DEV_SQLSERVER_USERNAME,
      password: DEV_SQLSERVER_USERPSWD,
      server: newServerName ? newServerName : DEV_SQLSERVER_IP_ADDR,
      database: newDbName ? newDbName : DEV_DB_NAME,
      pool: {
        max: 15,
        min: 10,
        idleTimeoutMillis: 3000
      }
    }
}


module.exports = {
  dbDynamic: getConnectionSettings,
  db:{
    user: DEV_SQLSERVER_USERNAME,
    password: DEV_SQLSERVER_USERPSWD,
    server: DEV_SQLSERVER_IP_ADDR___NEW ? DEV_SQLSERVER_IP_ADDR___NEW : DEV_SQLSERVER_IP_ADDR,
    database: DEV_DB_NAME,
    pool: {
      max: 15,
      min: 10,
      idleTimeoutMillis: 3000
    }
  },
  dbTest: {
    user: TEST_SQLSERVER_USERNAME,
    password: TEST_SQLSERVER_USERPSWD,
    server: TEST_SQLSERVER_IP_ADDR,
    database: TEST_DB_NAME,
    pool: {
      max: 15,
      min: 10,
      idleTimeoutMillis: 3000
    }
  }
}
