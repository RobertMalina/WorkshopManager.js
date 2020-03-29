const getTestData = require('../../helpers/test-data-reader');
const defResponse = getTestData('./tests/db-responses/raw/default.json');
const asString = obj => {
  return JSON.stringify(obj).replace(/\s+/g, '');
};
const OrderService = require('../../../services/order-service');

describe(`mocks related tests`, () => {
  let dbCtx;
  it(`DbAccess module is mocked (db won't be queried)`, async () => {
    dbCtx = require('../mocks/db-accces.mock').create();
    const result = await dbCtx.run('no query is needed...');
    expect(dbCtx.run).toHaveBeenCalledTimes(1);
    expect(dbCtx.run).toHaveBeenCalledWith('no query is needed...');
    expect(asString(result)).toEqual(asString(defResponse));
  });

  describe('OrderService.fetchAsPageContent', () => {
    let orderService;
    const queryData = {
      page: 0,
      itemsOnPage: 5,
      statusFilters: {
        registered: true,
        inProgress: true,
        finished: true,
      },
    };

    const orderCountRes = getTestData(
      './tests/db-responses/raw/orders-count.json',
    );
    const pagedOrdersRes = getTestData(
      './tests/db-responses/raw/paged-orders.json',
    );
    const pagedOrders = getTestData(
      './tests/db-responses/digested/paged-orders.test-data.json',
    );

    beforeEach(() => {
      dbCtx = require('../mocks/db-accces.mock').create();
    });

    afterAll(() => {
      dbCtx = null;
    });

    const QueryStore = require('../../../DAL/query-store');
    const qs = new QueryStore();
    const ordersCountQuery = qs.get('selectOrdersCount', {
      statusFilters: queryData.statusFilters,
    });
    it('getOrdersCount should return 24', async () => {
      dbCtx.run.and.returnValue(new Promise(resolve => resolve(orderCountRes)));
      orderService = new OrderService(dbCtx);
      const result = await orderService.getOrdersCount(queryData.statusFilters);
      expect(dbCtx.run.calls.argsFor(0)[0]).toEqual(ordersCountQuery);
      expect(result).toBe(24);
    });

    it('should return fixed test data', async () => {
      dbCtx.run.and.returnValues(
        new Promise(resolve => resolve(pagedOrdersRes)),
        new Promise(resolve => resolve(orderCountRes)),
      );
      orderService = new OrderService(dbCtx);
      const result = await orderService.fetchAsPageContent(queryData);
      expect(dbCtx.run).toHaveBeenCalledTimes(2);
      expect(asString(result)).toEqual(asString(pagedOrders));
    });
  });
});
