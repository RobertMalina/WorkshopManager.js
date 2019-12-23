const DbAccess = require('../DAL/db-access');

const WorkersService = function() {
  
  const db = new DbAccess();

  const sqlHandler = require('mssql')

  this.getWorkersOfOrder = function(orderId){
    return db.run(`
          SELECT
          W.FirstName,
          W.LastName,
          W.PhoneNumber FROM [Worker] W
          INNER JOIN OrderToWorker otw on otw.WorkerId = W.Id and otw.OrderId = @orderId`,
          [{
            argName: 'orderId',
            type: sqlHandler.BigInt,
            value: orderId
          }])
      .catch((err)=> {
        console.log(err);
      })
  };

  this.getWorkersOfOrders = function(ordersIds) {
    
    let readPromises = []; 
    for (let i =0; i < ordersIds.length; i++){
        readPromises.push( new Promise ((resolve, reject) => {
          db.run(`
          SELECT
          W.FirstName,
          W.LastName,
          W.PhoneNumber FROM [Worker] W
          INNER JOIN OrderToWorker otw on otw.WorkerId = W.Id and otw.OrderId = @orderId`,
          [{
            argName: 'orderId',
            type: sqlHandler.BigInt,
            value: ordersIds[i]
          }])
          .then(response => {
            if(response.recordset) {
              resolve({
                orderId: ordersIds[i],
                mechanicians: response.recordset
              });
            }
          })
          .catch((error)=> {
          console.error(error);
          reject(error);
        });
      }));
    }
    return Promise.all(readPromises);
  };
};

module.exports = WorkersService;