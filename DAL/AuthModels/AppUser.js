const sql = require('mssql');
const Model = require('../Models/model');

const AppUser = function(){
  const properties = {
    'Id': {
      type: sql.BigInt,
      value: '',
      autoIncrement: true
    },
    'Username': {
      type: sql.NVarChar(128),
      value: ''
    },
    'PasswordHash': {
      type: sql.NVarChar(64),
      value: ''
    },
    'Roles': {
      skipInsert: true,
      value: []
    }
  }
  Model.call(this, properties );
}

module.exports = AppUser;