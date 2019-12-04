const Controller = require('./base/controller');
const Action = require('./base/action');

const AuthController = function(/*AuthService class*/ authService) {
  
  Controller.call(authService);

  const service = userService;

  this.registerUser = new Action('/register','POST',( req,res )=>{
    const userData = req.body;
    const user = service.createVirtualUser(userData);
      service
        .registerAppUser(user)
        .then(()=>{
          return res.json(1);
        })
        .catch(error => {
          console.error(error);
          res.json(error);
        });
  },{
    authRequired: true, roles: ['admin']
  });
}
module.exports = AuthController;