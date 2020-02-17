const AuthProvider = require('./auth-provider');
const { reduceObj } = require('../../../shared/tools');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../../server.config').jwtSecret;
const AppUser = require('../../../DAL/AuthModels/AppUser');

const JWTAuthProvider = function(options) {

  this.maxAge = options.maxAge || 3600; // in seconds

  verify = (token) => {
    return new Promise((resolve, reject) =>
    {
      jwt.verify(token, jwtSecret, (err, decodedToken) => 
      {
        if (err || !decodedToken)
        {
          return reject(err)
        }
        resolve(decodedToken)
      });
    });
  };

  createJWToken = (details) => {
    if (typeof details !== 'object')
    {
      details = {}
    }

    if (!details.maxAge || typeof details.maxAge !== 'number')
    {
      details.maxAge = this.maxAge
    }

    details.sessionData = reduceObj(details.sessionData || {}, (data, val, key) =>
    {
      if (typeof val !== "function" && key !== "password")
      {
        data[key] = val
      }
      return data;
    }, {})
    
    let token = jwt.sign({
      data: details.sessionData
      }, jwtSecret, {
        expiresIn: details.maxAge,
        algorithm: 'HS256'
    })

    return token
  };

  this.authHandler = (req, res, next) => {
    let token = req.headers.authorization ? 
      req.headers.authorization :
      (req.method === 'POST') ? req.body.token : req.query.token;

    if(!token) {
      return res.status(403).json({ error: 'No credentials sent!' });
    }

    if(token.indexOf('Bearer ') !== -1){
      token = token.replace('Bearer ','');
    }
    
    verify(token)
      .then((decodedToken) =>
      {
        req.user = decodedToken.data;
        onAccessAllowed();
        next();
      })
      .catch((err) =>
      {
        const errMsg = err.name === 'TokenExpiredError' ?
          `The token has expired at ${err.expiredAt}.` :
          `Invalid auth token provided.`;

        onAccessDenied(err); 
        res.status(400)
          .json({message: errMsg})
      })
  };

  this.onUserSystemSuccess = (res, user /* AppUser */) => {
    res.status(200)
    .json({
      isAuthenticated: true,
      token: createJWToken({
          sessionData: user,
          maxAge: this.maxAge
        }),
      username: user instanceof AppUser ? 
        user.get('Username') : '?',
      roles: user instanceof AppUser ? 
        user.get('Roles') : []
    });
  }

  const onAccessAllowed = (user /*: { username: string, ... }*/) => {
    if(user){
      console.log(`JWT authentication succeeded for user: ${user.username}`); 
    }
    else{
      console.log('JWT authentication succeeded');  
    }
  };
  const onAccessDenied = (err) => {
    console.warn(err);
    console.log('JWT authentication failed');  
  };

  this.logInSuccessHandler = (res, user) => {
    if(user && user instanceof AppUser) {
      console.log(`JWT: user: ${user.get('Username')} successfully logged in (${new Date().toISOString()})`); 
    }
    else{
      console.log(`JWT: successfully log-in detected ${new Date().toISOString()}`); 
    }
    return res.status(200);
  };

  AuthProvider.call(this, {
    authHandler: this.authHandler,
    logInSuccessHandler: this.logInSuccessHandler,
    onUserSystemSuccess: this.onUserSystemSuccess
  });
}

module.exports = JWTAuthProvider;