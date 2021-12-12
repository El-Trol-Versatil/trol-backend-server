const Trollnet = require('../models/trollnet.model.js');

const updateCreationStatus = function(trollnetId, creationStatus, error) {
  Trollnet.update({ id: trollnetId }, { $set: { creationStatus, error } }, function (err) {});
}

const updateTrainingStatus = function(trollnetId, trainingStatus, error) {
  Trollnet.update({ id: trollnetId }, { $set: { trainingStatus, error } }, function (err) {});
}

const trollnetHelper = {
  updateCreationStatus,
  updateTrainingStatus,
};

module.exports = trollnetHelper;