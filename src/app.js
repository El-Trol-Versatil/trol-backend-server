// Modules
const express = require('express'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      cors = require('cors'),

// Files
      mongodb = require('./providers/dbs/mongo.db.js'),
      router = require('./routes/router.js'),
      coreController = require('./controllers/core.controller.js');


// let corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
  
// Basic express configuration
const app = express();
app.options('*', cors());
app.use(cors());
// Get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, content-type, Accept, if-none-match');
// });

// Database
coreController.prepareCoreInstances();
mongodb.connect(function() {
  // Prepare stored devices communication flow
  coreController.setupCoreMonitors();
});

// Router
router.setupRouting(app);

module.exports = app;