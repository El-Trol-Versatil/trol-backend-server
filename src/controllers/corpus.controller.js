const FileSystem = require('../providers/filesystem/filesystem.service.js'),
  Corpus = require('../models/corpus.model.js'),
  Utils = require('../helpers/utils.helper.js');

// TODO:  HILAR FINO - adjust corpusesFolder to real value
const corpusesFolder = '/corpuses';

const corpusDaemon = function () {
  FileSystem.onNewFileAdded(corpusesFolder, function(corpusPath) {
    _createCorpus(corpusPath, function(err) {
      if (err) {
        console.log('FAILED RUN onNewFileAdded path ' + corpusPath);
      } else {
        console.log('SUCCESS RUN onNewFileAdded path ' + corpusPath);
      }
    });
  });
 }

const _createCorpus = function(path, callback) {
  const generatedId = Utils.generateId();
  let newCorpus = new Corpus({
    id: 'corpus' + generatedId,
    path: path,
    isNewCorpus: true,
  });
  newCorpus.save(function (err, corpus) {
    if (err) {
      console.log('FAILED RUN _createCorpus ' + path);
      callback(null);
    } else {
      console.log('SUCCESS RUN _createCorpus ' + path);
      callback(path);
    }
  });
};

const getAllNewCorpuses = function(callback) {
  Corpus.find({ isNewCorpus: true }, '-_id -__v', function (err, corpuses) {
    if (err) {
      console.log('FAILED GET getAllNewCorpuses');
      callback(null);
    } else {
      console.log('SUCCESS GET getAllNewCorpuses');
      callback(corpuses);
    }
  });
};

const markAsUsed = function(id, callback) {
  Corpus.update({ id }, { $set: { isNewCorpus: false } }, function (err) {
    if (err) {
      console.log('FAILED RUN markAsUsed ' + id);
      callback(err);
    } else {
      console.log('SUCCESS RUN markAsUsed ' + id);
      callback(null);
    }
  });
};

const corpusController = {
  corpusDaemon,
  getAllNewCorpuses,
  markAsUsed,
};

module.exports = corpusController;