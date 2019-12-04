const Controller = require('./base/controller');
const Action = require('./base/action');

const AuthController = function(/*AuthService class*/ authService) {
  
  Controller.call(this);

  const service = authService;

  this.pluralize = false;

  this.register = new Action('/register','POST', function ( req, res ){
    service.registerAppUser(req.body).then(()=>{
        return res.json(1);
    }).catch((err) => {
       console.error(err); 
       res.json(err); 
    }); 
  },{
    authRequired: true, roles: ['admin']
  });

  this.login = new Action('/login','POST', function ( req, res ){
    service.isLoginDataValid(req.body.Username, req.body.Password).then((isValid)=>{
      if(isValid){
        return res.json('Logged in!');
      }
      else{
        return res.json('Invalid Username || Password...');
      }  
    }).catch((err) => {
       console.error(err); 
       return res.json('Server error during login attempt...');
    }); 
  });
}
module.exports = AuthController;