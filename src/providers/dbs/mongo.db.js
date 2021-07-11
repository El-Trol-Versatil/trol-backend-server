const mongoose = require('mongoose'),
      SERVER_CONFIG = require('../../../config/server.config.js');

/**
 * Connection to DB
 */
function _connect(successCallback) {
  mongoose.Promise = global.Promise;
  if(SERVER_CONFIG.MONGODB_URL.indexOf('replicaSet') > - 1) {
    mongoose.connect(SERVER_CONFIG.MONGODB_URL, SERVER_CONFIG.MONGODB_OPTIONS);
  } else {
    mongoose.connect(SERVER_CONFIG.MONGODB_URL);
  }
  mongoose.connection.on('error', function(error) {
    console.log('Could not connect to database: ' + SERVER_CONFIG.MONGODB_URL + '. Exiting now...');
    console.log(error);
    mongoose.connection.close();
    mongoose.disconnect();
    process.exit();
  });
  mongoose.connection.once('open', function() {
    console.log('Successfully connected to database: ' + SERVER_CONFIG.MONGODB_URL);
    successCallback();
  });
}

module.exports.connect = _connect;