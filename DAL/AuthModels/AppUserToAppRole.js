const sql = require('mssql');
const { Model } = require('../Models/model');

const AppUserToAppRole = function({ userId, roleId }){
  
  const properties = {
    'UserId': {
      type: sql.Int,
      value: 0,
      nullable: false,
      primary: true
    },
    'RoleId': {
      type: sql.BigInt,
      value: 0,
      nullable: false,
      primary: true
    }
  }

  Model.call(this, properties);

  if([userId, roleId].every(i=> !isNaN(i))) {
    this.set('UserId', userId );
    this.set('RoleId', roleId );
  }

  this.insertRowInto = (table /* mssql: Table*/) => {
    if(!table.rows){
      console.error('table.row is undefined, assure if table object is instance of "Table" from mssql package...');
    }
    // important: order matters!
    table.rows.add(this.get('UserId'), this.get('RoleId'));
  }

}

module.exports = AppUserToAppRole;