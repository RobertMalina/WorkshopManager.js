const DbAccess = function() {
  const sqlServerAccess = require('mssql');
  const configuration = require('../server.config');
  const dbConnectionConfig = configuration.db;

  this.run = function(sqlStatement){
    return new Promise(function(resolve, reject) {
      sqlServerAccess.connect(dbConnectionConfig, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        const request = new sqlServerAccess.Request();

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
