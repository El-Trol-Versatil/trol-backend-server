const PythonFiles = require('../models/pythonFiles.model.js'),
  CorpusController = require('./corpus.controller.js'),
  Python = require('../providers/scripts/python.service.js'),
  Utils = require('../helpers/utils.helper.js');

  const ITERATIONS_DEFAULT = 200,
  DAEMON_INTERVAL_TIME = 30000;

const startModelDaemon = function () {
  console.log('startModelDaemon...');
  setTimeout(_checkPendingCorpuses, DAEMON_INTERVAL_TIME);
}

// Check on start if any stored trollnet is untrained, and then check periodically if any is waiting for training.
const _checkPendingCorpuses = function() {
  CorpusController.getAllNewCorpuses(function(corpusArray) {
    if (corpusArray && corpusArray.length) {
      const pendingSet = [...corpusArray];
      // Launch with a copy of it, so the full algorithm is closed to the list at that moment.
      console.log('...Interval call... _checkPendingCorpuses');
      _followCorpusTraining(pendingSet, 0, pendingSet.length, function () {
        console.log('SUCCESS RUN _checkPendingCorpuses, trained ' + pendingSet.length);
        // When all corpuses have been trained to models, wait a small time to:
        setTimeout(_checkPendingCorpuses, DAEMON_INTERVAL_TIME);
      });
    } else {
      setTimeout(_checkPendingCorpuses, DAEMON_INTERVAL_TIME);
    }
  });
};

// Recursive method that will call itself for each following model to be trained from a corpus.
const _followCorpusTraining = function(corpusArray, corpusIndex, totalCorpuses, callback) {
  const corpus = corpusArray[corpusIndex];
  _trainModel(corpus.fileName, function(err) {
    // TODO: usar el status no binario para marcar si funcionó o falló
    if (!err) {
      CorpusController.markAsUsed(corpus.id, function() {});
    }
    if (corpusIndex < totalCorpuses - 1) {
      corpusIndex = corpusIndex + 1;
      _followCorpusTraining(corpusArray, corpusIndex, totalCorpuses, callback);
    } else {
      callback();
    };
  });
}

const _trainModel = function(corpusFileName, callback) {
  // TODO: cambiar el flag del corpus a status no binario, ponerlo aquí a PROCESSING
  getModelDescriptorListFromDB(function (modelDescriptorList) {
    const generatedId = Utils.generateId(),
      modelId = 'model' + generatedId;
    Python.trainModel(modelId,
      corpusFileName,
      modelDescriptorList,
      ITERATIONS_DEFAULT, function (err, updatedModelDescriptorList) {
      if (err) {
        console.log('FAILED RUN _trainModel ' + corpusFileName);
        callback(err);
      } else {
        // TODO: HILAR FINO - version value for PythonFiles only object, somewhere as a constant?
        PythonFiles.update({ version: '12345' }, { $set: { modelDescriptorList: updatedModelDescriptorList } }, function (err) {
          if (err) {
            console.log('FAILED RUN _trainModel ' + corpusFileName);
            callback(err);
          } else {
            console.log('SUCCESS RUN _trainModel ' + corpusFileName);
            callback(null);
          }
        });
      }
    });
  });
}

const getModelDescriptorListFromDB = function(callback) {
  // TODO: HILAR FINO - version value for PythonFiles only object, somewhere as a constant?
  PythonFiles.findOne({ version: '12345' }, function (err, pythonFilesData) {
    if (err) {
      console.log('FAILED getModelDescriptorListFromDB');
      callback(null);
    } else {
      const modelDescriptorList = pythonFilesData ? pythonFilesData.modelDescriptorList : '';
      callback(modelDescriptorList);
    }
  });
};

const modelController = {
  startModelDaemon,
  getModelDescriptorListFromDB,
};

module.exports = modelController;