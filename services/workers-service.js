const DbAccess = require('../DAL/db-access');
const QueryStore = require('../DAL/query-store');
const { asEntites } = require('../DAL/Models/entity')

const WorkersService = function() {
  
  const db = new DbAccess();
  const queryStore = new QueryStore();

  const sqlHandler = require('mssql');

  this.getWorkersOfOrder = function(orderId){
    const query = queryStore.get('selectWorkersOfOrder');
     return new Promise((resolve, reject) => {
      db.run(query,[{
            argName: 'orderId',
            type: sqlHandler.BigInt,
            value: orderId
          }])
          .then((response) => {     
          resolve({
            mechanicians: asEntites(response.recordset)
          });
      }).catch(err => {
        reject(err);
      });
    });     
  };

  this.getWorkersOfOrders = function(ordersIds) {   
    const readPromises = [];
    const query = queryStore.get('selectWorkersOfOrder');

    for (let i =0; i < ordersIds.length; i++){
        readPromises.push( new Promise ((resolve, reject) => {
          db.run( query,
          [{
            argName: 'orderId',
            type: sqlHandler.BigInt,
            value: ordersIds[i]
          }])
          .then(response => {
            if(response.recordset) {
              resolve({
                orderId: ordersIds[i],
                mechanicians: asEntites(response.recordset)
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