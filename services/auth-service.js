const DbAccess = require('../DAL/db-access');
const Passport = require('passport');
const BCrypt = require('bcrypt');
const AppUser = require('../DAL/AuthModels/AppUser');
const LocalStrategy = require('passport-local').Strategy;

const AuthService = function() {
  
  const db = new DbAccess();

  const saltingRounds = 12;

  this.secure = function(server) {

    server.use(Passport.initialize());
    server.use(Passport.session());

    const secStrategy = new LocalStrategy((username, password, done)=>{
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
      console.error('Post body does not confrom to registration model...');
      return null;
    }

    return new Promise((resolve, reject) => {
      BCrypt.genSalt(saltingRounds).then((salt) => {
        BCrypt.hash(userData.Password, salt).then((passwordHash)=>{
          user.set('Username', userData.Username);
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
    let idField = isString(identifier) ? `'Username'` : 'Id';

    return new Promise((resolve, reject) => {
      db.run(`select top 1 * from [AppUser] where ${idField} = ${identifier}`)
      .then((read) => {
        if(read.recordset.length < 1){
          return null;
        }
        else{
          const user = new AppUser();
          user.set('Id', read.recordset[0].Id);
          user.set('Username', read.recordset[0].Username);
          user.set('PasswordHash',read.recordset[0].PasswordHash);
          resolve(user);
        }
      });    
    });
  };

  this.isLoginDataValid = function(username, password){
    return this.getAppUser(username).then((user)=>{
      if(!user){
        console.warn(`user with username: ${user} not found`)
        return false;
      }
      return BCrypt.compare(password, user.get('PasswordHash'));
    })
  };

};

module.exports = AuthService;