const DbAccess = require('../DAL/db-access');
const QueryStore = require('../DAL/query-store');

const { asEntites } = require('../DAL/Models/entity')

const OrderService = function() {
  
  const db = new DbAccess();
  const queryStore = new QueryStore();

  this.fetchActiveOrders = function() {
    return new Promise((resolve, reject)=> {
      db.run(queryStore.get('selectOrdersNonArchivized'))
      .then((response) => {
        
        if(!response.recordset){
          resolve(null);
        }
        else if(response.recordset.length > 0){
          resolve( asEntites(response, 
            { 
              excludedColumns: ['description'],
              modelsName: 'orders'
            }));
        }
        else {
          resolve(null);
        }
      })
      .catch((error)=> {
        reject(error);
      });
    });
  };

  this.fetchOrdersForPage = function( page, itemsOnPage, archivedToo ) {
    let query = queryStore.get('selectOrdersForPagedList', {
      page: page,
      itemsOnPage: itemsOnPage,
      archivedToo: archivedToo
    });
    return new Promise((resolve, reject) => {
      db.run(query).then( (response) => {    
        resolve( asEntites (response, 
          {
            excludedColumns: ['description'],
            modelsName: 'orders'
          }));
      }).catch(err => {
        reject(err);
      });
    });
  }

  this.getOrdersCount = function(archivedToo){
    let query = '';
    if(archivedToo){
      query = queryStore.get('selectOrdersCountAll');
    }
    else {
      query = queryStore.get('selectOrdersCountNonArchivized');
    }
    return new Promise((resolve, reject) => {
      db.run(query).then((response) => {
        resolve({
          ordersCount: response.recordset[0][""]
        });
      }).catch(err => {
        reject(err);
      });
    });
  }

  this.fetchOrder = function(id){
    return new Promise((resolve, reject)=> {
      db.run(queryStore.get('selectOrderWithId', { id:id }))
      .then((response) => {
        if(!response.recordset) {
          resolve(null);
        }
        else if(response.recordset.length > 0){        
          resolve( asEntites(response, 
            { 
              excludedColumns: ['id','decription'],
              modelsName: 'order',
            }));
        }
        else {
          resolve(null);
        }
      })
      .catch((error)=> {
        reject(error);
      });
    });
  };

};

module.exports = OrderService;
