const Trollnet = require('../models/trollnet.model.js'),
  {Training} = require('../constants/trollnet.constants.js'),
  botController = require('./bot.controller.js'),
  modelController = require('./model.controller.js'),
  threadController = require('./thread.controller'),
  Utils = require('../helpers/utils.helper.js');

const DAEMON_INTERVAL_TIME = 15000;
const trollnetsWaitingForTraining = [];

const initializeTrollnets = function () {
  // TODO. Still nothing needed.
}

const trollnetDaemon = function () {
  console.log('Starting trollnetDaemon...');
  _checkUntrainedTrollnets();
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
    status: Training.UNTRAINED,
    properties: req.body
  });
  botController.createBotArray(newTrollnet.properties, function (err, botList) {
    if (err) {
      console.log('FAILED POST addTrollnet ' + req.body.customName);
      res.status(500).send(err.message);
    } else {
      newTrollnet.botList = botList;
      newTrollnet.save(function (err, trollnet) {
        if (err) {
          console.log('FAILED POST addTrollnet ' + req.body.customName);
          res.status(500).send(err.message);
        } else {
          _addUntrainedTrollnet(trollnet);
          const object = trollnet.toObject();
          delete object._id;
          delete object.__v;
          console.log('SUCCESS POST addTrollnet ' + req.body.customName);
          res.status(200).jsonp(object);
        }
      });
    }
  });
};

//RUN -Teach all the bots of the trollnet in a specific topic
const _teachTrollnet = function(netId, topic, callback) {
  Trollnet.findOne({ id: netId }, function (err, trollnet) {
    if (err) {
      console.log('FAILED RUN _teachTrollnet. Not found ' + netId);
      callback(err);
    } else {
      const object = trollnet.toObject();
      botController.teachBotArray(object.botList, topic, function (err) {
        if (err) {
          console.log('FAILED RUN _teachTrollnet ' + netId + 'topic ' + topic);
          console.log('Error is: ' + err.message);
          callback(err);
        } else {
          Trollnet.update({ id: netId }, { $set: { status:Training.READY } }, function (err) {
            if (err) {
              console.log('FAILED RUN _teachTrollnet ' + netId + 'topic ' + topic);
              callback(err);
            } else {
              console.log('SUCCESS RUN _teachTrollnet ' + netId + 'topic ' + topic);
              callback(null);
            }
          })
        }
      });
    }
  });
};

//DELETE - Delete a trollnet with specified ID
const deleteTrollnet = function (req, res) {
  Trollnet.deleteOne({ id: req.params.id }, function (err) {
    if (err) {
      console.log('FAILED DELETE deleteTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS DELETE deleteTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + ' deleted sucessfully' });
    }
  });
};

//PUT '/rename/:id' - Rename a trollnet with specified ID
const renameTrollnet = function (req, res) {
  Trollnet.update({ id: req.params.id }, { $set: { properties: { customName: req.body.newName } } }, function (err) {
    if (err) {
      console.log('FAILED PUT renameTrollnet ' + req.params.id);
      res.status(500).send(err.message);
    } else {
      console.log('SUCCESS PUT renameTrollnet ' + req.params.id);
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + 'renamed sucessfully' });
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
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + 'activated sucessfully' });
      threadController.createConversation(req.params.id);
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
      res.status(200).jsonp({ message: 'Trollnet ' + req.params.id + 'deactivated sucessfully' });
      _launchTrollnetConversation();
    }
  })
};

const _launchTrollnetConversation = function(netId) {
  Trollnet.findOne({ id: netId }, function (err, trollnet) {
    if (!err) {

      // TODO: TOPIC??
      const topic = '';

      threadController.createConversation(trollnet.topic, trollnet.botList);
    }
  });
}

const _addUntrainedTrollnet = function(trollnet) {
  trollnetsWaitingForTraining.push(trollnet);
}

// Check on start if any stored trollnet is untrained, and then check periodically if any is waiting for training.
const _checkUntrainedTrollnets = function() {
  Trollnet.find({ status: Training.UNTRAINED }, '-_id -__v', function (err, storedTrollnets) {
    const trainingSet = (storedTrollnets)
      ? [...trollnetsWaitingForTraining, ...storedTrollnets]
      : [...trollnetsWaitingForTraining];
    trollnetsWaitingForTraining = [];
    // Launch with a copy of it, so the full algorythm is closed to the list at that moment.
    _launchSetOfTraining(trainingSet);
  });

}

const _launchSetOfTraining = function (untrainedTrollnets) {
  _trainTrollnetsOneByOne(untrainedTrollnets, 0, [], function() {
  // When all nets have been trained, wait a small time to on final success:
  setTimeout(_launchSetOfTraining, DAEMON_INTERVAL_TIME, [trollnetsWaitingForTraining]);
  });
}

const _trainTrollnetsOneByOne = function(trollnets, index, failedTrainings, finalCallback) {
  if (trollnets.length === 0) {
    finalCallback();
  } else {
  console.log('...Interval call... _trainTrollnetsOneByOne');
  const trollnetToTrain = trollnets[index],
    topic = trollnetToTrain.properties.topic, // TODO: connect this properly, where is the data?
    keywords = trollnetToTrain.properties.keywords; // TODO: connect this properly, where is the data?
  Trollnet.update({ id: trollnetToTrain.id }, { $set: { status:Training.IN_PROGRESS } }, () => {});
  modelController.trainModel(topic, keywords, function (err) {
    if (err) {
      Trollnet.update({ id: trollnetToTrain.id }, { $set: { status:Training.FAILED } }, () => {});
      failedTrainings.push(trollnetToTrain);
      _trainTrollnetsOneByOne(trollnets, index++, failedTrainings, finalCallback);
    } else {
      _teachTrollnet(trollnetToTrain.id, topic, function (err) {
        if (err) {
          Trollnet.update({ id: trollnetToTrain.id }, { $set: { status:Training.FAILED } }, () => {});
          failedTrainings.push(trollnetToTrain);
          _trainTrollnetsOneByOne(trollnets, index++, failedTrainings, finalCallback);
        } else {
          // TODO: call again the algorythm with next trollnet
          if (index === trollnets.length - 1) {
            console.log('SUCCESS RUN _trainTrollnetsOneByOne completed');
            trollnetsWaitingForTraining = [...trollnetsWaitingForTraining, ...failedTrainings];
            finalCallback();
          } else {
            console.log('SUCCESS RUN _trainTrollnetsOneByOne trained index ' + index);
            _trainTrollnetsOneByOne(trollnets, index++, failedTrainings, finalCallback);
          }
        }
      });
    }
  });
}

const trollnetController = {
  initializeTrollnets,
  trollnetDaemon,
  getAllTrollnets,
  getTrollnetById,
  addTrollnet,
  deleteTrollnet,
  renameTrollnet,
  activateTrollnet,
  deactivateTrollnet
};

module.exports = trollnetController;