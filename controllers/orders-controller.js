const Controller = require('./base/controller');
const Action = require('./base/action');

const OrderController = function(/*OrderService class*/ orderService) {
  
  Controller.call(this);

  const service = orderService;

  this.hello = new Action('/hello', 'GET', 
    function(req, res) {
    res.send('Hear me roar!');
  });

  this.getOrders = new Action('', 'GET',  
    function( req, res ) {
      service
        .fetchOrders()
        .then(response => {
          return res.json(response.recordset);
        })
        .catch(error => {
          console.error(error);
          res.json(error);
        });
    },
    { authRequired: true, roles: ['admin'] }
  );

  this.getOrder = new Action('/:id', 'GET', 
    function ( req,res ) {
      const id = req.params.id;
      service
        .fetchOrder(id)
        .then(response => {
          return res.json(response.recordset);
        })
        .catch(error => {
          console.error(error);
          res.json(error);
        });
    },
    { authRequired: true }
  );
};

module.exports = OrderController;
