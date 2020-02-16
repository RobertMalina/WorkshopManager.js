const AppServer = require('../../../server');
const AppUser = require('../../../DAL/AuthModels/AppUser');

const AuthProvider = function (config) {

  //@to override
  authHandler = (req, res, next) => {
    console.warn('Action that required authentication is invoked, but there is no auth-provider provided (default fake-provider is used)...')
    next();
  };

  //defaults for public api, invoked in controller endpoint
  const defaults = {
    loginSuccessHandler: (res) => {
      return res.status(200);
    },
    loginFailedHandler: (res) => {
      return res.status(401).json({
        message: 'Invalid Username || Password...!',
        isAuthenticated: false
      });
    },   

    onUserSystemSuccess: (res, user) => {
      console.warn('User data is correct, but authentication state persisting is not implemented') 
      res.json({
        msg: 'Authentication passed, but no persisted - server does not implement auth-persistence layer.',
        isAuthenticated: true,
        userName: user instanceof AppUser ?
         user.get('Username') : '???'
      });
    }
  } 

  /*
  config : {
    authHandler: function
  }
  */
  if(!config) {
    console.error('AuthProvider can not be instantiated without configuration object...');
    return null;
  }

  const hasNoSpecificProvider = config.forceGeneric;

  if (hasNoSpecificProvider) {
    this.onUserSystemSuccess = defaults.onUserSystemSuccess;
  }
  else { 
    if(typeof config.authHandler !== 'function') {
      console.error('obligatory function authHandler of AuthProvider is not provided...');
      return null;
    }
    if(typeof config.onUserSystemSuccess !== 'function') {
      console.error('obligatory function onUserSystemSuccess of AuthProvider is not provided...');
      return null;
    }
    authHandler = config.authHandler;
    this.onUserSystemSuccess = config.onUserSystemSuccess;
  }

  this.loginSuccessHandler = config.logInSuccessHandler ||
   defaults.loginSuccessHandler;

  this.loginFailedHandler = config.loginFailedHandler ||
   defaults.loginFailedHandler;

  this.activateOn = (server /*AppServer*/) => {
      //if(!server instanceof AppServer) { //TODO weryfikacja
      if(!server){
        console.error('server object has invalid type or not provided...');
        return;
      }
      server.setAuthenticateRoutine(authHandler);
    } 
}

module.exports = AuthProvider;