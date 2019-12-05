const Controller = require('./base/controller');
const Action = require('./base/action');
const errorHandler = require('./base/error-handler');

const OrderController = function(/*OrderService class*/ orderService) {
  
  Controller.call(this);

  const service = orderService;

  this.hello = new Action('/hello', 'GET', 
    function(req, res) {
      res.status(200).send('Hear me roar!');
  });

  this.getOrders = new Action('', 'GET',  
    function( req, res ) {
      res.setHeader('Content-Type', 'application/json');
      service
        .fetchOrders()
        .then(response => {
          return res.status(200).json(response.recordset);
        })
        .catch(err => {
          console.error(err);
          errorHandler(err);
        });
    },
    { authRequired: true, roles: ['admin'] }
  );

  this.getOrder = new Action('/:id', 'GET', 
    function ( req,res ) {
      res.setHeader('Content-Type', 'application/json');
      const id = req.params.id;
      service
        .fetchOrder(id)
        .then(response => {
          return res.status(200).json(response.recordset);
        })
        .catch(error => {
          console.error(error);
          errorHandler(err);
        });
    },
    { authRequired: true }
  );
};

module.exports = OrderController;
