const isFunction = function(func) {
  return func && {}.toString.call(func) === '[object Function]';
};

const Action = function(path, httpVerb, run, securityConfig) {
  if (path === undefined) {
    console.error(`akcja musi definiować parametr "path"`);
    return null;
  }
  if (!isFunction(run)) {
    console.error(`parametr "run" nie jest funkcją!`);
    return null;
  }
  
  this.path = path;
  this.httpVerb = httpVerb;
  securityConfig = securityConfig || {};
  if (securityConfig.authRequired) {
    this.authRequired = true;
    this.roles = securityConfig.roles || 'all';
  } else {
    this.authRequired = false;
    this.roles = 'all';
  }
  this.run = run;

  this.setAsRouteOf = function(/*{}:Controller*/ controller) {
    let prefix = controller.getRoutePrefix();
    this.path = this.path || '';
    this.route = `${prefix}${this.path}`;
  }

  this.asRegistrationResult = function(/*{ errMsg:string }*/errConfig) {
    return {
      route: this.route || `NOT-ASSIGNED${this.path}`,
      type: this.httpVerb.toUpperCase(),
      registered: errConfig ? false : true,
      errMsg: errConfig ? errConfig.errMsg : null
    };
  };

};

const checkAction = function(/*{}:Action*/ action) {
    if(action instanceof Action === false){
      return { isOk: false, msg:`Object is not an Action` };   
    }

    if (!action.httpVerb) {
      return { isOk: false, msg:`No http-method type provided for route.` };
    }
    else if(['GET','POST','PUT','DELETE'].indexOf(action.httpVerb) < 0 ) {
      return { isOk: false, msg:`Passed http-method is incorrect or not supported... (${action.httpVerb}).` };
    }

    if (!action.route) {
      return { isOk: false, msg:'No route provided for action.' };
      return false;
    }
    if (!action.run || !isFunction(action.run)) {
      return { isOk: false, msg:'No handler provided for route.' };
    }
    return { isOk: true, msg:'' };
}

module.exports = {
  Action: Action,
  checkAction: checkAction
};
