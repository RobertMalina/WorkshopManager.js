const configuration = require('../server.config');

const corsHandler = server => ({
  enableCORS: () => {
    const whitelist = configuration.CORS.allowedClients;

    const corsConfig = {
      origin: function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(
            `Received request from untrusted origin (${origin}). Response blocked due to CORS policy.`,
          );
        }
      },
    };
    const corsEnabler = require('cors');
    server.instance.use(corsEnabler(corsConfig));
  },
});

module.exports = corsHandler;
