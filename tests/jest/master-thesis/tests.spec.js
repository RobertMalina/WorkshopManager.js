const { reduceObj } = require('../../../shared/tools');
const {
  units,
  memoryDiagnostics,
} = require('../../../shared/memory-diagnostics');

const session = memoryDiagnostics.session();

beforeEach(() => {
  session.log(process.memoryUsage()).in(units.MB, 2);
});

describe(`Shared tools tests`, () => {
  describe('reduceObj function:', () => {
    let transformation, inputData, expectedData, output;

    beforeAll(() => {
      transformation = (data, val, key) => {
        if (typeof val !== 'function' && key !== 'password') data[key] = val;
        return data;
      };

      let loginDate = new Date();

      inputData = {
        maxAge: 360, // (seconds)
        login: 'user0001',
        loginDate,
        password: 'zxc123',
        getCredentials: function() {},
        setCredentials: function(data) {},
      };

      expectedData = {
        maxAge: 360,
        login: 'user0001',
        loginDate,
      };
    });

    beforeEach(() => {
      output = reduceObj(inputData, transformation, {});
    });

    test('returns object without function-members', () => {
      expect(output).toEqual(expectedData);
    });
    test('returns object without password', () => {
      expect(output).toEqual(expectedData);
    });
  });
});

const OrderController = require('../../../controllers/orders-controller');
const { Action } = require('../../../controllers/base/action');

describe(`Controller Action object tests`, () => {
  describe('setAsRouteOf method:', () => {
    let controller, action;

    beforeAll(() => {
      controller = new OrderController();
      action = new Action('/count', 'GET', () => {}, {});
      action.setAsRouteOf(controller);
    });

    test('returns correct path when belongs to OrderController', () => {
      expect(action.route).toMatch('api/orders/count');
    });

    test('returns non-api path', () => {
      expect(action.route).toMatch('/orders/count');
    });

    test('returns "unpluralized" path', () => {
      controller.setPluralization(false);
      action.setAsRouteOf(controller);
      expect(action.route).toMatch('api/order/count');
    });
  });
});

const QueryStore = require('../../../DAL/query-store');
let registerParams = {
  firstName: 'Ania',
  lastName: 'Kowal',
  title: 'Wymiana chłodnicy',
  description:
    'Chłodnica przecieka w kilku miejscach, nie nadaje się do regeneracji.',
};
let phoneNumber = '443892502';
let vehicleDescription = 'Alfa Giulietta 2011 1.6Mpi 120KM';

describe(`QueryStore (sql queries parser) tests`, () => {
  let queryStore = new QueryStore();

  describe('Order register-query parser', () => {
    test('should throw error when no args are provided', () => {
      expect(() => {
        queryStore.get('registerOrder');
      }).toThrowError(
        "Cannot destructure property `firstName` of 'undefined' or 'null'",
      );
    });

    test('should throw error when phoneNumber and vehicleDescription is not provided', () => {
      expect(() => {
        queryStore.get('registerOrder', registerParams);
      }).toThrowError(
        `phoneNumber is required, vehicleDescription is required, order register query terminated...`,
      );
    });

    const expectedQuery = `DECLARE @result VARCHAR(1024);

      EXEC [spRegisterOrder] 
      @FirstName='${registerParams.firstName}',
      @LastName='${registerParams.lastName}',
      @PhoneNumber='${phoneNumber}', 
      @Title='${registerParams.title}', 
      @VehicleDescription='${vehicleDescription}',
      @Description='${registerParams.description}',
      @Response = @result OUTPUT;
      
      SELECT @result AS 'result';`.replace(/[\s]/g, '');

    test('should return expected query', () => {
      expect(
        queryStore
          .get('registerOrder', {
            phoneNumber,
            vehicleDescription,
            ...registerParams,
          })
          .replace(/[\s]/g, ''),
      ).toEqual(expectedQuery);
    });
  });
});

const { getDbSettings, dbModes } = require('../../../server.config');
const OrderService = require('../../../services/order-service');
const ClientService = require('../../../services/client-service');

describe(`(async) Database integration tests`, () => {
  let orderId;
  test('register method should return new order Id', done => {
    const orderService = new OrderService(getDbSettings(dbModes.TEST));
    orderService
      .registerOrder({
        phoneNumber,
        vehicleDescription,
        ...registerParams,
      })
      .then(response => {
        orderId = response;
        expect(response).toBeGreaterThan(0);
        done();
      })
      .catch(error => done(error));
  });

  afterAll(() => {
    if (orderId) {
      console.log('TEST-db cleanup');
      const clientService = new ClientService(getDbSettings(dbModes.TEST));
      orderService.deleteOrder(orderId);
      clientService.deleteClient(phoneNumber);
    }
  });
});
