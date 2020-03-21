const DbAccess = require('../DAL/db-access');
const QueryStore = require('../DAL/query-store');

const { digest } = require('../DAL/Models/entity');
const queryStore = new QueryStore();

class OrderService {
  constructor(
    dbContext = new DbAccess(require('../server.config').getDbSettings('-dev')),
  ) {
    this.dbCtx = dbContext;
  }

  getPagedOrders({ page, itemsOnPage, statusFilters }) {
    return new Promise((resolve, reject) => {
      let query = queryStore.get('selectOrdersForPagedList', {
        page,
        itemsOnPage,
        statusFilters,
      });
      this.dbCtx
        .run(query)
        .then(response => {
          resolve(
            digest(response, {
              excludedColumns: ['description'],
              modelsName: 'orders',
            }),
          );
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  fetchAsPageContent({ page, itemsOnPage, statusFilters }) {
    return new Promise((resolve, reject) => {
      let ordersPortion;

      if (!page && page !== 0) {
        reject('page param is obligatory!');
      }
      if (!itemsOnPage) {
        reject('itemsOnPage param is obligatory!');
      }
      if (typeof statusFilters !== 'object') {
        console.warn(
          'paged orders fetching: status filters are not passed, orders of all statuses will be considered to return.',
        );
      }

      this.getPagedOrders({ page, itemsOnPage, statusFilters })
        .then(data => {
          if (!data) {
            reject('Orders fetch error occured...');
          }
          ordersPortion = data.orders || [];
          return this.getOrdersCount({ statusFilters });
        })
        .then(ordersCount =>
          resolve({
            orders: ordersPortion,
            count: ordersCount,
          }),
        )
        .catch(err => reject(err));
    });
  }

  getOrdersCount({ statusFilters }) {
    return new Promise((resolve, reject) => {
      const query = queryStore.get('selectOrdersCount', { statusFilters });

      this.dbCtx
        .run(query)
        .then(response => {
          response = digest(response, { asSingleResult: true });
          resolve(response.ordersCount);
        })
        .catch(err => reject(err));
    });
  }

  fetchOrder(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        reject('id parameter is obligatory!');
      }

      this.dbCtx
        .run(queryStore.get('selectOrderWithId', { id: id }))
        .then(response => {
          if (!response.recordset) {
            resolve(`Can't fetch order with id: ${id}...`);
          }
          response = digest(response, { asSingleResult: true });
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  deleteOrder(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        reject('id parameter is obligatory!');
      }
      console.log(`Deletion of order with id: ${id} is proceeded.`);
      this.dbCtx
        .run(queryStore.get('deleteOrder', id))
        .then(response => {
          console.log(`Order with id: ${id} succeeded.`, response);
          resolve(response);
        })
        .catch(error => {
          console.log(`Order with id: ${id} failed.`, error);
          reject(error);
        });
    });
  }

  registerOrder(orderData) {
    return new Promise((resolve, reject) => {
      if (!orderData) {
        reject('orderData parameter is obligatory!');
      }
      this.dbCtx
        .run(queryStore.get('registerOrder', orderData))
        .then(response => {
          response = digest(response, { asSingleResult: true });
          let { result } = response;
          if (isNaN(parseInt(result, 10))) {
            reject(result);
          } else {
            resolve(parseInt(result, 10));
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = OrderService;
