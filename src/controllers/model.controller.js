const Model = require('../models/model.model.js'),
  Corpus = require('../models/corpus.model.js'),
  Python = require('../providers/scripts/python.service.js'),
  Utils = require('../helpers/utils.helper.js');

const modelDaemon = function () {
  // TODO. Still nothing needed.
}

const createModel = function(topic, callback) {
  // TODO do this
}

const trainModel = function(topic, keywords, callback) {
  const tempCorpusName = 'base';
  Corpus.findOne({ name: tempCorpusName }, function (err, corpus) {
    if (err) {
      console.log('FAILED trainModel get corpus with name ' + tempCorpusName);
      callback(err);
    } else {
      Python.trainModel(topic, corpus.textedJson, keywords, function (err, answer) {
        if (err) {
          console.log('FAILED RUN trainModel ' + topic);
          callback(err);
        } else {
          const generatedId = Utils.generateId();
          let newModel = new Model({
            id: 'model' + generatedId,
            topic: topic,
            creationDate: new Date(),
            AIObject: answer,
            keywords: keywords,
          });
          newModel.save(function (err, bot) {
            if (err) {
              console.log('FAILED RUN trainModel ' + topic);
              callback(err);
            } else {
              console.log('SUCCESS RUN trainModel ' + topic);
              callback(null);
            }
          });
        }
      });
    }
  });
}

const _getModelFromDB = function(topic, callback) {
  Model.findOne({ topic: topic }, function (err, model) {
    if (err) {
      console.log('FAILED _getModelFromDB with topic ' + topic);
      callback(null);
    } else {
      callback(model.toObject());
    }
  });
};

const getModelFromDB = _getModelFromDB;

const trollnetController = {
  modelDaemon,
  createModel,
  getModelFromDB,
  trainModel,
};

module.exports = trollnetController;