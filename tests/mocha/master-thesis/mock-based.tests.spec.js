const regeneratorRuntime = require('regenerator-runtime'); // -> instrukcja usuwa błąd który występuje przy funkcjach typu async ("regeneratorRuntime is not defined")
const getTestData = require('../../helpers/test-data-reader');
const dbConfig = require('../../../server.config').getDbSettings('-dev');
const defResponse = require('../../db-responses/raw/default.json');
const expect = require('chai').expect;
const sinon = require('sinon');
const sinonTest = require('sinon-test');
const sinTest = sinonTest(sinon);
const asString = obj => {
  return JSON.stringify(obj).replace(/\s+/g, '');
};

sinon.config = {
  useFakeTimers: false, //in aim async functions to works properly
};

describe('mocks related tests (mock approach)', () => {
  let dbCtx;
  let dbCtxMock;
  const DbAccess = require('../../../DAL/db-access');
  it(
    `DbAccess module is mocked (db won't be queried)`,
    sinTest(async function() {
      let fakeQuery = 'no query is needed...';
      dbCtx = new DbAccess(dbConfig);
      dbCtxMock = this.mock(dbCtx);
      dbCtxMock
        .expects('run')
        .once()
        .withArgs(fakeQuery)
        .returns(
          new Promise(function(resolve) {
            resolve(defResponse);
          }),
        );
      let result1 = await dbCtx.run(fakeQuery);
      dbCtxMock.verify();
      expect(result1).to.eql(defResponse);
    }),
  );
});

describe('mocks related tests (stub approach)', () => {
  let dbCtx = require('../../mocks/db-access.mock').createMock();

  afterEach(() => {
    dbCtx.dispose();
  });
  it(
    `DbAccess module is mocked (db won't be queried)`,
    sinTest(async function() {
      const result = await dbCtx.run('no query is needed...');
      sinon.assert.calledOnce(dbCtx.run);
      sinon.assert.calledWith(dbCtx.run, 'no query is needed...');
      expect(result).to.eql(defResponse);
    }),
  );
});

const OrderService = require('../../../services/order-service');

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

  let dbCtx;

  before(() => {
    dbCtx = require('../../mocks/db-access.mock').createMock();
  });

  after(() => {
    dbCtx.dispose();
  });

  it(
    `getOrdersCount should return 24`,
    sinTest(async function() {
      dbCtx.run
        .onCall(0)
        .returns(new Promise(resolve => resolve(orderCountRes)));
      orderService = new OrderService(dbCtx);
      const result = await orderService.getOrdersCount(queryData.statusFilters);
      expect(result).to.equal(24);
    }),
  );

  it(
    `should return fixed test data`,
    sinTest(async function() {
      dbCtx.run
        .onCall(1)
        .returns(new Promise(resolve => resolve(pagedOrdersRes)));
      dbCtx.run
        .onCall(2)
        .returns(new Promise(resolve => resolve(orderCountRes)));

      orderService = new OrderService(dbCtx);
      const result = await orderService.fetchAsPageContent(queryData);
      expect(asString(result)).to.equal(asString(pagedOrders));
    }),
  );

  it(
    `spies info summary`,
    sinTest(async function() {
      const QueryStore = require('../../../DAL/query-store');
      const qs = new QueryStore();
      const ordersCountQuery = qs.get('selectOrdersCount', {
        statusFilters: queryData.statusFilters,
      });
      sinon.assert.callCount(dbCtx.run, 3);
      sinon.assert.calledWithExactly(dbCtx.run.getCall(0), ordersCountQuery);
    }),
  );
});
