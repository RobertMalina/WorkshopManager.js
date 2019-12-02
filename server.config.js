const assert = require('assert');

require('dotenv').config();

const { 
  DEV_SQLSERVER_USERNAME,
  DEV_SQLSERVER_USERPSWD,
  DEV_SQLSERVER_IP_ADDR,
  DEV_DB_NAME
} = process.env;

assert( DEV_SQLSERVER_USERNAME, "You must set DEV_SQLSERVER_USERNAME in your local .env file." );
assert( DEV_SQLSERVER_USERPSWD, "You must set DEV_SQLSERVER_USERPSWD in your local .env file." );
assert( DEV_SQLSERVER_IP_ADDR, "You must set DEV_SQLSERVER_IP_ADDR in your local .env file." );
assert( DEV_DB_NAME, "You must set DEV_DB_NAME in your local .env file." );

module.exports = {
  db:{
    user: DEV_SQLSERVER_USERNAME,
    password: DEV_SQLSERVER_USERPSWD,
    server: DEV_SQLSERVER_IP_ADDR,
    database: DEV_DB_NAME
  }
}
