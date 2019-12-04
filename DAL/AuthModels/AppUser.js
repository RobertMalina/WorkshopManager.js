const sql = require('mssql');

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
    }
  }

  this.isValid = function(body){   
    if(!body.hasOwnProperty('Password')){
      return false;
    }
    if(!body.hasOwnProperty('Username')){
      return false;
    }
    return true;
  }

  this.getModelMap = function(){
    return properties;
  }

  this.set = function(propName, propValue) {
    if(!properties.hasOwnProperty(propName)){
      console.error(`Invalid property name ${propName}`);
      return false;
    }
    const property = properties[propName];
    property.value = propValue;
    return true;
  }

  this.get = function(propName) {
    if(!properties.hasOwnProperty(propName)){
      console.error(`Invalid property name ${propName}`);
      return false;
    }
    return properties[propName].value;
  }
}

module.exports = AppUser;