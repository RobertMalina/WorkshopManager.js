const authHandler = server => ({
  authenticationRoutine: (req, res, next) => {
    console.warn(
      'Authentication is not implemented - this method should be overided.',
    );
    next();
  },

  enableAuthentication: () => {
    if (server.authService) {
      server.authService.setAuthentication({
        target: server,
        provider: server.authProviderKey,
      });
      return true;
    } else {
      new Error('AuthService is not provided...');
    }
  },

  setAuthenticateRoutine: authRoutine => {
    if (typeof authRoutine !== 'function') {
      new Error('server auth-routine must be a function!');
    }
    server.authenticationRoutine = authRoutine;
  },
});
module.exports = authHandler;
