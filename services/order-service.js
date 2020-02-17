const DbAccess = require('../DAL/db-access');
const QueryStore = require('../DAL/query-store');

const { flatten } = require('../DAL/Models/entity')

const OrderService = function() {
  
  const db = new DbAccess();
  const queryStore = new QueryStore();

  this.fetchActiveOrders = function() {
    return new Promise((resolve, reject) => {
      db.run(queryStore.get('selectOrdersNonArchivized'))
      .then((response) => {
        
        if(!response.recordset){
          resolve(null);
        }
        else if(response.recordset.length > 0){
          resolve( flatten(response, 
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

  const getPagedOrders = ({ page, itemsOnPage, archivedToo, statusFilters }) => {
    return new Promise((resolve, reject) => 
    {
      let query = queryStore.get('selectOrdersForPagedList', {
        page,
        itemsOnPage,
        archivedToo,
        statusFilters
      });  
      db.run(query).then((response) => {    
        resolve( flatten (response, {
            excludedColumns: ['description'],
            modelsName: 'orders'
          }));
        }).catch(err => {
          reject(err);
        });
    });
  };

  this.fetchAsPageContent = ( { page, itemsOnPage, statusFilters }) => {
    
    return new Promise((resolve, reject) => {

      let ordersPortion;

      if(!page && page !== 0) {
        reject('page param is obligatory!');
      }
      if(!itemsOnPage) {
        reject('itemsOnPage param is obligatory!');
      }
      if(typeof statusFilters !== 'object') {
        console.warn('paged orders fetching: status filters are not passed, orders of all statuses will be considered to return.');
      }

      getPagedOrders({page, itemsOnPage, statusFilters })
      .then( data => {
        if(!data.orders) {
          reject('Orders fetch error occured...');
        }
        ordersPortion = data.orders;
        return this.getOrdersCount( { statusFilters })
      })
      .then( ordersCount => resolve({
        orders: ordersPortion,
        count: ordersCount
      }))
      .catch( err => reject(err));
    });
  }

  this.getOrdersCount = ({ statusFilters }) => {
    return new Promise((resolve, reject) => {

      const query = queryStore
        .get('selectOrdersCount', { statusFilters });

      db.run(query)
      .then( response =>
        {
          response = flatten(response, { asSingleResult: true });
          resolve(response.ordersCount);
        })
      .catch( err => reject(err));
    });
  }

  this.fetchOrder = function(id){
    return new Promise((resolve, reject)=> {

      if(!id){
        reject('id parameter is obligatory!')
      }

      db.run(queryStore.get('selectOrderWithId', { id:id }))
      .then((response) => {
        if(!response.recordset) {
          resolve(`Can't fetch order with id: ${id}...`);
        }
        response = flatten(response,{ asSingleResult: true });  
        resolve(response);
      })
      .catch((error)=> {
        reject(error);
      });
    });
  };

};

module.exports = OrderService;
