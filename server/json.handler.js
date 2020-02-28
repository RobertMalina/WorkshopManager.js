const jsonHandler = server => ({
  enableJSONBodyParsing: () => {
    const bodyParser = require('body-parser');
    server.instance.use(bodyParser.json());
    server.instance.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    );
  },
});
module.exports = jsonHandler;
