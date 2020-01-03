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

  this.getOrders = new Action('', 'GET',  
    function( req, res ) {
      res.setHeader('Content-Type', 'application/json');
      service
        .fetchActiveOrders()
        .then(response => {
          return res.status(200).json(response);
        })
        .catch(err => {
          console.error(err);
          errorHandler(err);
        });
    },
    { authRequired: true, roles: ['admin'] }
  );

  this.getCount = new Action('/count', 'POST', 
    function(req, res) {
      const countArchivedToo = req.body.archivedToo;
      res.setHeader('Content-Type', 'application/json');
      service.getOrdersCount(countArchivedToo)
        .then(response => {
          return res.status(200).json(response);
        })
        .catch(err => {
          console.error(err);
          errorHandler(err);
        });
    }
  );

  this.ordersPagedListSet = new Action('/pagedListSet', 'POST',
    function (req, res) {
      const { page, itemsOnPage, archivedToo } = req.body;
      const response = {};
      service.fetchOrdersForPage(page, itemsOnPage, archivedToo)
      .then(result => {
        response.orders = result["orders"];
        service.getOrdersCount(archivedToo)
        .then(result =>{
           response.totalCount = result["ordersCount"];
           return res.status(200).json(response);
          });
      }).catch( err => {
        errorHandler(err);
      })
      .catch( err => {
        errorHandler(err);
      });;
    }
  );

  this.getOrdersForPage = new Action('', 'POST',  
    function( req, res ) {
    const { page, itemsOnPage, archivedToo } = req.body;
    res.setHeader('Content-Type', 'application/json');
    service
      .fetchOrdersForPage( page,itemsOnPage, archivedToo )
      .then(response => {
        return res.status(200).json(response);
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
          return res.status(200).json(response);
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
