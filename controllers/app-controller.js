const Controller = require('./base/controller');
const Action = require('./base/action');
const errorHandler = require('./base/error-handler');

const AppController = function() {
  
  Controller.call(this);

  this.pluralize = false;

  this.home = new Action('/home', 'GET', function(req, res){
    res.render('home', {layout: 'default', template: 'home-template'});
  }); 

  this.login = new Action('/login', 'GET', function(req, res){
    res.render('login', {layout: 'default', template: 'login-template'});
  });
}
module.exports = AppController;