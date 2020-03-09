const { Action } = require('../../../controllers/base/action');

let action1, action2, action3;

action1 = new Action('/count', 'GET', () => {}, {});
action2 = new Action('/of/order/:id', 'POST', () => {}, {});
action3 = new Action('/:id', 'DELETE', () => {}, {});

describe('setAsRouteOf method', () => {
  describe.each([
    [action1.path, 'orders-controller', action1, 'api/orders'],
    [action2.path, 'workers-controller', action2, 'api/workers'],
    [action3.path, 'client-controller', action3, 'api/clients'],
  ])(
    'when passed action with path: %s and %s, should return route that contains',
    (actionPath, controllerFileName, action, expectedPart) => {
      test(`${expectedPart}`, () => {
        const controllerType = require(`../../../controllers/${controllerFileName}`);
        const controller = new controllerType();
        controller.pluralize = true;
        action.setAsRouteOf(controller);
        expect(action.route).toMatch(`${expectedPart}`);
      });
    },
  );
});

// asRegistrationResult test
describe('asRegistrationResult method', () => {
  test('should return expected object when action registered successfully', () => {
    expect(action1.asRegistrationResult()).toEqual({
      route: '/api/orders/count',
      type: 'GET',
      registered: true,
      errMsg: null,
    });
  });
  test('should return expected object when action register failed', () => {
    expect(
      action1.asRegistrationResult({ errMsg: 'some error detected' }),
    ).toEqual({
      route: '/api/orders/count',
      type: 'GET',
      registered: false,
      errMsg: 'some error detected',
    });
  });
});

// checkAction
