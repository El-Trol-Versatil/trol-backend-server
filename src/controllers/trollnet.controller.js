const Trollnet = require('../models/trollnet.model.js'),
  {CreationStatus, TrainingStatus} = require('../constants/trollnet.constants.js'),
  botController = require('./bot.controller.js'),
  threadController = require('./thread.controller.js'),
  {updateCreationStatus, updateTrainingStatus} = require('../helpers/trollnet.helper.js'),
  Utils = require('../helpers/utils.helper.js'),
  Python = require('../providers/scripts/python.service.js');

const DAEMON_INTERVAL_TIME = 30000;
let trollnetsWaitingForTraining = [];

const startTrollnetDaemon = function () {
  setTimeout(function() {
    // Check on start if any stored trollnet is untrained
    Trollnet.find({ creationStatus: CreationStatus.CREATED, trainingStatus: { $lt: TrainingStatus.TRAINED } }, '-_id -__v', function (err, storedTrollnets) {
      _checkUntrainedTrollnets(storedTrollnets);
    });
  }, DAEMON_INTERVAL_TIME);
}

//GET - Return all trollnets in the DB
const getAllTrollnets = function (req, res) {
  Trollnet.find({}, '-_id -__v', function (err, trollnets) {
    if (err) {
      console.log('FAILED GET getAllTrollnets');
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS GET getAllTrollnets');
      res.status(200).jsonp(trollnets);
    }
  });
};

//GET - Return a trollnet with specified ID
const getTrollnetById = function (req, res) {
  Trollnet.findOne({ id: req.params.id }, function (err, trollnet) {
    if (err) {
      console.log('FAILED GET getTrollnetById ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      const object = trollnet.toObject();
      delete object._id;
      delete object.__v;
      console.log('SUCCESS GET getTrollnetById ' + req.params.id);
      res.status(200).jsonp(object);
    }
  });
};

//POST - Create a new trollnet with specified parameters
const addTrollnet = function (req, res) {
  const generatedId = Utils.generateId();
  let newTrollnet = new Trollnet({
    id: 'trollnet' + generatedId,
    isActive: false,
    creationStatus: 1,
    trainingStatus: 0,
    botList: [],
    properties: req.body
  });
  newTrollnet.save(function (err, trollnet) {
    if (err) {
      console.log('FAILED POST addTrollnet ' + req.body.customName);
      res.status(500).send(err.message);
    } else {
      const object = trollnet.toObject();
      delete object._id;
      delete object.__v;
      console.log('SUCCESS POST addTrollnet ' + req.body.customName);
      res.status(200).jsonp(object);
      _createTrollnetBots(newTrollnet);
    }
  });
}

//DELETE - Delete a trollnet with specified ID
const deleteTrollnet = function (req, res) {
  Trollnet.findOneAndRemove({ id: req.params.id }, function (err, trollnet) {
    botController.deleteBotArray(trollnet.botList, function (err) {
      if (err) {
        console.log('FAILED DELETE deleteTrollnet ' + req.params.id);
        res.status(500).send(err.message);
      } else {
        console.log('SUCCESS DELETE deleteTrollnet ' + req.params.id);
        res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + ' deleted sucessfully' });
      }
    });
  });
};

//POST - Return the status of a list of trollnets
const getUntrainedTrollnetsStatus = function (req, res) {
  Trollnet.find({ id: { $in: req.body.untrainedIdList } }, '-_id -__v', function (err, storedTrollnets) {
    if (err) {
      console.log('FAILED GET getUntrainedTrollnetsStatus');
      res.status(500).send(err.message);
    } else {
      const mappedTrollnets = storedTrollnets.map(function(trollnet) {
        return {
          id: trollnet.id,
          creationStatus: trollnet.creationStatus,
          trainingStatus: trollnet.trainingStatus
        };
     });
      console.log('SUCCESS GET getUntrainedTrollnetsStatus');
      res.status(200).jsonp(mappedTrollnets);
    }
  });
};

//PUT '/rename/:id' - Rename a trollnet with specified ID
const renameTrollnet = function (req, res) {
  Trollnet.update({ id: req.params.id }, { $set: { 'properties.customName': req.body.newName } }, function (err) {
    if (err) {
      console.log('FAILED PUT renameTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS PUT renameTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + ' renamed sucessfully' });
    }
  })
};

//PUT '/activate/:id' - Activate a trollnet with specified ID
const activateTrollnet = function (req, res) {
  Trollnet.update({ id: req.params.id }, { $set: { isActive: true } }, function (err) {
    if (err) {
      console.log('FAILED PUT activateTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS PUT activateTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + ' activated sucessfully' });
      _prepareTrollnetConversation(req.params.id, req.body.targetAccount);
    }
  })
};

//PUT '/deactivate/:id' - Deactivate a trollnet with specified ID
const deactivateTrollnet = function (req, res) {
  Trollnet.update({ id: req.params.id }, { $set: { isActive: false } }, function (err) {
    if (err) {
      console.log('FAILED PUT deactivateTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS PUT deactivateTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + ' deactivated sucessfully' });
    }
  })
};

// Check periodically if any is waiting for training.
const _checkUntrainedTrollnets = function(trainingSet) {
  console.log('...Interval call... _checkUntrainedTrollnets');
  const finalTrainingSet = (trainingSet)
    ? [...trollnetsWaitingForTraining, ...trainingSet]
    : [...trollnetsWaitingForTraining];
  trollnetsWaitingForTraining = [];
  if (finalTrainingSet && finalTrainingSet.length) {
    // Launch with a copy of it, so the full algorithm is closed to the list at that moment.
    _followTrollnetTraining(finalTrainingSet, 0, [], function() {
      console.log('FINISHED _checkUntrainedTrollnets, covered ' + finalTrainingSet.length);
      // When all nets have been trained, wait a small time to:
      setTimeout(_checkUntrainedTrollnets, DAEMON_INTERVAL_TIME);
    });
  } else {
    setTimeout(_checkUntrainedTrollnets, DAEMON_INTERVAL_TIME);
  }
};

const _followTrollnetTraining = function(trollnets, index, failedTrainings, finalCallback) {
  if (trollnets.length === 0) {
    finalCallback();
  } else {
    const trollnetToTrain = trollnets[index];
    _teachTrollnet(trollnetToTrain.id, function (err) {
      if (err) {
        !!err && failedTrainings.push(trollnetToTrain);
      }
      if (index === trollnets.length - 1) {
        trollnetsWaitingForTraining = [...trollnetsWaitingForTraining, ...failedTrainings];
        finalCallback();
      } else {
        index = index + 1;
        _followTrollnetTraining(trollnets, index, failedTrainings, finalCallback);
      }
    });
  }
};

//RUN -Teach all the bots of the trollnet in what they like/dislike
const _teachTrollnet = function(netId, callback) {
  console.log('RUNNING _teachTrollnet ' + netId);
  updateTrainingStatus(netId, 1);
  Trollnet.findOne({ id: netId }, function (err, trollnet) {
    const object = trollnet.toObject();
    botController.teachBotArray(netId, object.botList, function (err) {
      if (err) {
        console.log('FAILED _teachTrollnet ' + netId + ': ' + err);
        updateTrainingStatus(netId, TrainingStatus.FAILED, err);
        callback(err);
      } else {
        console.log('SUCCESS _teachTrollnet ' + netId);
        updateTrainingStatus(netId, TrainingStatus.TRAINED);
        callback(null);
      }
    });
  });
};

const _createTrollnetBots = function (trollnet) {
  botController.createBotArray(trollnet.id, trollnet.properties, function (err, botList) {
    if (err) {
      console.log('FAILED createBotArray ' + trollnet.id + ': ' + err);
      updateCreationStatus(trollnet.id, CreationStatus.FAILED, err);
    } else {
      Trollnet.update({ id: trollnet.id }, { $set: { botList } }, function (err) {});
      Python.linkAccountsToBots(botList, function(err, assignedBots) {
        if (err) {
          console.log('FAILED linkAccountsToBots ' + trollnet.id + ': ' + err);
          updateCreationStatus(trollnet.id, CreationStatus.FAILED, err);
        } else {
          updateCreationStatus(trollnet.id, CreationStatus.CREATED);
          _addUntrainedTrollnet(trollnet);
        }
      });
    }
  });
};

const _addUntrainedTrollnet = function(trollnet) {
  if (trollnetsWaitingForTraining.indexOf(trollnet) === -1) {
    trollnetsWaitingForTraining.push(trollnet);
  }
};

const _prepareTrollnetConversation = function(netId, twitterAccountId) {
  _listenToTwitterAccount(twitterAccountId, function (messageId, messageContent) {
    if (messageId) {
      // TODO: should find trollnet this be done after or before we receive the tweet
      Trollnet.findOne({ id: netId }, function (err, trollnet) {
        if (!err) {
          const participatingTrollnet = trollnet.toObject();
          threadController.createConversation(netId, messageContent, messageId, participatingTrollnet.botList);
        }
      });
    }
  });
};

const _listenToTwitterAccount = function(twitterAccountId, callback) {
  Python.listenToTwitterAccount(twitterAccountId, function(err, messageId, messageContent) {
    if (err) {
      console.log('FAILED _listenToTwitterAccount');
      callback();
    } else {
      callback(messageId, messageContent);
    }
  });
};


const trollnetController = {
  startTrollnetDaemon,
  getAllTrollnets,
  getTrollnetById,
  addTrollnet,
  deleteTrollnet,
  getUntrainedTrollnetsStatus,
  renameTrollnet,
  activateTrollnet,
  deactivateTrollnet,
};

module.exports = trollnetController;