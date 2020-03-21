const regeneratorRuntime = require('regenerator-runtime'); // -> instrukcja usuwa błąd który występuje przy funkcjach typu async ("regeneratorRuntime is not defined")
import { getTestData as testData } from '../../helpers/test-data-reader';
import { asString } from '../../helpers/utils';
import { digest } from '../../../DAL/Models/entity';
const dbConfig = require('../../../server.config').getDbSettings('-dev');

import DbAccess, { runMock, defResponse } from '../../../DAL/db-access';
import OrderService from '../../../services/order-service';
jest.mock('../../../DAL/db-access'); // DbAccess is now a mock constructor

describe('mocks related tests', () => {
  let dbCtx;
  test(`DbAccess module is mocked (db won't be queried)`, async () => {
    expect.assertions(3);
    dbCtx = new DbAccess(dbConfig);
    const result = await dbCtx.run('no query is needed...');
    expect(runMock).toHaveBeenCalledTimes(1);
    expect(runMock).toHaveBeenCalledWith('no query is needed...');
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

    const orderCountRes = testData(
      './tests/db-responses/raw/orders-count.json',
    );
    const pagedOrdersRes = testData(
      './tests/db-responses/raw/paged-orders.json',
    );
    const pagedOrders = testData(
      './tests/db-responses/digested/paged-orders.test-data.json',
    );

    beforeAll(() => {
      runMock.mockClear();
    });

    beforeEach(() => {
      runMock.mockReturnValueOnce(
        new Promise(resolve => resolve(orderCountRes)),
      );
      runMock.mockReturnValueOnce(
        new Promise(resolve => resolve(pagedOrdersRes)),
      );
      dbCtx = new DbAccess(dbConfig);
      orderService = new OrderService(dbCtx);
    });

    test('getOrdersCount should return 5', async () => {
      runMock.mockReturnValueOnce(
        new Promise(resolve => resolve(orderCountRes)),
      );
      expect.assertions(1);
      const result = await orderService.getOrdersCount(queryData.statusFilters);
      expect(result).toBe(24);
    });

    test('should return fixed test data', async () => {
      expect.assertions(1);
      const result = await orderService.fetchAsPageContent(queryData);
      expect(asString(result)).toEqual(asString(pagedOrders));
    });

    test('spies info summary', () => {
      const QueryStore = require('../../../DAL/query-store');
      const qs = new QueryStore();
      const ordersCountQuery = qs.get('selectOrdersCount', {
        statusFilters: queryData.statusFilters,
      });
      expect(runMock).toHaveBeenCalledTimes(3);
      expect(runMock.mock.calls[0][0]).toEqual(ordersCountQuery);
    });
  });
});
