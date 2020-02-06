const Controller = require('./base/controller');
const { Action } = require('./base/action');
const Passport = require('passport');
const errorHandler = require('./base/error-handler');

const AuthController = function(/*AuthService class*/ authService) {
  
  Controller.call( this, {
    isApiController: true,
    pluralize: false
  });

  const service = authService;

  this.register = new Action('/register','POST', function ( req, res ){
    service.usersSystemApi.register(req.body).then(()=>{
        return res.status(200).json('1 row affected');
    }).catch((err) => {
       console.error(err); 
       errorHandler(err, req, res); 
    }); 
  },{
    authRequired: true, roles: ['admin']
  });

  this.register = new Action('/receive/bcrypted','POST', function ( req, res ){
    service.usersSystemApi.createAppUserInstance(req.body)
      .then((user) => {      
          return res.status(200).json({
            PasswordHash: user.get("PasswordHash"),
            Username: user.get("Username")
          });
      }).catch((err) => {
        console.error(err); 
        errorHandler(err, req, res);
      });
  },{
    authRequired: true, roles: ['admin']
  });

  this.login = new Action('/login','POST', function ( req, res ) {
    const { Username, Password } = req.body;
    
    service.usersSystemApi.verify( Username, Password )
      .then((usersSystemCheck) => {
        if (usersSystemCheck.user && usersSystemCheck.result) {

          service.authProvider()
            .onUserSystemSuccess(res, usersSystemCheck.user);

          return service.authProvider()
            .loginSuccessHandler(res, usersSystemCheck.user);
        }
        else if(usersSystemCheck.isError) {
            return errorHandler({
              response: {},
              message: 'Internal server error'
            }, req, res);
        }
        else {
          return service.authProvider().loginFailedHandler(res);
        }
        }).catch((err) => {
          console.error(err); 
          return errorHandler(err, req, res);
      }); 
  });
}
module.exports = AuthController;