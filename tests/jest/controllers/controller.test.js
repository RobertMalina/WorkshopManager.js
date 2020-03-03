const OrderController = require('../../controllers/orders-controller');
const WorkerController = require('../../controllers/workers-controller');
const ClientController = require('../../controllers/client-controller');
const Controller = require('../../controllers/base/controller');
const { Action } = require('../../controllers/base/action');

describe('Routes root part pluralization', () => {
  let ordersController, rootPart;

  beforeEach(() => {
    ordersController = new OrderController();
  });

  test('by default should be supported', () => {
    rootPart = ordersController.getRoutePrefix();
    expect(rootPart).toEqual('/api/orders');
  });
  test('should be not supported', () => {
    ordersController.pluralize = false;
    rootPart = ordersController.getRoutePrefix();
    expect(rootPart).toEqual('/api/order');
  });
});

describe('actions gathering: ', () => {
  test('abstract controller should have 0 actions', () => {
    const abstractController = new Controller({}),
      actionsCount = abstractController.getActions().length;
    expect(actionsCount).toEqual(0);
  });

  test('abstract controller should have 3 actions', () => {
    const abstractController = new Controller({});
    let actionsCount;
    abstractController.action1 = new Action(
      '/route1',
      'GET',
      (req, res) => {},
      {},
    );
    abstractController.action2 = new Action(
      '/route2',
      'POST',
      (req, res) => {},
      {},
    );
    abstractController.action3 = new Action(
      '/route3/:id',
      'GET',
      (req, res) => {},
      {},
    );
    actionsCount = abstractController.getActions().length;
    expect(actionsCount).toEqual(3);
  });

  describe.skip.each([
    ['workers-controller'],
    ['client-controller'],
    ['orders-controller'],
  ])(`%s `, controllerFileName => {
    test(`shouldn't have 0 actions`, () => {
      const controllerType = require(`../../controllers/${controllerFileName}`);
      const controller = new controllerType();
      let actionsCount = controller.getActions().length;
      expect(actionsCount).not.toEqual(0);
    });
  });
});

// actions gathering check

// arrayContaining(array)
// case: check actions amount:
// subcase: OrderController
// subcase: AuthController
// case: check if collection item is Action

// api prefixes check

// jest 'toMatch' operator
// case: api controller
// case: no api controller
