const trollnetController = require('./trollnet.controller.js');

const prepareCoreInstances = function () {
  console.log('CORE prepareCoreInstances');
}

const setupCoreMonitors = function () {
  console.log('CORE setupCoreMonitors');
  _releaseDaemons();
}

const _releaseDaemons = function () {
  console.log('CORE _releaseDaemons');
  trollnetController.trollnetDaemon();
}

const coreController = {
  prepareCoreInstances,
  setupCoreMonitors
};

module.exports = coreController;