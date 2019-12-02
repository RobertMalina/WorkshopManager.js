const OrderService = function() {
  const sqlServerAccess = require('mssql');

  const fs = require('fs');

  const rawSettings = fs.readFileSync('./server-settings/db-connection-configs.json');
  const settings = JSON.parse(rawSettings);
  const dbConnectionConfig = settings["MaqunistaDbConfig"];

  this.fetchOrders = function() {
    return new Promise(function(resolve, reject) {
      sqlServerAccess.connect(dbConnectionConfig, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        const request = new sqlServerAccess.Request();

        request.query('select * from [Order]', function(err, recordset) {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(recordset);
        });
      });
    });
  };

  this.fetchOrder = function(id) {
    return new Promise(function(resolve, reject) {
      sqlServerAccess.connect(dbConnectionConfig, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        const request = new sqlServerAccess.Request();

        request.query(`select * from [Order] where [Id] = ${id}`, function(
          err,
          record,
        ) {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(record);
        });
      });
    });
  };
};

module.exports = OrderService;
