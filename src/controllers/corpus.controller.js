const FileSystem = require('../providers/filesystem/filesystem.service.js'),
  Corpus = require('../models/corpus.model.js'),
  Utils = require('../helpers/utils.helper.js');

  const corpusesFolder = String.raw`D:\Proyectos\etv-tfg\ETV-models-and-bots\ETV\rawCorpus`,
  avoidSubPath = String.raw`D:\Proyectos\etv-tfg\ETV-models-and-bots\ETV\rawCorpus\tokenizedRawCorpus`;

const _filterFileName = function(filePath) {
  const stringArray = filePath.split(corpusesFolder),
    splitRelativePath = stringArray[1].split("\\");
  return splitRelativePath[1];
}

const startCorpusDaemon = function () {
  console.log('startCorpusDaemon...');
  FileSystem.onNewFileAdded(corpusesFolder, avoidSubPath, function(corpusPath) {
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
  const generatedId = Utils.generateId(),
    fileName = _filterFileName(path);
  let newCorpus = new Corpus({
    id: 'corpus' + generatedId,
    fileName: fileName,
    isNewCorpus: true,
  });
  newCorpus.save(function (err, corpus) {
    if (err) {
      console.log('FAILED RUN _createCorpus ' + fileName);
      callback(err);
    } else {
      console.log('SUCCESS RUN _createCorpus ' + fileName);
      callback(null);
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
  startCorpusDaemon,
  getAllNewCorpuses,
  markAsUsed,
};

module.exports = corpusController;