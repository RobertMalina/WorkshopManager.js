const Controller = require('./base/controller');
const Action = require('./base/action');

const AuthController = function(/*AuthService class*/ authService) {
  
  Controller.call(this);

  const service = authService;

  this.pluralize = false;

  this.registerUser = new Action('/register','POST', function ( req,res ){
    service.registerAppUser(req.body).then(()=>{
        return res.json(1);
    }).catch((err) => {
       console.error(err); 
       res.json(err); 
    }); 
  },{
    authRequired: true, roles: ['admin']
  });
}
module.exports = AuthController;