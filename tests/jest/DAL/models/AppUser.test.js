
describe('AppUser EntityModel tests', () => {

  const user = new AppUser();

  test('AppUser properties are correct: ', () => {

    beforeEach(() => {
      user = new AppUser();
    });

    test('afer matching with form data using inherited "Model.mapProperties" method:', () => {
      user.mapProperties({
        Password: 'zxc123',
        Username: 'newUser123'
      })
      expect(user.properties).toEqual({
        Id: {
          type: Sql.BigInt,
          value: '',
          primary: true,
          skipInsert: true,
        },
        Password:{
          temporary: true,
          skipInsert: true,
          value: 'zxc123',
        },
        Username: {
          type: Sql.NVarChar(128),
          value: 'newUser123',
        },
        PasswordHash: {
          type: Sql.NVarChar(64),
          value: '',
        },
        Roles: {
          temporary: true,
          skipInsert: true,
        }
      });
    });

    test('afer using inherited "Model.set" method:', () => {
      user.set('Username', 'George Patton');
      user.set('PasswordHash', '2d928568ce17d1485f6d2c48bce9af5648c59dea');
      user.set('NotExistingProp', Date.now);
      expect(user.properties).toEqual({
        Id: {
          type: Sql.BigInt,
          value: '',
          primary: true,
          skipInsert: true,
        },
        Password:{
          temporary: true,
          skipInsert: true,
          value: '',
        },
        Username: {
          type: Sql.NVarChar(128),
          value: 'George Patton',
        },
        PasswordHash: {
          type: Sql.NVarChar(64),
          value: '2d928568ce17d1485f6d2c48bce9af5648c59dea',
        },
        Roles: {
          temporary: true,
          skipInsert: true,
        }
      });
    });

  });
});