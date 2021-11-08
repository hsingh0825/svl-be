const express = require('express');
const https = require('https');
const getCert = require('./auth');
const app = express();
const port = 5000 | process.env.port;

getCert()
.then(cert => {
  httpsOptions = {
    pfx: new Buffer.from(cert.value, 'base64')
  }

  requestOptions = {
    hostname: `wseval.s.uw.edu`,
    method: 'GET',
    pfx: new Buffer.from(cert.value, 'base64')
  }

  // Router middleware setup
  let initRoutes = require('./routes');
  app.use('/', initRoutes(requestOptions));

  https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Server started on port: ` + port);
  });
}).catch(err => console.error(err));