const Controller = require('./base/controller');
const { Action } = require('./base/action');
const errorHandler = require('./base/error-handler');

const OrderController = function(/*OrderService class*/ orderService) {
  
  Controller.call( this, {
    isApiController: true,
    pluralize: true
  });

  const service = orderService;

  this.hello = new Action('/hello', 'GET', 
    function(req, res) {
      res.status(200).send('Hear me roar!');
  });

  this.getCount = new Action('/count', 'POST', 
    function(req, res) {
      service.getOrdersCount(req.body)
        .then(response => res.status(200).json(response))
        .catch(err => errorHandler(err, res));
    },
    { authRequired: true, roles: ['regular'] }
  );

  this.getPagedOrders = new Action('/paged', 'POST',
    function (req, res) {
      service.fetchAsPageContent(req.body)
      .then(result => res.status(200).json(result))
      .catch( err => errorHandler(err, res));
    },
    { authRequired: true, roles: ['regular'] }
  );

  this.getOrder = new Action('/:id', 'GET', 
    function ( req,res ) {
      service
        .fetchOrder(req.params.id)
        .then(response => res.status(200).json(response))
        .catch(err => errorHandler(err, res));
    },
    { authRequired: true }
  );
};

module.exports = OrderController;
