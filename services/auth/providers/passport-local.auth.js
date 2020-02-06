const AuthProvider = require('./auth-provider');
const LocalStrategy = require('passport-local').Strategy;
const Passport = require('passport');

const PassportLocalAuthProvider = function(server) {

  if(!server){
    console.error('PassportLocalAuthProvider requires server object to instantiate...')
    return null;
  }

  initialize = (server) => {
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
  }

  this.authHandler = (req, res, next) => {
    console.log(`passport-authentication: isAuthenticated = ${req.isAuthenticated()}`)
    
    // TODO: supply passport local authentication
    
    if (req.isAuthenticated())
      next();
    else{
      res.redirect("/app/login");
    }
  };

  AuthProvider.call(this, {
    authHandler: this.authHandler
  });

  initialize(server);
}

module.exports = PassportLocalAuthProvider;