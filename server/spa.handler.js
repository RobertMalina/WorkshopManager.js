const spaHandler = server => ({
  enableSPA: function() {
    const Handlebars = require('express-handlebars');
    this.instance.use((req, res) => {
      if (req.originalUrl.indexOf('/app/') !== -1) {
        console.log(
          'SPA mode active, layout change route detected. Redirrection to index.html file...',
        );
        res.sendFile(`${__dirname}/public/index.html`);
      }
    });
    this.instance.set('view engine', 'hbs');

    this.instance.engine(
      'hbs',
      Handlebars({
        extname: 'hbs',
        defaultView: 'default',
        layoutsDir: __dirname + '/public/views/pages/',
        partialsDir: __dirname + '/public/views/partials/',
      }),
    );
  },
});
module.exports = spaHandler;
