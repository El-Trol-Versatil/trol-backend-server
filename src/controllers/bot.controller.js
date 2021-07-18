const Bot = require('../models/bot.model.js'),
  Python = require('../providers/scripts/python.service.js');

const initializeBots = function () {
  // TODO. Still nothing needed.
}

const botDaemon = function () {
  // TODO. Still nothing needed.
}

//RUN - Create an array of bots with some parameters
// Returns the list of ids that identifies all the bots in the array
const createBotArray = function(params, callback) {
  const botList = [];
  for (let i = 0, len = params.netsize.value; i < len; i++) {
    _createBot(function (err, generatedId) {
      if (!err) {
        botList.push(generatedId);
      } 
    });
  }
  console.log('SUCCESS RUN createBotArray');
  callback(null, botList);
};

//RUN - Train a given bot
const _createBot = function(callback) {
  const generatedId = Math.floor(Math.random() * (99999999 - 10000000)) + 10000000;
  Python.createBot(generatedId, function (err, results) {
    if (err) {
      console.log('FAILED RUN createBot ' + generatedId);
      callback(err, null);
    } else {
      let newBot = new Bot({
        id: 'bot' + generatedId,
        botName: 'John Doe ' + generatedId,
        creationDate: new Date(),
        properties: {}
      });
      newBot.save(function (err, bot) {
        if (err) {
          console.log('FAILED RUN createBot ' + newBot.botName);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN createBot ' + newBot.botName);
          callback(null, newBot.id);
        }
      });
    }
  });
};

//RUN - Train a given bot
const trainBotArray = function(botList, callback) {
  botList.forEach(bot => {
    _trainBot(bot.id, function (err) {
    });
  });
  console.log('SUCCESS RUN trainBotArray');
  callback(null);
};

//RUN - Train a given bot
const _trainBot = function(id, callback) {
  Python.trainBot(id, function (err, object) {
    if (err) {
      console.log('FAILED RUN trainBot ' + id);
      callback(err, null);
    } else {
      Bot.update({ id }, {
        $set: {
          lastTrained: new Date(),
          trainedObject: object
        }
      }, function (err) {
        if (err) {
          console.log('FAILED RUN trainBot ' + id);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN trainBot ' + id);
          callback(null, id);
        }
      });
    }
  });
};

//RUN - Retrain a given bot
const reTrainBot = function(id, callback) {
  Python.reTrainBot(bot, options, function (err, object) {
    if (err) {
      console.log('FAILED RUN trainBot ' + id);
      callback(err, null);
    } else {
      Bot.update({ id }, {
        $set: {
          lastTrained: new Date(),
          trainedObject: object
        }
      }, function (err) {
        if (err) {
          console.log('FAILED RUN trainBot ' + id);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN trainBot ' + id);
          callback(null, id);
        }
      });
    }
  });
};

//RUN - Ask a bot for a conversation message
const answerThread = function(botId, topic, type, callback) {
  Bot.findOne({ id: botId }, function (err, bot) {
    if (err) {
      console.log('FAILED RUN answerThread no bot in DB with id ' +botId);
      callback(err, null);
    } else {
      const botObject = bot.toObject();
      Python.answerThread(botObject.trainedObject, topic, type, function (err, answer) {
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
  initializeTrollnets,
  trollnetDaemon,
  createBotArray,
  trainBotArray,
  answerThread,
};

module.exports = trollnetController;