const DbAccess = require('../DAL/db-access');

const OrderService = function() {
  
  const db = new DbAccess();

  this.fetchOrders = function() {
    return db.run('select * from [Order]');
  };

  this.fetchOrder = function(id) {
    return db.run(`select * from [Order] where [Id] = ${id}`);
  };
};

module.exports = OrderService;
