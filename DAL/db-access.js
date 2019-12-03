const QueryString = require('./db-query-string');

const DbAccess = function() {
  const sql = require('mssql');
  const configuration = require('../server.config');
  const dbConnectionConfig = configuration.db;

  const isEntityModelValid = function (entityModel) {   
    if(!entityModel.hasOwnProperty("getModelMap")){
      console.error('Passed object does not implement required features of entityModel ...');
      return false;
    }

    return true;
  }

  this.insert = function(entityModel, schema){
    if(!isEntityModelValid(entityModel)){
      return false;
    }

    const modelMap = entityModel.getModelMap();
    const request = new sql.Request();

    for(const key in modelMap){
      const argName = key.toLowerCase();
      request.input(argName, propSettings.value, propSettings.type);
    }

    const query = new QueryString().asInsertFor(entityModel);
    this.run(query,request);
  }

  this.run = function(sqlStatement, request){
    return new Promise(function(resolve, reject) {
      sql.connect(dbConnectionConfig, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        const request = request || new sql.Request();

        request.query(sqlStatement, function(err, recordset) {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(recordset);
        });
      });
    });
  }
};

module.exports = DbAccess;
