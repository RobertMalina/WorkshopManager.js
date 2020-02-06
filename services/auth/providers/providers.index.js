const PassportLocalAuthProvider = require('./passport-local.auth');
const JWTAuthProvider = require('./jwt.auth');
const AuthProvider = require('./auth-provider');

module.exports = {
  AuthProvider: AuthProvider,
  PassportLocalAuthProvider: PassportLocalAuthProvider,
  JWTAuthProvider: JWTAuthProvider
};