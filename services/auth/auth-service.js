const DbAccess = require('../DAL/db-access');
const Passport = require('passport');
const BCrypt = require('bcrypt');
const AppUser = require('../DAL/AuthModels/AppUser');
const LocalStrategy = require('passport-local').Strategy;
const { reduceObj } = require('../shared/tools');

const AuthService = function() {
  
  const db = new DbAccess();

  const saltingRounds = 12;

  const isString = function(val){
    return typeof val === 'string';
  };

  this.passportAuth = () => {

  };

  this.secure = function(server) {

    server.use(Passport.initialize());
    server.use(Passport.session());

    const secStrategy = new LocalStrategy((username, password, done) => {
      this.getAppUser(username).then((user)=>{
        if(!user){
          console.log(`user with username: ${user} not found`);
          done(null, false, { message: "Invalid username/password" });
          return false;
        }
        BCrypt.compare(password, user.get('PasswordHash')).then((isValid) => {
            if(isValid){
              done(null, user);
            }
            else{
              done(null, false, { message: "Invalid username/password" });
            }
          })
          .catch((err)=>{
            done(null, false, { message: "Server error occured..." });
          });;
      })
      .catch((err)=>{
        done(null, false, { message: "Server error occured..." });
      });
    });

    Passport.use('local', secStrategy);

    Passport.serializeUser(function(user,done){
      done(err, user.Id);
    });

    Passport.deserializeUser(function(userId, done){
      this.getAppUser(userId).then((appUser)=>{
        done(null, user);
      }).catch((err) => {
        done(err, null);
      })
    });

    //nadpisanie metody serwera (bez mechanizmu autentykacji, nie wykonuje żadnej operacji oprócz logowania w konsoli że wywołano akcję wymagającą uwierzytelnienia)
    server.authenticate = function(req, res, next) {
      console.log(`passport-authentication: isAuthenticated = ${req.isAuthenticated()}`)
      if (req.isAuthenticated())
        next();
      else{
        res.redirect("/app/login");
      }
    };
  };

  this.createVirtualUser = function(userData){   
    const user = new AppUser();  
    if(!user.isValid(userData))
    {
      console.error('Post body does not conform to registration model...');
      return null;
    }
    const { Username, Password } = userData;
    return new Promise((resolve, reject) => {     
      BCrypt.genSalt(saltingRounds).then((salt) => {
        BCrypt.hash(Password, salt).then((passwordHash)=>{
          user.set('Username', Username);
          user.set('PasswordHash', passwordHash);         
          resolve(user);
        }).catch((err) => reject(err));
      })
      .catch((err) => reject(err));
    });  
  };

  this.registerAppUser = function(userData) {
    return this.createVirtualUser(userData).then((appUser)=>{
      return db.insert(appUser);
    }).catch((err) => { console.error(err); });
  };

  this.getAppUser = function(/*id or username*/identifier){
    let wherePart = isString(identifier) ?
     `[Username] LIKE '%${identifier}%'`:
     `Id = ${identifier}`

     const query = `select top 1 * from [AppUser] where ${wherePart}`;
     
    return new Promise((resolve, reject) => {
      db.run(query)
      .then((read) => {
        if(read.recordset.length < 1){
          resolve(null);
        }
        else{
          const user = new AppUser();
          user.set('Id', read.recordset[0].Id);
          user.set('Username', read.recordset[0].Username);
          user.set('PasswordHash',read.recordset[0].PasswordHash);
          resolve(user);
        }
      }).catch(err => { reject(err)});    
    });
  };

  this.findAndVerify = function(username, password){

    return this.getAppUser(username).then((user)=>{
      if(!user) {
        return false;
      }
      return BCrypt.compare(password, user.get('PasswordHash'));
    })
  };

  this.JWT = {

    verify: () => {
      return new Promise((resolve, reject) =>
      {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => 
        {
          if (err || !decodedToken)
          {
            return reject(err)
          }
          resolve(decodedToken)
        });
      });
    },

    createJWToken: (details) => {
      if (typeof details !== 'object')
      {
        details = {}
      }

      if (!details.maxAge || typeof details.maxAge !== 'number')
      {
        details.maxAge = 3600
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
        }, process.env.JWT_SECRET, {
          expiresIn: details.maxAge,
          algorithm: 'HS256'
      })

      return token
    },

    activateOn: (server) => {
      server.authenticate = function(req, res, next) {

        console.log('JWT authentication');   

        let token = (req.method === 'POST') ? req.body.token : req.query.token
        this.verify(token)
          .then((decodedToken) =>
          {
            req.user = decodedToken.data
            next()
          })
          .catch((err) =>
          {
            res.status(400)
              .json({message: "Invalid auth token provided."})
          })
      };
    },

    authSuccessResponse: (res, user, maxAge) => {
      res.status(200)
      .json({
        success: true,
        token: createJWToken({
            sessionData: user,
            maxAge: maxAge || 3600
          })
      })
    },
  };

  this.authSuccessResponse = function(res){
    return res.status(200).json('Logged in!');
  };
  this.authFailedResponse = function(res){
    return res.status(401).json('Invalid Username || Password...!');
  };
};

module.exports = AuthService;