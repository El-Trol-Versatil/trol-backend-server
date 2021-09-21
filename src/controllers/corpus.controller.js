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
  FileSystem.onNewFileAdded(corpusesFolder, avoidSubPath, function(corpusPath) {
    _createCorpus(corpusPath, function(err) {
      if (err) {
        console.log('FAILED onNewFileAdded could not save path ' + corpusPath);
      } else {
        console.log('SUCCESS onNewFileAdded saved new corpus ' + corpusPath);
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
  newCorpus.save(function (err) {
    if (err) {
      console.log('FAILED to save _createCorpus ' + fileName);
      callback(err);
    } else {
      callback(null);
    }
  });
};

const getAllNewCorpuses = function(callback) {
  Corpus.find({ isNewCorpus: true }, '-_id -__v', function (err, corpuses) {
    if (err) {
      callback(null);
    } else {
      callback(corpuses);
    }
  });
};

const markAsUsed = function(id, callback) {
  Corpus.update({ id }, { $set: { isNewCorpus: false } }, function (err) {
    if (err) {
      callback(err);
    } else {
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