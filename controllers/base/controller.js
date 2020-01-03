const { Action } = require('./action');

const Controller = function(config){
  config = config || {};
  this.isApiController = config.isApiController || false;
  this.pluralize = config.pluralize === undefined ? true : config.pluralize;
  this.routePrefix = null;

  this.setDefaultRoutePrefix = function(){
    let controllerName = this.constructor.name;
    let conventionalPartStartIndex = controllerName.indexOf('Controller');
    controllerName = controllerName.slice(0,conventionalPartStartIndex);
    controllerName = controllerName.toLowerCase();
    if(this.pluralize) {
      controllerName += 's';
    }
    if(this.isApiController){
      this.routePrefix = `/api/${controllerName}`;
    }
    else{
      this.routePrefix = '/' + controllerName;
    }    
  }

  this.getActions = function() {
    const actions = [];
    for(var key in this)
      {
        if(this.hasOwnProperty(key))
        {
          if(this[key] instanceof Action)
          {
            const action = this[key];
            action.setAsRouteOf(this);
            actions.push(action);          
          }
        }
      }
    return actions;
  };

  this.getRoutePrefix = function() {
    if(this.routePrefix === null){
      this.setDefaultRoutePrefix();
    }
    return this.routePrefix;
  }

  this.getName = function(){
    return this.constructor.name;
  }
}

module.exports = Controller;