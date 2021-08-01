const Bot = require('../models/bot.model.js'),
  ModelController = require('../controller/model.controller.js'),
  Python = require('../providers/scripts/python.service.js'),
  Utils = require('../helpers/utils.helper.js'),

const initializeBots = function () {
  // TODO. Still nothing needed.
}

const botDaemon = function () {
  // TODO. Still nothing needed.
}

const _getBotFromDB = function(id, callback) {
  Bot.findOne({ id: id }, function (err, bot) {
    if (err) {
      console.log('FAILED _getBotFromDB with id ' + id);
      callback(null);
    } else {
      callback(bot.toObject());
    }
  });
};

const getBotFromDB = _getBotFromDB;

//RUN - Create an array of bots with some parameters
// Returns the list of ids that identifies all the bots in the array
const createBotArray = function(params, callback) {
  const botList = [];
  for (let i = 0, len = params.netsize.value; i < len; i++) {
    _createBot(function (err, generatedId) {
      if (!err) {
        botList.push(generatedId);
      }
      if (i === len - 1) { // TODO: This may not work
        console.log('SUCCESS RUN createBotArray');
        callback(null, botList);
      }
    });
  }
};

//RUN - Train a given bot
const _createBot = function(callback) {
  const generatedId = Utils.generateId();
    generatedName = 'Name' + generatedId;
  Python.createBot(generatedId, generatedName, function (err, answer) {
    if (err) {
      console.log('FAILED RUN createBot ' + generatedId);
      callback(err, null);
    } else {
      let newBot = new Bot({
        id: 'bot' + generatedId,
        botName: generatedName,
        creationDate: new Date(),
        botObject: answer,
        properties: {}
      });
      newBot.save(function (err, bot) {
        if (err) {
          console.log('FAILED RUN createBot ' + generatedId);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN createBot ' + generatedId);
          callback(null, generatedId);
        }
      });
    }
  });
};

//RUN - Train a given bot
const teachBotArray = function(botList, topic, callback) {
  ModelController.getModelFromDB(topic, function (err, model) {
    if (!model) {
      console.log('FAILED RUN teachBotArray no model in DB with id ' + topic);
      callback('error');
    } else {
      let finishedTrainingCounter = 0;
      botList.forEach(bot => {
        _teachBot(bot.id, model, function (err) {
          finishedTrainingCounter++;
          if (finishedTrainingCounter === botList.length) {
            console.log('SUCCESS RUN teachBotArray in ' + topic);
            callback(null);
          }
        });
      });
    }
  });
};

//RUN - Teach a given bot about a specific topic
const _teachBot = function(id, model, callback) {
  _getBotFromDB(botId, function (bot) {
    if (!bot) {
      callback(err);
      console.log('FAILED RUN _teachBot no bot in DB with id ' + id);
    } else {
      Python.teachBot(bot.AIObject, model.AIObject, function (err, answer) {
        if (err) {
          console.log('FAILED RUN _teachBot ' + id + ' in ' + model.topic);
          callback(err);
        } else {
          Bot.update({ id }, {
            $set: {
              lastTrained: new Date(),
              AIObject: answer
            }
          }, function (err) {
            if (err) {
              console.log('FAILED RUN _teachBot ' + id + ' in ' + model.topic);
              callback(err);
            } else {
              console.log('SUCCESS RUN _teachBot ' + id + ' in ' + model.topic);
              callback(null);
            }
          });
        }
      });
    }
  });
};

//RUN - Ask a bot for a conversation message
const answerThread = function(botId, topic, filterParams, messageToReply, callback) {
  _getBotFromDB(botId, function (bot) {
    if (!bot) {
      console.log('FAILED RUN answerThread no bot in DB with id ' + botId);
      callback(err, null);
    } else {
      Python.answerThread(bot.AIObject, topic, filterParams, messageToReply, function (err, answer) {
        if (err) {
          console.log('FAILED RUN answerThread ' + botId);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN answerThread ' + botId);
          callback(null, answer)
        }
      });
    }
  });
}

const trollnetController = {
  getBotFromDB,
  initializeTrollnets,
  trollnetDaemon,
  createBotArray,
  teachBotArray,
  answerThread,
};

module.exports = trollnetController;