const { reduceObj } = require('../../../shared/tools');
const {
  units,
  memoryDiagnostics,
} = require('../../../shared/memory-diagnostics');

const session = memoryDiagnostics.session();

beforeEach(() => {
  session.log(process.memoryUsage()).in(units.MB, 2);
});

afterAll(() => {
  session.summarize();
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
      action = new Action('/count', 'GET', () => {}, {});
    });

    test('returns correct path when belongs to OrderController', () => {
      controller = new OrderController({}, {});
      action.setAsRouteOf(controller);
      expect(action.route).toEqual('/api/orders/count');
    });

    test('returns non-api path', () => {
      controller = new OrderController(
        {},
        {},
        { isApiController: false, pluralize: true },
      );
      action.setAsRouteOf(controller);
      expect(action.route).toEqual('/orders/count');
    });

    test('returns "unpluralized" path', () => {
      controller = new OrderController(
        {},
        {},
        { isApiController: true, pluralize: false },
      );
      action.setAsRouteOf(controller);
      expect(action.route).toEqual('/api/order/count');
    });
  });
});

const QueryStore = require('../../../DAL/query-store');
const registerParams = {
  firstName: 'Ania',
  lastName: 'Kowal',
  title: 'Wymiana chłodnicy',
  description:
    'Chłodnica przecieka w kilku miejscach, nie nadaje się do regeneracji.',
};
const phoneNumber = '443892502';
const vehicleDescription = 'Alfa Giulietta 2011 1.6Mpi 120KM';

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

const DbAccess = require('../../../DAL/db-access');
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
      const db = new DbAccess(getDbSettings(dbModes.TEST));
      const cleanUpQuery = `
      DECLARE @PhoneNumber CHAR(10) = '${phoneNumber}';
      DECLARE @OrderId BIGINT;
      SET @OrderId = (SELECT MAX([Id]) FROM [dbo].[Order]);
      DELETE FROM [dbo].[Order]  WHERE Id = @OrderId;
      DELETE FROM [dbo].[Client] WHERE [PhoneNumber] = @PhoneNumber;
      `;
      db.run(cleanUpQuery);
    }
  });
});

const AuthService = require('../../../services/auth/auth-service');

describe('User System features test', () => {
  const authService = new AuthService(getDbSettings(dbModes.TEST));

  describe('(async) hashPassword method', () => {
    const password = 'zaq12wsx';
    let hashed;

    test('returns anything', done => {
      authService.usersSystemApi.hashPassword(password).then(result => {
        hashed = result;
        expect(hashed).toBeTruthy();
        done();
      });
    });

    test('returns string that is likely valid hash (has considerable length)', done => {
      authService.usersSystemApi.hashPassword(password).then(result => {
        hashed = result;
        expect(hashed.length).toBeGreaterThan(20);
        done();
      });
    });
  });
});

const {
  OrdersList,
} = require('../../../master-thesis-common/orders-list.component');

describe.only(`DOM related tests`, () => {
  let listObj,
    placeholder,
    placeholderId = 'orders-list-placeholder',
    ordersService,
    countSetter,
    reloadBtn;

  const listId = 'orders-list';

  beforeAll(() => {
    ordersService = new OrderService(getDbSettings(dbModes.DEVELOPMENT));
    document.body.innerHTML = `
      <input id="count-setter" type="number" value="5"/>>
      <button id="reload-btn"></button>
      <div id="${placeholderId}"></div>`;
    placeholder = document.getElementById(placeholderId);
    listObj = new OrdersList({
      ordersService,
      placeholder,
      id: listId,
    });
    countSetter = document.getElementById('count-setter');
    reloadBtn = document.getElementById('reload-btn');
  });
  test('OrdersList should have 5 items and then 2 items', async done => {
    expect.assertions(2);
    const listElement = await listObj.render(0, 5);
    expect(listElement.querySelectorAll('.order.list-item').length).toBe(5);

    countSetter.value = 2;
    reloadBtn.addEventListener('click', () => {
      listObj.render(0, countSetter.value).then(element => {
        expect(element.querySelectorAll('.order.list-item').length).toBe(2);
        done();
      });
    });
    reloadBtn.click();
  });

  test('OrdersList first item has valid phone number', async () => {
    expect.assertions(1);
    const listElement = await listObj.render(0, 5);
    const firstItem = listElement.querySelector('.order.list-item');
    const phoneNumber = firstItem.querySelector('.client-phone').innerHTML;
    expect(parseInt(phoneNumber, 10)).not.toBeNaN();
  });
});
