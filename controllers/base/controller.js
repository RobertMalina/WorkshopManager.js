const ControllerAction = require('./action');

const Controller = function(){

  this.setDefaultRoutePrefix = function(){
    let controllerName = this.constructor.name;
    let conventionalPartStartIndex = controllerName.indexOf('Controller');
    controllerName = controllerName.slice(0,conventionalPartStartIndex);
    controllerName = controllerName.toLowerCase();
    if(this.pluralize){
      controllerName += 's';
    }
    if(this.isApiController){
      this.routePrefix = `/api/${controllerName}`;
    }
    else{
      this.routePrefix = '/' + controllerName;
    }    
  }

  this.pluralize = true;

  this.routePrefix = null;

  this.getActions = function() {
    const actions = [];
    for(var key in this)
      {
        if(this.hasOwnProperty(key))
        {
          if(this[key] instanceof ControllerAction)
          {
            const action = this[key];
            action.route = this.asRoute(action.path);
            actions.push(action);          
          }
        }
      }
    return actions;
  };

  this.asRoute = function(path){
    if(this.routePrefix === null){
      this.setDefaultRoutePrefix();
    }
    path || '';
    return this.routePrefix + path;
  }

  this.getName = function(){
    return this.constructor.name;
  }
}

module.exports = Controller;