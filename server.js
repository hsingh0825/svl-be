const cookieParser = require('cookie-parser');
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const process = require('process');
const sessions = require('express-session');

const { isAuthenticated } = require('./utilities/auth');
const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const port = process.env.PORT || 8080;

const authRouter = require('./routers/auth');
const loginsRouter = require('./routers/logins');
const optionsRouter = require('./routers/options');

const vaultUri = process.env.VAULT_URI;
if (vaultUri == undefined) throw Error('The environment variable \'VAULT_URI\' cannot be undefined');

const azureCred = new DefaultAzureCredential();
const kvSecretClient = new SecretClient(vaultUri, azureCred);

async function startServer() {
  const server = express();
  
  // Remove the x-powered-by header for security reasons
  server.set('x-powered-by', false);

  const sessionSecret = await kvSecretClient.getSecret('app-session-secret');
  server.use(sessions({
    secret: sessionSecret.value,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // TODO: Change this to true in prod
      secure: false
    }
  }));

  // Router middleware setup
  server.use(morgan('combined'));
  server.use(express.json());
  server.use(express.urlencoded({ extended: false }));
  server.use(cookieParser());

  const dbConnSecret = await kvSecretClient.getSecret('db-conn');
  const dbConn = dbConnSecret.value;
  const cosmosClient = new CosmosClient(dbConn);

  // Attach database to all /api routes
  server.use('/api', async (req, res, next) => {
    req.database = cosmosClient.database('SVL');
    next();
  });

  server.use('/auth', authRouter);
  server.use('/api', loginsRouter);
  server.use('/api', optionsRouter);

  // The admin panel should be protected by authentication
  // for FERPA compliancy
  server.get('/admin', (req, res, next) => {
    if (!isAuthenticated(req)) {
      return res.redirect('/auth/signin');
    }

    next();
  });

  server.use(express.static('public'));

  http.createServer(server).listen(port, () => {
    console.log(`Server started on port: ${port}`);
  });
}

startServer();
