const OrderService = function() {
  const sqlServerAccess = require('mssql');

  const dbConnectionConfig = {
    user: process.env.DEV_SQLSERVER_USERNAME,
    password: process.env.DEV_SQLSERVER_USERPSWD,
    server: process.env.DEV_SQLSERVER_IP_ADDR,
    database: process.env.DEV_DB_NAME
  }

  console.log(dbConnectionConfig)

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
