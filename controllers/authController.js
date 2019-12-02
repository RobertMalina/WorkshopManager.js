const Controller = require('./base/controller');
const Action = require('./base/action');

const AuthController = function(/*OrderService class*/ userService) {
  
  Controller.call(this);

  const service = userService;

  this.registerUser = new Action();

}