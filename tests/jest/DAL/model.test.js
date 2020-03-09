const {
  Model,
  AppUser,
  AppUserToAppRole,
} = require('../../../DAL/DAL.index.js');

describe('AppUser:Model inheritance test', () => {
  const user = new AppUser();

  describe('AppUser should have:', () => {
    test('public set function', () => {
      expect(user.set).toBeTruthy();
    });
    test('public get function', () => {
      expect(user.get).toBeTruthy();
    });
    test('public canAccept function', () => {
      expect(user.canAccept).toBeTruthy();
    });
    test('Id property', () => {
      expect(user.get('Id')).toBeTruthy();
    });
    test('Username property', () => {
      expect(user.get('Username')).toBeTruthy();
    });
    test('PasswordHash property', () => {
      expect(user.get('PasswordHash')).toBeTruthy();
    });
    test('Roles property', () => {
      expect(user.get('Roles')).toBeTruthy();
    });
  });
});

describe('Model functionality test', () => {
  describe('canAccept should return', () => {
    const user = new AppUser();
    test('{ yes: true }', () => {
      const formData = {
        PasswordHash: 'hashhashhash',
        Username: 'testuser',
        Roles: ['administrator', 'regular'],
      };
      expect(user.canAccept(formData)).toEqual({ yes: true });
    });

    test('{ yes: true }', () => {
      const formData = {
        PasswordHash: 'hashhashhash',
        userName: 'testuser',
        roles: ['administrator', 'regular'],
      };
      expect(user.canAccept(formData)).toEqual({ yes: true });
    });

    describe('missingProperties error', () => {
      const formData = {
        roles: ['administrator', 'regular'],
      };
      const result = user.canAccept(formData);

      it('yet has "yes" property set to false', () => {
        expect(result.yes).toEqual(false);
      });

      it('and missingProperties contains [username, passwordhash]', () => {
        expect(result.missingProperties).toEqual(
          expect.arrayContaining(['username', 'passwordhash']),
        );
      });
    });
  });

  describe('set method should set', () => {
    let user;
    beforeEach(() => {
      user = new AppUser();
    });
    test('PasswordHash to hashhashhash', () => {
      user.set('PasswordHash', 'hashhashhash');
      expect(user.get('PasswordHash')).toEqual('hashhashhash');
    });
  });

  describe('form data mapping', () => {
    let user;
    beforeEach(() => {
      user = new AppUser();
    });
    test('should be successfull, so', () => {
      const formData = {
        PasswordHash: 'hashhashhash',
        Username: 'testuser',
        Roles: ['regular', 'mechanician'],
      };
      user.mapProperties(formData);
      expect(user.get('Username')).toEqual('testuser');
      expect(user.get('PasswordHash')).toEqual('hashhashhash');
      expect(user.get('Roles')).toEqual(
        expect.arrayContaining(['regular', 'mechanician']),
      );
    });

    test('should be successfull as well (inaccurate letter cases)', () => {
      const formData = {
        PasswordHash: 'hashhashhash',
        userName: 'testuser',
        ROLES: ['regular', 'admin'],
      };
      user.mapProperties(formData);
      expect(user.get('Username')).toEqual('testuser');
      expect(user.get('PasswordHash')).toEqual('hashhashhash');
      expect(user.get('Roles')).toEqual(
        expect.arrayContaining(['regular', 'admin']),
      );
    });
  });
});
