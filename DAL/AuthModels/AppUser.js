const sql = require('mssql');
const { Model } = require('../Models/model');

const AppUser = function(){
  const properties = {
    'Id': {
      type: sql.BigInt,
      value: '',
      primary: true,
      skipInsert: true
    },
    'Username': {
      type: sql.NVarChar(128),
      value: ''
    },
    'Password': {
      temporary: true,
      skipInsert: true,
      value: ''
    },
    'PasswordHash': {
      type: sql.NVarChar(64),
      value: '',
    },
    'Roles': {
      skipInsert: true,
      value: [],
      nullable: true
    }
  }
  Model.call(this, properties );
}

module.exports = AppUser;