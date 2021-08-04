const PythonFiles = require('../models/pythonFiles.model.js'),
  CorpusController = require('./corpus.controller.js'),
  Python = require('../providers/scripts/python.service.js'),
  Utils = require('../helpers/utils.helper.js');

const ITERATIONS_DEFAULT = 50,
  CHECK_NEW_MODEL_INTERVAL_TIME = 60000;

const modelDaemon = function () {
  setInterval(_checkPendingCorpuses, CHECK_NEW_MODEL_INTERVAL_TIME);
}

const _checkPendingCorpuses = function() {
  console.log('...Interval call... _checkPendingCorpuses');
  CorpusController.getAllNewCorpuses(function(corpusArray) {
    if (corpusArray) {
      _followCorpusTraining(corpusArray, 0, corpusArray.length, function () {
        console.log('SUCCESS RUN _checkPendingCorpuses');
      });
    }
  });
}

// Recursive method that will call itself for each following model to be trained from a corpus.
const _followCorpusTraining = function(corpusArray, corpusIndex, totalCorpuses, callback) {
  const corpus = corpusArray[corpusIndex];
  _trainModel(corpus.path, function(err) {
    if (!err) {
      CorpusController.markAsUsed(corpus.id);
    }
    if (corpusIndex < totalCorpuses - 1) {
      corpusIndex = corpusIndex + 1;
      _followCorpusTraining(corpusArray, corpusIndex, totalCorpuses, callback);
    } else {
      callback();
    };
  });
}

const _trainModel = function(corpusPath, callback) {
  getModelDescriptorListFromDB(function (modelDescriptorListDB) {
    const modelDescriptorList = modelDescriptorListDB || '',
      generatedId = Utils.generateId(),
      modelId = 'model' + generatedId;
    Python.trainModel(modelId,
      corpusPath,
      modelDescriptorList,
      ITERATIONS_DEFAULT, function (err, updatedModelDescriptorList) {
      if (err) {
        console.log('FAILED RUN _trainModel ' + corpusPath);
        callback(err);
      } else {
        // TODO: HILAR FINO - version value for PythonFiles only object, somewhere as a constant?
        PythonFiles.update({ version: '12345' }, { $set: { modelDescriptorList: updatedModelDescriptorList } }, function (err, corpus) {
          if (err) {
            console.log('FAILED RUN _trainModel ' + corpusPath);
            callback(err);
          } else {
            console.log('SUCCESS RUN _trainModel ' + corpusPath);
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
      const object = pythonFilesData.toObject();
      callback(object.modelDescriptorList);
    }
  });
};

const modelController = {
  modelDaemon,
  getModelDescriptorListFromDB,
};

module.exports = modelController;