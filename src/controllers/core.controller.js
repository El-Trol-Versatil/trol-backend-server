const trollnetController = require('./trollnet.controller.js'),
  corpusController = require('./corpus.controller.js'),
  Python = require('../providers/scripts/python.service.js'),
  modelController = require('./model.controller.js');

const prepareCoreInstances = function () {
  console.log('RUNNING setupBaseModel');
  Python.setupBaseModel(function () {
    console.log('FINISHED setupBaseModel');
  });
  console.log('CORE prepareCoreInstances');
}

const setupCoreMonitors = function () {
  console.log('CORE setupCoreMonitors');
  _releaseDaemons();
}

const _releaseDaemons = function () {
  console.log('CORE _releaseDaemons');
  trollnetController.trollnetDaemon();
  corpusController.corpusDaemon();
  modelController.modelDaemon();
}

const coreController = {
  prepareCoreInstances,
  setupCoreMonitors
};

module.exports = coreController;