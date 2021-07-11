const trollnetController = require('./trollnet.controller.js');

const prepareCoreInstances = function () {
  console.log('CORE prepareCoreInstances');
  trollnetController.initializeTrollnets();
}

const setupCoreMonitors = function () {
  console.log('CORE setupCoreMonitors');
  _releaseDaemons();
}

const _releaseDaemons = function () {
  console.log('CORE _releaseDaemons');
  setInterval(() => {
    trollnetController.trollnetDaemon();
  }, 5000);
}

const coreController = {
  prepareCoreInstances,
  setupCoreMonitors
};

module.exports = coreController;