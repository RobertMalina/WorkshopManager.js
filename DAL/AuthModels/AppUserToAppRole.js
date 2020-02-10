const sql = require('mssql');
const Model = require('../Models/model');

const AppUserToAppRole = function(){
  const properties = {
    'UserId': {
      type: sql.Int,
      value: 0,
      nullable: false
    },
    'RoleId': {
      type: sql.BigInt,
      value: 0,
      nullable: false
    }
  }
  Model.call(this, properties);
}

module.exports = AppUserToAppRole;