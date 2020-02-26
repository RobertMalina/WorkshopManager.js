const Controller = require('./base/controller');
const { Action } = require('./base/action');
const Passport = require('passport');
const errorHandler = require('./base/error-handler');

const AuthController = function(/*AuthService class*/ authService) {
  Controller.call(this, {
    isApiController: true,
    pluralize: false,
  });

  const service = authService;

  this.register = new Action('/register', 'POST', function(req, res) {
    const { username, password, roles } = req.body;
    service.usersSystemApi
      .register({
        username: username,
        password: password,
        roles: roles,
      })
      .then(result => {
        return res.status(200).json(result);
      })
      .catch(err => errorHandler(err, res));
  });

  this.getUser = new Action(
    '/user',
    'POST',
    function(req, res) {
      const { username } = req.body;
      service.usersSystemApi
        .get(username)
        .then(user => {
          return res.status(200).json(user);
        })
        .catch(err => errorHandler(err, res));
    },
    { authRequired: true, roles: ['admin'] },
  );

  this.getBecryptedPassword = new Action(
    '/receive/bcrypted',
    'POST',
    function(req, res) {
      service.usersSystemApi
        .createAppUserInstance(req.body)
        .then(user => {
          return res.status(200).json({
            PasswordHash: user.get('PasswordHash'),
            Username: user.get('Username'),
          });
        })
        .catch(err => {
          console.error(err);
          errorHandler(err, res);
        });
    },
    {
      authRequired: false,
    },
  );

  this.login = new Action('/login', 'POST', function(req, res) {
    const { username, password } = req.body;

    service.usersSystemApi
      .checkCredentials(username, password)
      .then(checkRes => {
        if (checkRes.user && checkRes.result) {
          service.authProvider().onUserSystemSuccess(res, checkRes.user);

          return service.authProvider().loginSuccessHandler(res, checkRes.user);
        } else if (checkRes.isError) {
          return errorHandler(
            {
              response: {},
              message: 'Internal server error',
            },
            res,
          );
        } else {
          return service.authProvider().loginFailedHandler(res);
        }
      })
      .catch(err => {
        console.error(err);
        return errorHandler(err, res);
      });
  });
};

AuthController.prototype = Object.create(Controller.prototype);
Object.defineProperty(AuthController.prototype, 'constructor', {
  value: AuthController,
  enumerable: false,
  writable: true,
});

module.exports = AuthController;
