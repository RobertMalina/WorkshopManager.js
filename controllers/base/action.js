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
  if (securityConfig) {
    this.authRequired = true;
    this.roles = securityConfig.roles || 'all';
  } else {
    this.authRequired = true;
    this.roles = 'all';
  }
  this.run = run;
};

module.exports = Action;
