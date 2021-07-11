const ROUTER_CONFIG = require('../../config/router.config.js'),
      trollnetRouter = require('./trollnet.router.js');

function _setupRouting(app) {
  app.use(ROUTER_CONFIG.EP_GLOBAL.TROLLNET, trollnetRouter);
}

module.exports.setupRouting = _setupRouting;