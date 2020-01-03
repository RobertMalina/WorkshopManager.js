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
    service.registerAppUser(req.body).then(()=>{
        return res.status(200).json('1 row affected');
    }).catch((err) => {
       console.error(err); 
       errorHandler(err); 
    }); 
  },{
    authRequired: true, roles: ['admin']
  });

  this.login = new Action('/login','POST', function ( req, res ){
    const { Username, Password } = req.body;
    service.isLoginDataValid( Username, Password ).then((isValid)=>{
      if(isValid){
        return res.status(200).json('Logged in!');
      }
      else{
        return res.status(200).json('Invalid Username || Password...');
      }  
    }).catch((err) => {
       console.error(err); 
       errorHandler(err);
    }); 
  });

  this.login = new Action('/login','POST', function ( req, res ) {
    Passport.authenticate('local',{
      successRedirect: "/login/success",
      failureRedirect: "/login/error",
      failureFlash: true
    });
  });

  this.loginFailed = new Action('/login/error', 'GET', function ( req, res ) {
    return res.json('Invalid Username || Password...');
  })

  this.loginFailed = new Action('/login/success', 'GET', function ( req, res ) {
    return res.json('Logged in!');
  })

}
module.exports = AuthController;